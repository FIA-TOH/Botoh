import { Circuit } from "../../circuits/Circuit";
import { PlayerInfo } from "../changePlayerState/playerList";
import { raceTimers } from "./raceTimers";

// Event default: 13.3333333 minutes. Temporary test interval (~100 seconds).
export const DEFAULT_DAY_NIGHT_MINUTES = 1.66666666;
type Scores = NonNullable<ReturnType<RoomObject["getScores"]>>;
type Disc = NonNullable<ReturnType<RoomObject["getDiscProperties"]>>;
type Variants = { day: string; night: string; initial: "day" | "night" };

type Dependencies = {
  enabled: () => boolean;
  circuit: () => Circuit;
  variants: () => Variants | null;
  players: Record<string, PlayerInfo>;
  intervalMinutes?: number;
  error: (error: unknown) => void;
};

// Lighting variants must have identical collision geometry, physics and disc
// indices. Never teleport saved discs into a physically different circuit.
export function physicalMapSignature(raw: string): string {
  const { name, bg, ...map } = JSON.parse(raw);
  function clean(value: any): any {
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.keys(value).sort()
        .filter((key) => key !== "color" && key !== "_selected")
        .map((key) => [key, clean(value[key])]));
    }
    return value;
  }
  return JSON.stringify(clean(map));
}

export function findDayNightVariants(
  circuits: Circuit[], filenames: string[], currentIndex: number,
): Variants | null {
  const file = filenames[currentIndex];
  const match = file?.match(/^(.*)(day|night)\.hbs$/i);
  if (!match) return null;
  const dayIndex = filenames.findIndex((name) => name.toLowerCase() === `${match[1]}day.hbs`.toLowerCase());
  const nightIndex = filenames.findIndex((name) => name.toLowerCase() === `${match[1]}night.hbs`.toLowerCase());
  if (dayIndex < 0 || nightIndex < 0) return null;
  return { day: circuits[dayIndex].map, night: circuits[nightIndex].map, initial: match[2].toLowerCase() as "day" | "night" };
}

export function installDayNightCycle(room: RoomObject, deps: Dependencies) {
  const interval = (deps.intervalMinutes ?? DEFAULT_DAY_NIGHT_MINUTES) * 60;
  if (!Number.isFinite(interval) || interval <= 0) throw new Error("Invalid WEC day/night interval");
  const nativeScores = room.getScores.bind(room);
  const nativeAvatar = room.setPlayerAvatar.bind(room);
  const avatars = new Map<number, string | null>();
  let offset = 0;
  let redOffset = 0;
  let blueOffset = 0;
  let nextChange = interval;
  let variants: Variants | null = null;
  let phase: "day" | "night" = "day";
  let disabled = false;
  let transition: {
    stage: "stopping" | "loading" | "starting" | "settling";
    scores: Scores;
    players: { player: PlayerObject; disc: Disc | null; data: PlayerInfo | undefined; avatar: string | null | undefined }[];
    discs: (Disc | null)[];
    startedAt: number;
    source: string;
    target: string;
    targetPhase: "day" | "night";
    rollback: boolean;
  } | null = null;
  let watchdog: NodeJS.Timeout | undefined;
  const deferred: (() => void)[] = [];

  // All 100+ score readers keep the same time origin, including pit/reaction
  // deadlines, VSC, ERS, lap histories, race results and external integrations.
  room.getScores = () => {
    if (transition) return { ...transition.scores };
    const scores = nativeScores();
    return scores ? { ...scores, time: scores.time + offset, red: scores.red + redOffset, blue: scores.blue + blueOffset } : null as any;
  };
  room.setPlayerAvatar = (id, avatar) => {
    avatars.set(id, avatar);
    nativeAvatar(id, avatar);
  };

  function reset() {
    offset = 0;
    redOffset = 0;
    blueOffset = 0;
    nextChange = interval;
    variants = null;
    disabled = false;
  }

  function armWatchdog() {
    globalThis.clearTimeout(watchdog);
    watchdog = globalThis.setTimeout(() => recover(new Error("WEC day/night transition timed out")), 5000);
  }

  function recover(error: unknown) {
    deps.error(error);
    if (!transition) return;
    if (transition.rollback) {
      // Do not silently resume a partially restored race. A normal stop runs
      // the usual cleanup if even the original stadium cannot be recovered.
      transition = null;
      disabled = true;
      raceTimers.resume();
      globalThis.clearTimeout(watchdog);
      room.stopGame();
      return;
    }
    transition.rollback = true;
    transition.target = transition.source;
    transition.targetPhase = phase;
    transition.stage = "stopping";
    armWatchdog();
    if (nativeScores()) room.stopGame();
    else loadTarget();
  }

  function loadTarget() {
    if (!transition) return;
    transition.stage = "loading";
    try { room.setCustomStadium(transition.target); }
    catch (error) { recover(error); }
  }

  function restoreDiscs() {
    const saved = transition;
    if (!saved) return;
    saved.discs.forEach((disc, index) => {
      if (!disc || index >= room.getDiscCount()) return;
      // Preserve the new lighting colors on scenery; restore its physics.
      const { color, ...physics } = disc;
      room.setDiscProperties(index, physics);
    });
    const present = new Map(room.getPlayerList().map((player) => [player.id, player]));
    saved.players.forEach(({ player, disc, avatar }) => {
      if (!present.has(player.id) || present.get(player.id)!.team !== player.team) return;
      if (disc) room.setPlayerDiscProperties(player.id, disc);
      if (avatar !== undefined) room.setPlayerAvatar(player.id, avatar);
    });
  }

  function finishTransition() {
    const saved = transition;
    const scores = nativeScores();
    if (!saved || saved.stage !== "settling" || !scores) return;
    // The engine advances/rounds physical values immediately. Equality with
    // the snapshot is not an acknowledgement and must not trigger teleports.
    offset = saved.scores.time - scores.time;
    redOffset = saved.scores.red - scores.red;
    blueOffset = saved.scores.blue - scores.blue;
    const gap = performance.now() - saved.startedAt;
    // In-memory player state and race module objects were never reset or
    // replaced: timer closures retain their original references.
    Object.values(deps.players).forEach((player) => {
      if (player) player.lastLapTimeUpdate += gap;
    });
    phase = saved.targetPhase;
    nextChange = saved.scores.time + interval;
    if (saved.rollback) disabled = true;
    transition = null;
    globalThis.clearTimeout(watchdog);
    raceTimers.resume();
    deferred.splice(0).forEach((callback) => callback());
  }

  function begin() {
    if (!variants) return;
    const scores = room.getScores();
    if (!scores) return;
    const targetPhase = phase === "day" ? "night" : "day";
    transition = {
      stage: "stopping", scores: { ...scores }, startedAt: performance.now(),
      source: variants[phase], target: variants[targetPhase], targetPhase, rollback: false,
      players: room.getPlayerList().map((player) => ({
        player: { ...player }, disc: room.getPlayerDiscProperties(player.id),
        data: deps.players[player.id], avatar: avatars.get(player.id),
      })),
      // Player discs are restored by ID, never by unstable engine indices.
      // This also avoids overwriting a newcomer with a departed player's disc.
      discs: Array.from({ length: Math.min(room.getDiscCount(), (JSON.parse(variants[phase]).discs?.length ?? 0) + 1) }, (_, index) => room.getDiscProperties(index)),
    };
    raceTimers.pause();
    armWatchdog();
    try { room.stopGame(); }
    catch (error) { recover(error); }
  }

  const onStop = room.onGameStop;
  room.onGameStop = (byPlayer) => {
    if (transition && byPlayer == null) {
      loadTarget();
      return;
    }
    if (transition) {
      // A real administrator stop takes priority over an internal restart.
      transition = null;
      globalThis.clearTimeout(watchdog);
      raceTimers.resume();
    }
    reset();
    const result = onStop?.(byPlayer);
    deferred.splice(0).forEach((callback) => callback());
    return result;
  };
  const onStadium = room.onStadiumChange;
  room.onStadiumChange = (name, byPlayer) => {
    if (transition) {
      // Same logical circuit: do not reload cut detectors, reset flags or
      // split records between day/night names.
      if (transition.stage !== "loading") return;
      if (name !== JSON.parse(transition.target).name) {
        recover(new Error("Unexpected stadium during WEC lighting transition"));
        return;
      }
      transition.stage = "starting";
      try { room.startGame(); }
      catch (error) { recover(error); }
      return;
    }
    reset();
    return onStadium?.(name, byPlayer);
  };
  const onStart = room.onGameStart;
  room.onGameStart = (byPlayer) => {
    if (transition) {
      const saved = transition;
      // Discs already exist here. Queue the one-time restoration immediately,
      // before the first simulation tick can expose the spawn position.
      saved.stage = "settling";
      try { restoreDiscs(); }
      catch (error) { recover(error); return; }
      queueMicrotask(() => {
        if (transition === saved) finishTransition();
      });
      return;
    }
    reset();
    return onStart?.(byPlayer);
  };
  const onTick = room.onGameTick;
  room.onGameTick = () => {
    if (transition) {
      return;
    }
    const scores = room.getScores();
    if (!disabled && deps.enabled() && deps.circuit()?.info.hasDayNightCycle && scores && scores.time >= nextChange) {
      try {
        if (!variants) {
          variants = deps.variants();
          if (!variants || physicalMapSignature(variants.day) !== physicalMapSignature(variants.night)) {
            throw new Error("Day/night maps are missing or have different physics");
          }
          phase = variants.initial;
        }
        begin();
        return;
      } catch (error) {
        disabled = true;
        deps.error(error);
      }
    }
    onTick?.();
  };

  // Join/leave/team changes and admin commands must see a restored running
  // world, not a temporary null score/disc while the engine swaps stadiums.
  for (const key of ["onPlayerJoin", "onPlayerLeave", "onPlayerTeamChange", "onPlayerChat", "onPlayerActivity", "onGamePause", "onGameUnpause"] as const) {
    const original = room[key] as ((...args: any[]) => any) | undefined;
    (room as any)[key] = (...args: any[]) => {
      if (transition) {
        deferred.push(() => original?.(...args));
        return key === "onPlayerChat" ? false : undefined;
      }
      return original?.(...args);
    };
  }
  return { isTransitioning: () => transition !== null };
}

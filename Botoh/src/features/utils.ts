import { CIRCUITS } from "./zones/maps";
import { Direction, HitboxBounds } from "../circuits/Circuit";
import { Teams } from "./changeGameState/teams";

export function vectorSpeed(xSpeed: number, ySpeed: number): number {
  const speed = 10 * Math.hypot(xSpeed, ySpeed);

  return speed;
}

export function getRunningPlayers(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[]
): { p: PlayerObject; disc: DiscPropertiesObject }[] {
  return playersAndDiscs.filter(
    (pad) => pad.disc !== null && pad.p.team === Teams.RUNNERS
  );
}

export function getAdmins(room: RoomObject): PlayerObject[] {
  return room.getPlayerList().filter((p) => p.admin);
}

export function validCircuitIndex(id: number): boolean {
  return id !== null && !isNaN(id) && id >= 0 && id <= CIRCUITS.length;
}

export function inHitbox(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  hitbox: HitboxBounds
): boolean {
  const { x, y } = player.disc;
  return (
    hitbox.minX <= x && x <= hitbox.maxX && hitbox.minY <= y && y <= hitbox.maxY
  );
}

export function kickPlayer(playerID: number, reason: string, room: RoomObject) {
  room.kickPlayer(playerID, reason, false);
}

export function banPlayer(playerID: number, reason: string, room: RoomObject) {
  room.kickPlayer(playerID, reason, true);
}

export const CHECK_IF_TROLLING = true;

export function checkIfTrolling(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  direction: Direction
): boolean {
  const properties = pad.disc;
  if (properties === null) return false;
  switch (direction) {
    case Direction.LEFT:
      return properties.xspeed > 0;
    case Direction.RIGHT:
      return properties.xspeed < 0;
    case Direction.UP:
      return properties.yspeed > 0;
    case Direction.DOWN:
      return properties.yspeed < 0;
  }
}
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function decodeIPFromConn(conn: string): string {
  return decodeURIComponent(conn.replace(/(..)/g, "%$1"));
}

export function serialize(number: number) {
  return parseFloat(number.toFixed(3));
}

export function someArray(array: number[]): number {
  return array.reduce((acc, value) => acc + value, 0);
}

export const timerController: {
  positionTimer: ReturnType<typeof setTimeout> | null;
} = {
  positionTimer: null,
};

export function delay(segundos: number) {
  return new Promise((resolve) => setTimeout(resolve, segundos * 1000));
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatInTimeZone(date: Date, timeZone = "America/Sao_Paulo") {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const map: Record<string, string> = {};
    for (const p of parts) {
      if (p.type !== "literal") map[p.type] = p.value;
    }

    return {
      year: map.year,
      month: map.month,
      day: map.day,
      hour: map.hour,
      minute: map.minute,
      second: map.second,
    };
  } catch (err) {
    const desiredOffsetMinutes = -3 * 60;
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const targetMs = utcMs + desiredOffsetMinutes * 60000;
    const d = new Date(targetMs);
    return {
      year: String(d.getFullYear()),
      month: pad(d.getMonth() + 1),
      day: pad(d.getDate()),
      hour: pad(d.getHours()),
      minute: pad(d.getMinutes()),
      second: pad(d.getSeconds()),
    };
  }
}

export function getTimestamp(): string {
  const now = new Date();
  const t = formatInTimeZone(now, "America/Sao_Paulo");
  return `[${t.year}-${t.month}-${t.day} ${t.hour}:${t.minute}:${t.second}]`;
}

export function formatRaceTime(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) return "00:00:00";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

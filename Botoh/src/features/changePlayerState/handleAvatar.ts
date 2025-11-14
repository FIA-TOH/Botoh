import { log } from "../discord/logger";
import { TIRE_AVATAR } from "../speed/handleSpeed";
import { tyresActivated } from "../tires&pits/tires";
import { playerList } from "./playerList";

export enum Situacions {
  ChangeTyre = "ChangeTyre",
  Ers = "Ers",
  Speed = "Speed",
  Rain = "Rain",
  Flag = "Flag",
  Null = "Null",
  CanLeavePit = "CanLeavePit",
  Correct = "Correct",
  Wrong = "Wrong",
  NeedPit = "NeedPit",
  BlowoutWarning = "BlowoutWarning",
}

const currentSituacion: Record<number, Situacions> = {};

const SITUATION_PRIORITY: Record<Situacions, number> = {
  [Situacions.Rain]: 8,
  [Situacions.Flag]: 7,
  [Situacions.CanLeavePit]: 7,
  [Situacions.Wrong]: 6,
  [Situacions.Correct]: 6,
  [Situacions.BlowoutWarning]: 5,
  [Situacions.NeedPit]: 5,
  [Situacions.Ers]: 4,
  [Situacions.Speed]: 3,
  [Situacions.ChangeTyre]: 2,
  [Situacions.Null]: 1,
};

const playerTimers: Record<
  number,
  { timeout?: NodeJS.Timeout; interval?: NodeJS.Timeout }
> = {};

function clearPlayerTimers(playerId: number) {
  if (playerTimers[playerId]?.timeout) {
    clearTimeout(playerTimers[playerId].timeout!);
  }
  if (playerTimers[playerId]?.interval) {
    clearInterval(playerTimers[playerId].interval!);
  }
  playerTimers[playerId] = {};
}

function restoreTyreOrCar(playerId: number, room: RoomObject) {
  const p = playerList[playerId];
  if (!p) return;
  const tireType = p.tires;
  if (tireType && TIRE_AVATAR[tireType] && p.showTires && tyresActivated) {
    room.setPlayerAvatar(playerId, TIRE_AVATAR[tireType]);
  } else {
    room.setPlayerAvatar(playerId, "🏎️");
  }
}

const situationHandlers: Record<
  Situacions,
  (
    player: PlayerObject,
    room: RoomObject,
    arg?: string,
    emoji?: string[],
    durations?: number[]
  ) => void
> = {
  [Situacions.Rain]: (player, room, _, emoji, durations) => {
    if (!emoji || !durations) return;
    let currentEmojiIndex = 0;

    const showNextEmoji = () => {
      if (!playerList[player.id]) return;
      room.setPlayerAvatar(player.id, emoji[currentEmojiIndex]);
      const delay = durations[currentEmojiIndex];
      currentEmojiIndex++;

      if (currentEmojiIndex < emoji.length) {
        playerTimers[player.id].timeout = setTimeout(showNextEmoji, delay);
      }
    };

    showNextEmoji();

    playerTimers[player.id].timeout = setTimeout(
      () => {
        restoreTyreOrCar(player.id, room);
        currentSituacion[player.id] = Situacions.Null;
      },
      durations.reduce((a, b) => a + b, 0)
    );
  },

  [Situacions.Flag]: (player, room, _, emoji, durations) => {
    if (!emoji || !durations) return;
    room.setPlayerAvatar(player.id, emoji[0]);

    playerTimers[player.id].timeout = setTimeout(() => {
      restoreTyreOrCar(player.id, room);
      currentSituacion[player.id] = Situacions.Null;
    }, durations[0]);
  },
  [Situacions.CanLeavePit]: (player, room) => {
    const wrongDurationSeconnds = 3;
    room.setPlayerAvatar(player.id, "🔓");

    playerTimers[player.id].timeout = setTimeout(() => {
      restoreTyreOrCar(player.id, room);
      currentSituacion[player.id] = Situacions.Null;
    }, wrongDurationSeconnds * 1000);
  },
  [Situacions.Wrong]: (player, room) => {
    const wrongDurationSeconnds = 5;
    room.setPlayerAvatar(player.id, "❌");

    playerTimers[player.id].timeout = setTimeout(() => {
      restoreTyreOrCar(player.id, room);
      currentSituacion[player.id] = Situacions.Null;
    }, wrongDurationSeconnds * 1000);
  },
  [Situacions.BlowoutWarning]: (player, room) => {
    const blowoutEmoijis = ["🛞", "💥", "⚠️", "🛞", "💥", "⚠️"];
    const emojiDurations = [750, 750, 750, 750, 750, 750];
    if (!blowoutEmoijis || !emojiDurations) return;
    let currentEmojiIndex = 0;

    const showNextEmoji = () => {
      if (!playerList[player.id]) return;
      room.setPlayerAvatar(player.id, blowoutEmoijis[currentEmojiIndex]);
      const delay = emojiDurations[currentEmojiIndex];
      currentEmojiIndex++;

      if (currentEmojiIndex < blowoutEmoijis.length) {
        playerTimers[player.id].timeout = setTimeout(showNextEmoji, delay);
      }
    };

    showNextEmoji();

    playerTimers[player.id].timeout = setTimeout(
      () => {
        restoreTyreOrCar(player.id, room);
        currentSituacion[player.id] = Situacions.Null;
      },
      emojiDurations.reduce((a, b) => a + b, 0)
    );
  },
  [Situacions.NeedPit]: (player, room) => {
    const needPitDurationSeconds = 5;
    room.setPlayerAvatar(player.id, "🛞⚠️");

    playerTimers[player.id].timeout = setTimeout(() => {
      restoreTyreOrCar(player.id, room);
      currentSituacion[player.id] = Situacions.Null;
    }, needPitDurationSeconds * 1000);
  },
  [Situacions.Correct]: (player, room) => {
    const correctDurationSeconnds = 2;

    room.setPlayerAvatar(player.id, "✅");

    playerTimers[player.id].timeout = setTimeout(() => {
      restoreTyreOrCar(player.id, room);
      currentSituacion[player.id] = Situacions.Null;
    }, correctDurationSeconnds * 1000);
  },

  [Situacions.Speed]: (player, room, arg) => {
    if (arg) room.setPlayerAvatar(player.id, arg);
  },

  [Situacions.Ers]: (player, room) => {
    const p = playerList[player.id];
    if (!p || p.speedEnabled) return;
    room.setPlayerAvatar(player.id, Math.floor(p.kers).toString());

    playerTimers[player.id].timeout = setTimeout(() => {
      restoreTyreOrCar(player.id, room);
      currentSituacion[player.id] = Situacions.Null;
    }, 6000);
  },

  [Situacions.ChangeTyre]: (player, room) => {
    restoreTyreOrCar(player.id, room);
  },

  [Situacions.Null]: (player, room) => {
    room.setPlayerAvatar(player.id, "🏎️");
  },
};

export function handleAvatar(
  situacion: Situacions,
  player: PlayerObject,
  room: RoomObject,
  arg?: string,
  emoji?: string[],
  durations?: number[]
): void {
  const p = playerList[player.id];
  if (!p) {
    log("Error on chaning the avatar.");
    return;
  }

  const current = currentSituacion[player.id] ?? Situacions.Null;

  if (
    situacion !== Situacions.ChangeTyre &&
    SITUATION_PRIORITY[situacion] < SITUATION_PRIORITY[current]
  ) {
    return;
  }

  clearPlayerTimers(player.id);
  currentSituacion[player.id] = situacion;

  const handler = situationHandlers[situacion];
  handler(player, room, arg, emoji, durations);
}

import { log } from "../discord/logger";
import { Tires, tyresActivated } from "../tires&pits/tires";
import { playerList } from "./playerList";

export enum Situacions {
  ChangeTyre = "ChangeTyre",
  Ers = "Ers",
  Speed = "Speed",
  Flag = "Flag",
  Null = "Null",
  CanLeavePit = "CanLeavePit",
  Correct = "Correct",
  Wrong = "Wrong",
  NeedPit = "NeedPit",
  BlowoutWarning = "BlowoutWarning",
  Direction = "Direction",
  Sandbag = "Sandbag",
  SafetyCar = "SafetyCar",
  LappedCar = "LappedCar",
}

export const TIRE_AVATAR: { [key in Tires]: string } = {
  SOFT: "🔴",
  MEDIUM: "🟡",
  HARD: "⚪",
  INTER: "🟢",
  WET: "🔵",
  FLAT: "⚫",
  TRAIN: "🟣",
};

const currentSituacion: Record<number, Situacions> = {};

const SITUATION_PRIORITY: Record<Situacions, number> = {
  [Situacions.Direction]: 9,
  [Situacions.Flag]: 7,
  [Situacions.CanLeavePit]: 7,
  [Situacions.Wrong]: 6,
  [Situacions.Correct]: 6,
  [Situacions.BlowoutWarning]: 5,
  [Situacions.NeedPit]: 5,
  [Situacions.Ers]: 4,
  [Situacions.Speed]: 3,
  [Situacions.Sandbag]: 2,
  [Situacions.ChangeTyre]: 1,
  [Situacions.SafetyCar]: 8,
  [Situacions.LappedCar]: 6,
  [Situacions.Null]: 0,
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

  if (p.sandbagPenalty && p.sandbagPenalty > 0) {
    room.setPlayerAvatar(playerId, "🐢");
    return;
  }

  const tireType = p.tires;

  if (tireType && TIRE_AVATAR[tireType] && p.showTires && tyresActivated) {
    room.setPlayerAvatar(playerId, TIRE_AVATAR[tireType]);
  } else {
    room.setPlayerAvatar(playerId, null);
  }
}
const situationHandlers: Record<
  Situacions,
  (
    player: PlayerObject,
    room: RoomObject,
    arg?: string,
    emoji?: string[],
    durations?: number[],
  ) => void
> = {

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
      emojiDurations.reduce((a, b) => a + b, 0),
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
    if (!p) return;
    room.setPlayerAvatar(player.id, Math.floor(p.kers).toString());

    playerTimers[player.id].timeout = setTimeout(() => {
      restoreTyreOrCar(player.id, room);
      currentSituacion[player.id] = Situacions.Null;
    }, 6000);
  },

  [Situacions.ChangeTyre]: (player, room) => {
    restoreTyreOrCar(player.id, room);
  },

  [Situacions.Direction]: (player, room, arg) => {
    if (arg) {
      room.setPlayerAvatar(player.id, arg);
    }
  },

  [Situacions.Null]: (player, room) => {
    room.setPlayerAvatar(player.id, null);
  },

  [Situacions.Sandbag]: (player, room) => {
    room.setPlayerAvatar(player.id, "");
  },

  [Situacions.SafetyCar]: (player, room) => {
    const safetyCarEmojis = ["🚗", "🚨", "🚗", "🚨", "🚗", "🚨", "🚗", "🚨"];
    const emojiDurations = [875, 875, 875, 875, 875, 875, 875, 875];
    let currentEmojiIndex = 0;

    const showNextEmoji = () => {
      if (!playerList[player.id]) return;
      room.setPlayerAvatar(player.id, safetyCarEmojis[currentEmojiIndex]);
      const delay = emojiDurations[currentEmojiIndex];
      currentEmojiIndex = (currentEmojiIndex + 1) % safetyCarEmojis.length;

      playerTimers[player.id].interval = setTimeout(showNextEmoji, delay);
    };

    showNextEmoji();

    playerTimers[player.id].timeout = setTimeout(
      () => {
        clearPlayerTimers(player.id);
        restoreTyreOrCar(player.id, room);
        currentSituacion[player.id] = Situacions.Null;
      },
      10000, // 10 seconds total
    );
  },

  [Situacions.LappedCar]: (player, room) => {
    room.setPlayerAvatar(player.id, "🔁");
    // Lapped car avatar stays until manually cleared
  },
};

export function handleAvatar(
  situacion: Situacions,
  player: PlayerObject,
  room: RoomObject,
  arg?: string,
  emoji?: string[],
  durations?: number[],
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

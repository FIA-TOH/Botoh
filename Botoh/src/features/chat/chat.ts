
import { log } from "../discord/logger";
import { DEFAULT_LANGUAGE } from "./language";
import { getPlayerLanguage, LocalizedMessageFunction } from "./messages";

const defaultLang: keyof LocalizedMessageFunction = DEFAULT_LANGUAGE;

export const MAX_PLAYER_NAME = 22;

export enum COLORS {
  BLACK = 0x000001,
  GREY = 0xC0C0C0,
  WHITE = 0xffffff,
  BLUE = 0x6987ff,
  CYAN = 0x00E3FF,
  GREEN = 0x2DF73B,
  LIGHT_GREEN = 0x80FF00,
  LIME = 0xcaff4f,
  YELLOW = 0xffff00,
  GOLD = 0xFFD700,
  DARK_YELLOW = 0x93bf0f,
  BROWN = 0xEE5454,
  DARK_BROWN = 0xCD7F32,
  ORANGE = 0xFF8F00,
  DARK_ORANGE = 0xFFB900,
  RED = 0xff0000,
  PINK = 0xFF33D0,
  PURPLE = 0xa463ff,
}

export enum FONTS {
  NORMAL = "normal",
  BOLD = "bold",
  ITALIC = "italic",
  SMALL = "small",
  SMALL_BOLD = "small-bold",
  SMALL_ITALIC = "small-italic",
}

enum SOUNDS {
  MUTE = 0,
  CHAT = 1,
  NOTIFICATION = 2,
}

export function sendMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
  color?: COLORS,
  font?: FONTS,
  sound?: SOUNDS,
) {
  if (toPlayerID) {
    const language = getPlayerLanguage(toPlayerID);
    room.sendAnnouncement(message[language], toPlayerID, color, font, sound);
  } else {
    room.getPlayerList().forEach((player) => {
      const language = getPlayerLanguage(player.id);
      room.sendAnnouncement(message[language], player.id, color, font, sound);
    });

    log(message[defaultLang] as string);
  }
}

export function sendCyanMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  sound?: SOUNDS,
) {
  room.getPlayerList().forEach((player) => {
    const language = getPlayerLanguage(player.id);
    room.sendAnnouncement(message[language], player.id, COLORS.CYAN, FONTS.BOLD, sound);
  });

  log(message[defaultLang] as string);
}

export function sendNonLocalizedSmallChatMessage(
  room: RoomObject,
  message: string,
  toPlayerID?: number,
) {
  if (!toPlayerID) {
    log(message);
  }
  room.sendAnnouncement(
    message,
    toPlayerID,
    COLORS.WHITE,
    FONTS.SMALL,
    SOUNDS.CHAT,
  );
}

export function sendErrorMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.RED,
    FONTS.BOLD,
    SOUNDS.NOTIFICATION,
  );
}

export function sendAlertMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.YELLOW,
    FONTS.BOLD,
    SOUNDS.NOTIFICATION,
  );
}

export function sendSuccessMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.GREEN,
    FONTS.BOLD,
    SOUNDS.NOTIFICATION,
  );
}

export function sendChatMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.WHITE,
    FONTS.NORMAL,
    SOUNDS.CHAT,
  );
}

export function sendSmallChatMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.WHITE,
    FONTS.SMALL,
    SOUNDS.CHAT,
  );
}

export function sendBestTimeEver(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.PURPLE,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION,
  );
}

export function sendPurpleMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.PURPLE,
    FONTS.NORMAL,
    SOUNDS.CHAT,
  );
}

export function sendBestTimeRace(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.PINK,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION,
  );
}

export function sendWorseTime(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.DARK_YELLOW,
    FONTS.NORMAL,
    SOUNDS.CHAT,
  );
}

export function sendRedMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.RED,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION,
  );
}

export function sendYellowMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.YELLOW,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION,
  );
}

export function sendGreenMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.GREEN,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION,
  );
}

export function sendBlueMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.BLUE,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION,
  );
}

export function sendBlackMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number,
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.BLACK,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION,
  );
}

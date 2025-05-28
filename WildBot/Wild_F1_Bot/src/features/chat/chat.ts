import { getPlayerLanguage, LocalizedMessageFunction } from "./messages";

export const MAX_PLAYER_NAME = 22;

enum COLORS {
  BLUE = 0x0000ff,
  GREEN = 0x65ff33,
  CYAN = 0x00ffff,
  RED = 0xff0000,
  MAGENTA = 0xff00ff,
  YELLOW = 0xffff00,
  WHITE = 0xffffff,
  ORANGE = 0xf78b2d,
  DARK_YELLOW = 0x93bf0f,
  PURPLE = 0xff33d0,
  DARK_GREEN = 0x00ff04,
  BLACK = 0x000001,
}

export enum TeamColors {
  PENSHIRYU = 0xb45568,
  ASTONMAIA = 0x059988,
  RUBYBISON = 0x4458a2,
  MCLARPER = 0xff8700,
  HAAX = 0xe6002b,
  MOTORFORCE = 0x06529d,
  SART = 0x40c3ff,
  KONARDI = 0x1d618c,
  LENAULTMOREO = 0xba3232,
  QUESTI = 0x4b56cc,
  SIXDENT = 0x9c7efc,
  JEANBORGHINI = 0xffd500,
  PEJO = 0xbdbdbd,
  BRAWNDESCO = 0xddff09,
  INTERFORCE = 0x83abc9,
  ALPINO = 0xddbc5f,
  TOYOSSI = 0x858585,
  BMW = 0x0066b1,
  BRACCHIARI = 0xec1c24,
  PHM = 0x5ef102,
}

enum FONTS {
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
  sound?: SOUNDS
) {
  if (toPlayerID) {
    const language = getPlayerLanguage(toPlayerID);
    // console.log(language, message, message[language])
    room.sendAnnouncement(message[language], toPlayerID, color, font, sound);
  } else {
    room.getPlayerList().forEach((player) => {
      const language = getPlayerLanguage(player.id);
      // console.log(language, message, message[language])
      room.sendAnnouncement(message[language], player.id, color, font, sound);
    });
  }
}

export function sendNonLocalizedSmallChatMessage(
  room: RoomObject,
  message: string,
  toPlayerID?: number
) {
  room.sendAnnouncement(
    message,
    toPlayerID,
    COLORS.WHITE,
    FONTS.SMALL,
    SOUNDS.CHAT
  );
}

export function sendErrorMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.RED,
    FONTS.BOLD,
    SOUNDS.NOTIFICATION
  );
}

export function sendAlertMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.YELLOW,
    FONTS.BOLD,
    SOUNDS.NOTIFICATION
  );
}

export function sendSuccessMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.GREEN,
    FONTS.BOLD,
    SOUNDS.NOTIFICATION
  );
}

export function sendChatMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.WHITE,
    FONTS.NORMAL,
    SOUNDS.CHAT
  );
}

export function sendSmallChatMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.WHITE,
    FONTS.SMALL,
    SOUNDS.CHAT
  );
}

export function sendBestTimeRace(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.PURPLE,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION
  );
}

export function sendWorseTime(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.DARK_YELLOW,
    FONTS.NORMAL,
    SOUNDS.CHAT
  );
}

export function sendRedMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.RED,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION
  );
}

export function sendYellowMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.YELLOW,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION
  );
}

export function sendGreenMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.GREEN,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION
  );
}

export function sendBlueMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.BLUE,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION
  );
}

export function sendBlackMessage(
  room: RoomObject,
  message: LocalizedMessageFunction,
  toPlayerID?: number
) {
  sendMessage(
    room,
    message,
    toPlayerID,
    COLORS.BLACK,
    FONTS.NORMAL,
    SOUNDS.NOTIFICATION
  );
}

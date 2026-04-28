import { sendErrorMessage, sendSuccessMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

let realSafety = false;

export function handleSafetyCommand(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject
) {
  if (!room) {
    return;
  }
  if (byPlayer && !byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (!args || !args[0]) {
    room.sendAnnouncement("Usage: !safety <on|off>", byPlayer?.id || 0, 0xff0000);
    return;
  }

  const value = args[0].toLowerCase();
  
  if (value === "on") {
    realSafety = true;
    room.sendAnnouncement("Real safety mode ENABLED - VSC will deploy after 2 seconds of inactivity", byPlayer?.id || 0, 0x00ff00);
  } else if (value === "off") {
    realSafety = false;
    room.sendAnnouncement("Real safety mode DISABLED - VSC will not auto-deploy", byPlayer?.id || 0, 0x00ff00);
  } else {
    room.sendAnnouncement("Invalid value. Use: !safety <on|off>", byPlayer?.id || 0, 0xff0000);
  }
}

export function isRealSafetyEnabled(): boolean {
  return realSafety;
}

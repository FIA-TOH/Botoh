import { sendErrorMessage, sendSuccessMessage, sendChatMessage, COLORS } from "../../chat/chat";
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
    room.sendAnnouncement("Usage: !safety <on|off>", byPlayer?.id || 0, COLORS.YELLOW);
    return;
  }

  const value = args[0].toLowerCase();
  
  if (value === "on") {
    realSafety = true;
    room.sendAnnouncement("Real safety mode ENABLED - VSC will deploy after 2 seconds of inactivity", byPlayer?.id || 0, COLORS.GREEN);
  } else if (value === "off") {
    realSafety = false;
    room.sendAnnouncement("Real safety mode DISABLED - VSC will not auto-deploy", byPlayer?.id || 0, COLORS.GREEN);
  } else {
    room.sendAnnouncement("Invalid value. Use: !safety <on|off>", byPlayer?.id || 0, COLORS.YELLOW);
  }
}

export function isRealSafetyEnabled(): boolean {
  return realSafety;
}

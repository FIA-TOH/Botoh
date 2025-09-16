import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";

export let rrEnabled = false;

export function handleRREnabledCommand(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject
) {
  if (room) {
    if (byPlayer) {
      if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
        return;
      }
    }
    if (args && args[0] === "true") {
      rrEnabled = true;
      if (byPlayer) {
        log("RR mode enabled by admin");
        room.sendAnnouncement("RR mode!");
      }
    } else if (args && args[0] === "false") {
      rrEnabled = false;
      if (byPlayer) {
        log("RR mode disabled by admin");
        room.sendAnnouncement("No RR mode!");
      }
    } else if (byPlayer) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      return;
    } else {
      return;
    }
  }
}

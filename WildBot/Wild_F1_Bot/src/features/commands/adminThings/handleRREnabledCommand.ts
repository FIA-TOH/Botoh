import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

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
      room.sendAnnouncement("RR mode!");
    } else if (args && args[0] === "false") {
      rrEnabled = false;
      room.sendAnnouncement("No RR mode!");
    } else if (byPlayer) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      return;
    } else {
      return;
    }
  }
}

import { sendErrorMessage, sendBlueMessage } from "../../chat/chat";
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
    if (args && args[0] === "on") {
      rrEnabled = true;
      if (byPlayer) {
        log("RR mode enabled by admin");
        sendBlueMessage(room, MESSAGES.RR_ENABLED());
      }
    } else if (args && args[0] === "off") {
      rrEnabled = false;
      if (byPlayer) {
        log("RR mode disabled by admin");
        sendBlueMessage(room, MESSAGES.RR_DISABLED());
      }
    } else if (byPlayer) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      return;
    } else {
      return;
    }
  }
}

import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";
import { gasEnabled, enableGas } from "../../speed/handleSlipstream";

export function handleGasCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (gasEnabled) {
    log("Gas mode disabled by admin");
    room.sendAnnouncement("No Gas mode!");
    enableGas(false);
  } else {
    log("Gas mode enabled by admin");
    room.sendAnnouncement("Gas mode!");
    enableGas(true);
  }
}

import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { log } from "../../discord/logger";
import {
  slipstreamEnabled,
  enableSlipstream,
} from "../../speed/handleSlipstream";

export function handleSlipstreamCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (slipstreamEnabled) {
    log("Slipstream mode disabled by admin");
    room.sendAnnouncement("No Slipstream mode!");
    enableSlipstream(false);
  } else {
    log("Slipstream mode enabled by admin");
    room.sendAnnouncement("Slipstream mode!");
    enableSlipstream(true);
  }
}

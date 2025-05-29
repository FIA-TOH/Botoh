import { sendErrorMessage, sendAlertMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export let tyresActivated = true;

export function handleEnableTyresCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  tyresActivated = !tyresActivated;
  sendAlertMessage(room, MESSAGES.ENABLED_TYRES(tyresActivated), byPlayer.id);
}

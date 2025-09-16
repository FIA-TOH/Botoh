import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { changeVSC, vsc } from "../../speed/handleSpeed";

export function handleVSCCommand(
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

  changeVSC();
  const message = vsc ? MESSAGES.VSC_ACTIVE() : MESSAGES.VSC_NOT_ACTIVE();
  sendChatMessage(room, message);
}

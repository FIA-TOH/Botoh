import { sendErrorMessage, sendChatMessage, sendYellowMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { changeVSC, vsc } from "../../safetyCar/vsc";

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
  
  if (vsc) {
    sendYellowMessage(room, MESSAGES.VSC_DEPLOYED());
  } else {
    sendChatMessage(room, MESSAGES.VSC_NOT_ACTIVE());
  }
}

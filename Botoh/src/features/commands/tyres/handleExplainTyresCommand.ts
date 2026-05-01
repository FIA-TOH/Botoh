import { sendCyanMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleExplainTyresCommand(
  byPlayer?: PlayerObject,
  _?: string[],
  room?: RoomObject
) {
  if (!room) {
    return;
  }

  if (!byPlayer || byPlayer.admin) {
    sendCyanMessage(room, MESSAGES.EXPLAIN_TYRES());
  } else {
    sendCyanMessage(room, MESSAGES.EXPLAIN_TYRES(), byPlayer.id);
  }
}

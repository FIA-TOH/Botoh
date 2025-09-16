import { sendMessage } from "../../chat/chat";
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
    sendMessage(room, MESSAGES.EXPLAIN_TYRES());
  } else {
    sendMessage(room, MESSAGES.EXPLAIN_TYRES(), byPlayer.id);
  }
}

import { sendCyanMessage, sendMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleExplainErsCommand(
  byPlayer?: PlayerObject,
  _?: string[],
  room?: RoomObject
) {
  if (!room) {
    return;
  }
  if (!byPlayer || byPlayer.admin) {
    sendCyanMessage(room, MESSAGES.EXPLAIN_ERS());
  } else {
    sendCyanMessage(room, MESSAGES.EXPLAIN_ERS(), byPlayer.id);
  }
}

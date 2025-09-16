import { sendMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleExplainRainCommand(
  byPlayer?: PlayerObject,
  _?: string[],
  room?: RoomObject
) {
  if (!room) {
    return;
  }
  if (!byPlayer || byPlayer.admin) {
    sendMessage(room, MESSAGES.EXPLAIN_RAIN());
  } else {
    sendMessage(room, MESSAGES.EXPLAIN_RAIN(), byPlayer.id);
  }
}

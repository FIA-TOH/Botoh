import { sendMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleExplainErsCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (byPlayer.admin) {
    sendMessage(room, MESSAGES.EXPLAIN_ERS());
  } else {
    sendMessage(room, MESSAGES.EXPLAIN_ERS(), byPlayer.id);
  }
}

import { sendCyanMessage, sendMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleExplainServerCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (byPlayer.admin) {
    sendCyanMessage(room, MESSAGES.EXPLAIN_SERVER());
  } else {
    sendCyanMessage(room, MESSAGES.EXPLAIN_SERVER(), byPlayer.id);
  }
}

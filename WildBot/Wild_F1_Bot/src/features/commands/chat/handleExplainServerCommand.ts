import { sendMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleExplainServerCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (byPlayer.admin) {
    sendMessage(room, MESSAGES.EXPLAIN_SERVER());
  } else {
    sendMessage(room, MESSAGES.EXPLAIN_SERVER(), byPlayer.id);
  }
}

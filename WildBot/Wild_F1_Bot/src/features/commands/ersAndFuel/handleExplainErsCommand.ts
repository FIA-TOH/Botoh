import { sendMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleExplainErsCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  sendMessage(room, MESSAGES.EXPLAIN_ERS());
}

import { sendMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleTipsCommands(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  sendMessage(room, MESSAGES.TIPS());
}

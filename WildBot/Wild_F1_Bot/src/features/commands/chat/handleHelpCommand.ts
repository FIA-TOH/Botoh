import { sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleHelpCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  sendChatMessage(room, MESSAGES.HELP(), byPlayer.id);
}

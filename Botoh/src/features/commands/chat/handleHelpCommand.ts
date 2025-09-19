import {
  FONTS,
  sendBlackMessage,
  sendChatMessage,
  sendMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleHelpCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  sendMessage(room, MESSAGES.HELP(), byPlayer.id, undefined, FONTS.BOLD);
  sendChatMessage(room, MESSAGES.HELP_PART_ONE(), byPlayer.id);
  sendChatMessage(room, MESSAGES.HELP_PART_TWO(), byPlayer.id);
  sendChatMessage(room, MESSAGES.HELP_PART_THREE(), byPlayer.id);
  sendChatMessage(room, MESSAGES.HELP_PART_FOUR(), byPlayer.id);
  sendChatMessage(room, MESSAGES.HELP_PART_FIVE(), byPlayer.id);
  sendChatMessage(room, MESSAGES.HELP_PART_SIX(), byPlayer.id);
}

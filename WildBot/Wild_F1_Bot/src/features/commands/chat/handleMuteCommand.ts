import {
  sendAlertMessage,
  sendErrorMessage,
  sendSuccessMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { mute_mode, toggleMuteMode } from "../../chat/toggleMuteMode";

export function handleMuteCommand(
  byPlayer?: PlayerObject,
  _?: string[],
  room?: RoomObject
) {
  if (!room) {
    return;
  }
  if (byPlayer && !byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  if (mute_mode) sendSuccessMessage(room, MESSAGES.CHAT_FREE());
  else sendAlertMessage(room, MESSAGES.CHAT_MUTED());

  toggleMuteMode();
}

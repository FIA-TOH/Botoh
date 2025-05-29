import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { mute_mode, toggleMuteMode } from "../../chat/toggleMuteMode";

export function handleMuteCommand(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  if (mute_mode) room.sendAnnouncement("NOT MUTE MODE!");
  else room.sendAnnouncement("MUTE MODE!");

  toggleMuteMode();
}

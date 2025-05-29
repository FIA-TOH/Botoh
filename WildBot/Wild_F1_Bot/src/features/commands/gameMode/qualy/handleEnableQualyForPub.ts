import { sendErrorMessage } from "../../../chat/chat";
import { MESSAGES } from "../../../chat/messages";

export let qualyForPub = true;

export function handleEnableQualyForPub(
  byPlayer: PlayerObject,
  _: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  qualyForPub = !qualyForPub;
  room.sendAnnouncement(`qualyForPub changed to ${qualyForPub}`, byPlayer.id);
}

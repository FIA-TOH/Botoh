import { positionList } from "../../changeGameState/race/positionList";
import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { setFollowPosition } from "../../camera/cameraFollow";

export function handleCameraPositionFollow(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject
) {
  if (!room) return;

  if (room.getScores() === null && byPlayer) {
    sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id);
    return false;
  }

  if (!args || args.length === 0) {
    if (byPlayer) {
      room.sendAnnouncement(
        "Correct use: !camera_position [posição]",
        byPlayer.id
      );
    }
    return;
  }

  if (byPlayer && !byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  const pos = Number(args[0]);
  if (isNaN(pos) || pos <= 0 || pos > positionList.length) {
    if (byPlayer) {
      room.sendAnnouncement(`Invalid position.`, byPlayer.id);
    }
    return;
  }

  setFollowPosition(pos);
  if (byPlayer) {
    room.sendAnnouncement(
      `Camera now following the position ${pos}.`,
      byPlayer.id
    );
  }
}

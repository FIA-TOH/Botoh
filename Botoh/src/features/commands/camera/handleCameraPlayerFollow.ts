import { sendErrorMessage, sendChatMessage, COLORS } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { setFollowPlayer } from "../../cameraAndBall/cameraFollow";
import { log } from "../../discord/logger";

export function handleCameraPlayerFollow(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject
) {
  if (!room) {
    console.error("[CameraFollow] Room is undefined.");
    return;
  }

  if (room.getScores() === null && byPlayer) {
    sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id);
    return false;
  }

  if (!args || args.length === 0) {
    if (byPlayer) {
      room.sendAnnouncement("Correct use: !camera_id [player id]", byPlayer.id, COLORS.YELLOW);
    }
    return;
  }

  if (byPlayer && !byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  const rawId = args[0];
  const playerId = Number(rawId);

  if (isNaN(playerId)) {
    if (byPlayer) {
      room.sendAnnouncement("Correct use: !camera_id [player id]", byPlayer.id, COLORS.YELLOW);
    }
    return;
  }

  const targetPlayer = room.getPlayer(playerId);
  if (!targetPlayer) {
    if (byPlayer) {
      room.sendAnnouncement(
        `Player with ID ${playerId} not found.`,
        byPlayer.id, COLORS.RED
      );
    }
    return;
  }

  setFollowPlayer(playerId);
  if (byPlayer) {
    room.sendAnnouncement(
      `Now following the player: ${targetPlayer.name} (ID: ${playerId}).`,
      byPlayer.id,
      COLORS.GREEN
    );
  }

  log(`[CameraFollow] Now following the player ID ${playerId}`);
}

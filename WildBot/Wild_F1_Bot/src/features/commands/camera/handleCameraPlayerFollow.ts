import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { setFollowPlayer } from "../../camera/cameraFollow";

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
      room.sendAnnouncement("Uso correto: !camera_id [player id]", byPlayer.id);
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
      room.sendAnnouncement("Uso correto: !camera_id [player id]", byPlayer.id);
    }
    return;
  }

  const targetPlayer = room.getPlayer(playerId);
  if (!targetPlayer) {
    if (byPlayer) {
      room.sendAnnouncement(
        `Jogador com id ${playerId} não encontrado.`,
        byPlayer.id
      );
    }
    return;
  }

  setFollowPlayer(playerId);
  if (byPlayer) {
    room.sendAnnouncement(
      `agora seguindo o jogador: ${targetPlayer.name} (id: ${playerId})`,
      byPlayer.id
    );
  }

  console.log(`[CameraFollow] Agora seguindo o player ID ${playerId}`);
}

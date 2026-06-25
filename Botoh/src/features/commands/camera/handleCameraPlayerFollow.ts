import { sendErrorMessage, sendChatMessage, COLORS } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { setFollowPlayer } from "../../cameraAndBall/cameraFollow";
import {
  gameMode,
  GeneralGameMode,
  generalGameMode,
  GameMode,
} from "../../changeGameState/changeGameModes";
import { Teams } from "../../changeGameState/teams";
import { getPlayersOrderedByQualiTime } from "../gameMode/qualy/playerTime";
import { log } from "../../discord/logger";

function getTimedSessionPlayerByPosition(position: number, room: RoomObject) {
  if (
    generalGameMode !== GeneralGameMode.GENERAL_QUALY &&
    gameMode !== GameMode.TRAINING
  ) {
    return null;
  }

  const timedPlayer = getPlayersOrderedByQualiTime()[position - 1];
  if (!timedPlayer) {
    return room.getPlayerList()
      .filter((player) => player.team === Teams.RUNNERS)[position - 1] ?? null;
  }

  return room.getPlayer(timedPlayer.id) ?? null;
}

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

  const targetPlayer =
    room.getPlayer(playerId) ?? getTimedSessionPlayerByPosition(playerId, room);
  if (!targetPlayer) {
    if (byPlayer) {
      room.sendAnnouncement(
        `Player with ID ${playerId} not found.`,
        byPlayer.id, COLORS.RED
      );
    }
    return;
  }

  setFollowPlayer(targetPlayer.id);
  if (byPlayer) {
    room.sendAnnouncement(
      `Now following the player: ${targetPlayer.name} (ID: ${targetPlayer.id}).`,
      byPlayer.id,
      COLORS.GREEN
    );
  }

  log(`[CameraFollow] Now following the player ID ${targetPlayer.id}`);
}

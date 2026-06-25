import { sendErrorMessage, sendChatMessage, COLORS } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { setFollowPosition } from "../../cameraAndBall/cameraFollow";
import {
  gameMode,
  GeneralGameMode,
  generalGameMode,
  GameMode,
} from "../../changeGameState/changeGameModes";
import { Teams } from "../../changeGameState/teams";
import { getPlayersOrderedByQualiTime } from "../gameMode/qualy/playerTime";
import { positionList } from "../gameMode/race/positionList";

function getReferencePositionCount(room: RoomObject) {
  if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
    return positionList.length;
  }

  if (
    generalGameMode === GeneralGameMode.GENERAL_QUALY ||
    gameMode === GameMode.TRAINING
  ) {
    const timedPlayersCount = getPlayersOrderedByQualiTime().length;
    if (timedPlayersCount > 0) return timedPlayersCount;

    return room.getPlayerList().filter((player) => player.team === Teams.RUNNERS).length;
  }

  return 0;
}

export function handleCameraPositionFollow(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject,
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
        byPlayer.id,
        COLORS.YELLOW
      );
    }
    return;
  }

  if (byPlayer && !byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  const pos = Number(args[0]);
  const referencePositionCount = getReferencePositionCount(room);
  if (isNaN(pos) || pos <= 0 || pos > referencePositionCount) {
    if (byPlayer) {
      room.sendAnnouncement(`Invalid position.`, byPlayer.id, COLORS.RED);
    }
    return;
  }

  setFollowPosition(pos);
  if (byPlayer) {
    room.sendAnnouncement(
      `Camera now following the position ${pos}.`,
      byPlayer.id,
      COLORS.GREEN
    );
  }
}

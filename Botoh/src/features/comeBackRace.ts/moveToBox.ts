import { Direction } from "../../circuits/Circuit";
import { playerList } from "../changePlayerState/playerList";
import { sendErrorMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { getPlayerById } from "../playerFeatures/getPlayerBy";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";

export function moveToBox(
  player: PlayerObject,
  room: RoomObject,
  position: "start" | "middle" | "end"
) {
  const boxLine = ACTUAL_CIRCUIT.info.boxLine;
  const width = boxLine.maxX - boxLine.minX;
  const height = boxLine.maxY - boxLine.minY;

  const middleX = (boxLine.minX + boxLine.maxX) / 2;
  const middleY = (boxLine.minY + boxLine.maxY) / 2;

  let targetX = middleX;
  let targetY = middleY;

  if (position !== "middle") {
    const horizontal = width > height;
    const offset = 5;

    if (horizontal) {
      if (ACTUAL_CIRCUIT.info.finishLine.passingDirection === Direction.RIGHT) {
        targetX =
          position === "start" ? boxLine.maxX - offset : boxLine.minX + offset;
      } else {
        targetX =
          position === "start" ? boxLine.minX + offset : boxLine.maxX - offset;
      }
      targetY = middleY;
    } else {
      if (ACTUAL_CIRCUIT.info.finishLine.passingDirection === Direction.DOWN) {
        targetY =
          position === "start" ? boxLine.maxY - offset : boxLine.minY + offset;
      } else {
        targetY =
          position === "start" ? boxLine.minY + offset : boxLine.maxY - offset;
      }
      targetX = middleX;
    }
  }

  playerList[player.id].inPitlane = true;
  room.setPlayerDiscProperties(player.id, {
    x: targetX,
    y: targetY,
  });
}

export function handleMoveToBoxCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (room.getScores() === null) {
    sendErrorMessage(room, MESSAGES.NOT_STARTED(), byPlayer.id);
    return false;
  }

  const playerIdRaw = args[0];
  const positionRaw = args[1];

  const playerId = Number(playerIdRaw);
  if (isNaN(playerId) || !playerList[playerId]) {
    room.sendAnnouncement(
      `no player found with id: ${playerIdRaw}`,
      byPlayer.id,
      0xff0000
    );
    return false;
  }

  const validPositions = ["start", "middle", "end"] as const;
  if (!validPositions.includes(positionRaw as any)) {
    room.sendAnnouncement(
      `Correct use: !move_to_box [playerId] [start | middle | end]`,
      byPlayer.id,
      0xff0000
    );
    return false;
  }

  const playerPad = getPlayerById(playerId, room);

  if (!playerPad) {
    room.sendAnnouncement("❌ Player not found.", byPlayer.id, 0xff0000);
    return;
  }

  moveToBox(playerPad.p, room, positionRaw as "start" | "middle" | "end");

  room.sendAnnouncement(
    `✅ ${playerPad.p.name} moved to the (${positionRaw} of the box).`,
    byPlayer.id
  );
}

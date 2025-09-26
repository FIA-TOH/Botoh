import { playerList } from "../changePlayerState/playerList";
import { CIRCUITS, currentMapIndex } from "./maps";

export function updatePreviousPos(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  p: PlayerObject
) {
  const posX = pad.disc.x;
  const posY = pad.disc.y;
  if (!playerList[p.id].previousPos) {
    playerList[p.id].previousPos = { x: posX, y: posY };
  } else {
    playerList[p.id].previousPos.x = posX;
    playerList[p.id].previousPos.y = posY;
  }
}

function updateAccurateTime(p: PlayerObject, room: RoomObject): number {
  const playerData = playerList[p.id];
  const pos = room.getPlayerDiscProperties(p.id);
  if (!pos || !playerData.previousPos) return 0;

  // Constantes de pista
  const circuit = CIRCUITS[currentMapIndex].info;
  const minX = circuit.finishLine.bounds.minX;
  const maxX = circuit.finishLine.bounds.maxX;
  const minY = circuit.finishLine.bounds.minY;
  const maxY = circuit.finishLine.bounds.maxY;

  const startFinishLine = Math.sqrt(
    Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2)
  );
  const timeOfOneTick = 1 / 60;

  const prev = playerData.previousPos;
  const curr = { x: pos.x, y: pos.y };

  if (!prev || prev.x == null || prev.y == null) {
    return 0;
  }

  const currentPreviousSide = Math.sqrt(
    Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
  );
  const bottomCornerCurrentSide = Math.sqrt(
    Math.pow(curr.x - minX, 2) + Math.pow(curr.y - maxY, 2)
  );
  const bottomCornerPreviousSide = Math.sqrt(
    Math.pow(prev.x - minX, 2) + Math.pow(prev.y - maxY, 2)
  );
  const upperCornerCurrentSide = Math.sqrt(
    Math.pow(curr.x - maxX, 2) + Math.pow(curr.y - minY, 2)
  );

  const anglecurrentPreviousSideBottomCornerCurrentSide =
    Math.acos(
      (Math.pow(currentPreviousSide, 2) +
        Math.pow(bottomCornerCurrentSide, 2) -
        Math.pow(bottomCornerPreviousSide, 2)) /
        (2 * currentPreviousSide * bottomCornerCurrentSide)
    ) *
    (180 / Math.PI);

  const anglestartFinishLineBottomCornerCurrentSide =
    Math.acos(
      (Math.pow(bottomCornerCurrentSide, 2) +
        Math.pow(startFinishLine, 2) -
        Math.pow(upperCornerCurrentSide, 2)) /
        (2 * bottomCornerCurrentSide * startFinishLine)
    ) *
    (180 / Math.PI);

  const remainingAngle =
    180 -
    anglecurrentPreviousSideBottomCornerCurrentSide -
    anglestartFinishLineBottomCornerCurrentSide;

  const positionStartFinishLineSide =
    (bottomCornerCurrentSide *
      Math.sin(anglestartFinishLineBottomCornerCurrentSide / (180 / Math.PI))) /
    Math.sin(remainingAngle / (180 / Math.PI));

  const additionalTime =
    (timeOfOneTick / currentPreviousSide) * positionStartFinishLineSide;

  playerData.previousPos = curr; // salvar para o próximo tick

  return additionalTime;
}

export function updatePlayerLapTime(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  const p = pad.p;
  const playerData = playerList[p.id];

  const additionalTime = updateAccurateTime(p, room);
  if (!additionalTime) return;

  playerData.lapTime += additionalTime;
  playerData.sectorTimeCounter += additionalTime;
}

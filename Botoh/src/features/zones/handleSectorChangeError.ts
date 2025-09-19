import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import {
  updatePositionList,
  positionList,
} from "../changeGameState/race/positionList";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { sendBlueMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { presentationLap } from "../commands/gameState/handlePresentationLapCommand";
import { inHitbox, getRunningPlayers } from "../utils";
import { CIRCUITS, currentMapIndex } from "./maps";

const timeOfOneTick = 1 / 60;

function serialize(number: number) {
  return parseFloat(number.toFixed(3));
}

function ifInSectorOneChangeZone(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  const scores = room.getScores();
  const circuit = CIRCUITS[currentMapIndex];

  if (scores && circuit?.info?.sectorOne?.bounds) {
    return scores.time > 0 && inHitbox(player, circuit.info.sectorOne.bounds);
  }
}

function ifInSectorTwoChangeZone(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  const scores = room.getScores();
  const circuit = CIRCUITS[currentMapIndex];

  if (scores && circuit?.info?.sectorTwo?.bounds) {
    return scores.time > 0 && inHitbox(player, circuit.info.sectorTwo.bounds);
  }
}

function ifInSectorThreeChangeZone(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  const scores = room.getScores();
  const circuit = CIRCUITS[currentMapIndex];

  if (scores && circuit?.info?.sectorThree?.bounds) {
    return scores.time > 0 && inHitbox(player, circuit.info.sectorThree.bounds);
  }
}

// Função para calcular tempo preciso de setor usando trigonometria
function calculatePreciseSectorTime(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  sectorBounds: { minX: number; minY: number; maxX: number; maxY: number },
  playerData: any
): number {
  const position = pad.disc;

  if (
    playerData.previousX === undefined ||
    playerData.previousY === undefined
  ) {
    return playerData.sectorTimeCounter;
  }

  try {
    const { minX, minY, maxX, maxY } = sectorBounds;

    // Calcular linha do setor (similar à linha de chegada)
    const sectorLine = Math.sqrt(
      Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2)
    );

    let currentPreviousSide = Math.sqrt(
      Math.pow(position.x - playerData.previousX, 2) +
        Math.pow(position.y - playerData.previousY, 2)
    );

    let bottomCornerCurrentSide = Math.sqrt(
      Math.pow(position.x - minX, 2) + Math.pow(position.y - maxY, 2)
    );

    let bottomCornerPreviousSide = Math.sqrt(
      Math.pow(playerData.previousX - minX, 2) +
        Math.pow(playerData.previousY - maxY, 2)
    );

    let upperCornerCurrentSide = Math.sqrt(
      Math.pow(position.x - maxX, 2) + Math.pow(position.y - minY, 2)
    );

    // Evitar divisão por zero e valores inválidos
    if (currentPreviousSide > 0 && bottomCornerCurrentSide > 0) {
      let anglecurrentPreviousSideBottomCornerCurrentSide =
        Math.acos(
          Math.min(
            1,
            Math.max(
              -1,
              (Math.pow(currentPreviousSide, 2) +
                Math.pow(bottomCornerCurrentSide, 2) -
                Math.pow(bottomCornerPreviousSide, 2)) /
                (2 * currentPreviousSide * bottomCornerCurrentSide)
            )
          )
        ) *
        (180 / Math.PI);

      let angleSectorLineBottomCornerCurrentSide =
        Math.acos(
          Math.min(
            1,
            Math.max(
              -1,
              (Math.pow(bottomCornerCurrentSide, 2) +
                Math.pow(sectorLine, 2) -
                Math.pow(upperCornerCurrentSide, 2)) /
                (2 * bottomCornerCurrentSide * sectorLine)
            )
          )
        ) *
        (180 / Math.PI);

      let remainingAngle =
        180 -
        anglecurrentPreviousSideBottomCornerCurrentSide -
        angleSectorLineBottomCornerCurrentSide;

      if (Math.sin((remainingAngle * Math.PI) / 180) !== 0) {
        let positionSectorLineSide =
          (bottomCornerCurrentSide *
            Math.sin(
              (angleSectorLineBottomCornerCurrentSide * Math.PI) / 180
            )) /
          Math.sin((remainingAngle * Math.PI) / 180);

        let additionalTime =
          (timeOfOneTick / currentPreviousSide) * positionSectorLineSide;

        // Retornar tempo preciso do setor
        return playerData.sectorTimeCounter - additionalTime;
      }
    }
  } catch (error) {
    console.error("Erro no cálculo de timing preciso do setor:", error);
  }

  // Se houver erro, retornar tempo normal
  return playerData.sectorTimeCounter;
}

export function checkPlayerSector(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  if (presentationLap) return;

  const circuit = CIRCUITS[currentMapIndex];

  players.forEach((pad) => {
    const p = pad.p;
    const playerData = playerList[p.id];

    // NÃO incrementar sectorTimeCounter aqui pois já é feito no checkPlayerLaps
    // O timing é sincronizado através do lastLapTimeUpdate

    if (
      (!ifInSectorOneChangeZone(pad, room) ||
        !ifInSectorTwoChangeZone(pad, room) ||
        !ifInSectorThreeChangeZone(pad, room)) &&
      playerList[p.id].lapChanged
    ) {
      playerList[p.id].sectorChanged = false;
    }

    if (
      !ifInSectorOneChangeZone(pad, room) &&
      !ifInSectorTwoChangeZone(pad, room) &&
      !ifInSectorThreeChangeZone(pad, room)
    ) {
      return;
    }

    if (playerList[p.id].lapChanged) {
      return;
    }

    if (
      (ifInSectorOneChangeZone(pad, room) &&
        playerList[p.id].currentSector !== 3) ||
      (ifInSectorTwoChangeZone(pad, room) &&
        playerList[p.id].currentSector !== 1) ||
      (ifInSectorThreeChangeZone(pad, room) &&
        playerList[p.id].currentSector !== 2)
    ) {
      return;
    }

    if (ifInSectorOneChangeZone(pad, room) && circuit?.info?.sectorOne) {
      // Setor 1 -> Setor 2 (completou setor 3 na verdade, pois vem do setor 3)
      const preciseSectorTime = calculatePreciseSectorTime(
        pad,
        circuit.info.sectorOne.bounds,
        playerData
      );

      playerList[p.id].sectorTime[2] = serialize(preciseSectorTime);
      playerList[p.id].sectorTimeCounter = 0;
      playerList[p.id].currentSector = 1;
      updatePositionList(players, room);
    } else if (ifInSectorTwoChangeZone(pad, room) && circuit?.info?.sectorTwo) {
      // Setor 2 (completou setor 1)
      const preciseSectorTime = calculatePreciseSectorTime(
        pad,
        circuit.info.sectorTwo.bounds,
        playerData
      );

      playerList[p.id].totalTime = room.getScores().time;
      playerList[p.id].currentSector = 2;
      playerList[p.id].sectorTime[0] = serialize(preciseSectorTime);

      room.sendAnnouncement(
        `Sector 1: ${playerList[p.id].sectorTime[0]}s`,
        p.id,
        0xff8f00
      );

      playerList[p.id].sectorTimeCounter = 0;
      updatePositionList(players, room);
      checkBlueFlag(p, room);
    } else if (
      ifInSectorThreeChangeZone(pad, room) &&
      circuit?.info?.sectorThree
    ) {
      // Setor 3 (completou setor 2)
      const preciseSectorTime = calculatePreciseSectorTime(
        pad,
        circuit.info.sectorThree.bounds,
        playerData
      );

      playerList[p.id].totalTime = room.getScores().time;
      playerList[p.id].currentSector = 3;
      playerList[p.id].sectorTime[1] = serialize(preciseSectorTime);

      room.sendAnnouncement(
        `Sector 2: ${playerList[p.id].sectorTime[1]}s`,
        p.id,
        0xff8f00
      );

      playerList[p.id].sectorTimeCounter = 0;
      updatePositionList(players, room);
      checkBlueFlag(p, room);
    }
  });
}

export function checkBlueFlag(p: PlayerObject, room: RoomObject) {
  const playerInfo = positionList.find((entry) => entry.name === p.name);
  if (!playerInfo) return;
  if (gameMode == GameMode.QUALY || gameMode == GameMode.TRAINING) return;

  positionList.forEach((opponent) => {
    const opponentInfo = room
      .getPlayerList()
      .find((p) => p.name === opponent.name);
    if (
      room.getScores().time > 20 &&
      opponent.lap < playerInfo.lap &&
      opponent.currentSector === playerInfo.currentSector &&
      playerInfo.totalTime - opponent.totalTime < 1 &&
      opponentInfo
    ) {
      sendBlueMessage(room, MESSAGES.BLUE_FLAG(opponent.name));
      sendBlueMessage(
        room,
        MESSAGES.BLUE_FLAG_OPPONENT(opponent.name, playerInfo.name),
        opponentInfo.id
      );
      handleAvatar(
        Situacions.Flag,
        opponentInfo,
        room,
        undefined,
        ["🟦"],
        [5000]
      );
    }
  });
}

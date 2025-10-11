import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
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

export function checkPlayerSector(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  if (presentationLap) return;
  players.forEach((pad) => {
    const p = pad.p;

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

    if (ifInSectorOneChangeZone(pad, room)) {
      playerList[p.id].sectorTime[2] = serialize(
        playerList[p.id].sectorTimeCounter
      );
      playerList[p.id].sectorTimeCounter = 0;
      updatePositionList(players, room);
    } else if (ifInSectorTwoChangeZone(pad, room)) {
      playerList[p.id].totalTime = room.getScores().time;
      playerList[p.id].currentSector = 2;
      playerList[p.id].sectorTime[0] = serialize(
        playerList[p.id].sectorTimeCounter
      );
      room.sendAnnouncement(
        `Sector 1: ${playerList[p.id].sectorTime[0]}s`,
        p.id,
        0xff8f00
      );

      playerList[p.id].sectorTimeCounter = 0;
      updatePositionList(players, room);
      checkBlueFlag(p, room);
    } else if (ifInSectorThreeChangeZone(pad, room)) {
      playerList[p.id].totalTime = room.getScores().time;
      playerList[p.id].currentSector = 3;
      playerList[p.id].sectorTime[1] = serialize(
        playerList[p.id].sectorTimeCounter
      );
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
  if (
    generalGameMode === GeneralGameMode.GENERAL_QUALY ||
    gameMode == GameMode.TRAINING
  )
    return;

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

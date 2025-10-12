import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { createPlayerInfo } from "../changePlayerState/players";
import { getPlayerByRacePosition } from "../playerFeatures/getPlayerBy";
import { Tires, TIRE_STARTING_SPEED } from "../tires&pits/tires";

export function resetPlayerComeBack(
  player: PlayerObject,
  room: RoomObject,
  id: number
) {
  const lastPlacePlayerInfo = getPlayerByRacePosition("last", room);
  console.log(lastPlacePlayerInfo);

  if (playerList[id] === undefined || lastPlacePlayerInfo === undefined) {
    //return error
    return;
  }

  playerList[id].isInTheRoom = true;
  playerList[id].afk = false;
  playerList[id].afkAlert = false;
  playerList[id].gripCounter = 0;
  playerList[id].inPitlane = true;
  playerList[id].inPitStop = false;
  playerList[id].boxAlert = false;
  playerList[id].pitCountdown = 5;
  //to-do gerar pitSteps
  playerList[id].pitSteps = undefined;
  playerList[id].drs = false;
  playerList[id].slipstreamEndTime = undefined;
  playerList[id].penaltyCounter = 0;
  playerList[id].alertSent = {};
  playerList[id].lastCheckTime = 0;
  playerList[id].cameraFollowing = false;
  playerList[id].lastDir = undefined;
  playerList[id].slipTicks = undefined;
  playerList[id].slipDir = undefined;
  playerList[id].previousPos = { x: null, y: null };
  playerList[id].timeWhenEntered = 0;

  playerList[id].currentLap = playerList[lastPlacePlayerInfo.id].currentLap;
  playerList[id].lapChanged = false;
  playerList[id].lastLapTimeUpdate = 0;
  playerList[id].currentSector = 3;
  playerList[id].sectorChanged = false;
  (playerList[id].sectorTime = []), playerList[id].sectorTimeCounter;
}

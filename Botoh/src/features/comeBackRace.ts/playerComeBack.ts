import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { createPlayerInfo } from "../changePlayerState/players";
import { getPlayerByRacePosition } from "../playerFeatures/getPlayerBy";
import { Tires, TIRE_STARTING_SPEED } from "../tires&pits/tires";
import { PlayerLeftInfo } from "./comeBackToRaceFunctions";

export function resetPlayerComeBack(
  player: PlayerObject,
  room: RoomObject,
  id: number,
  info: PlayerLeftInfo
) {
  const firstPlayer = getPlayerByRacePosition("first", room);
  const firstPlayerCurrentLap = firstPlayer
    ? playerList[firstPlayer.id].currentLap
    : 0;
  const lapsBehindWhenLeft = info.lapsBehindLeaderWhenLeft ?? 0;

  if (playerList[id] === undefined) {
    //to-do return error
    return;
  }
  const lapsCompletedWhenLeft =
    info.lapsCompletedWhenLeft ??
    Math.max(0, playerList[player.id].currentLap - 1);
  const lapsBehind = info.lapsBehindLeaderWhenLeft ?? 0;

  const leaderLapsCompleted = Math.max(0, firstPlayerCurrentLap - 1);
  const targetLapsCompleted = Math.max(0, leaderLapsCompleted - lapsBehind);

  let finalLapsCompleted = lapsCompletedWhenLeft;
  const diff = targetLapsCompleted - lapsCompletedWhenLeft;
  if (diff > 1 || diff < -1) {
    // sincroniza com o líder se estiver muito diferente
    finalLapsCompleted = targetLapsCompleted;
  }

  playerList[id].canLeavePitLane = false;

  playerList[id].isInTheRoom = true;
  playerList[id].afk = false;
  playerList[id].afkAlert = false;
  playerList[id].gripCounter = 0;
  playerList[id].inPitlane = true;
  playerList[id].inPitStop = false;
  playerList[id].boxAlert = false;
  playerList[id].pitCountdown = 5;
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

  playerList[id].currentLap = finalLapsCompleted + 1;
  playerList[id].lapChanged = false;
  playerList[id].lastLapTimeUpdate = 0;
  playerList[id].currentSector = 3;
  playerList[id].sectorChanged = false;
  (playerList[id].sectorTime = []), playerList[id].sectorTimeCounter;

  console.log(
    "RESET REJOIN",
    player.name,
    "leaderLap",
    firstPlayerCurrentLap,
    "savedCompleted",
    lapsCompletedWhenLeft,
    "targetCompleted",
    targetLapsCompleted,
    "finalCompleted",
    finalLapsCompleted,
    "-> currentLap",
    playerList[id].currentLap
  );
}

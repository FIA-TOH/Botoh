import { gameMode, GameMode } from "../../changeGameState/changeGameModes";
import { PlayerInfo, playerList } from "../../changePlayerState/playerList";
import { Tires } from "../../tires&pits/tires";

export function resetLapData(
  playerData: PlayerInfo,
  playerId: number,
  room: RoomObject
) {
  if (gameMode === GameMode.QUALY || playerData.tires === Tires.TRAIN) {
    playerData.kers = 100;
  }
  playerData.lapTime = 0;
  playerData.sectorTimeCounter = 0;
  playerData.sectorTime = [];
  playerData.currentSector = 1;
  playerList[playerId].totalTime = room.getScores().time;
}

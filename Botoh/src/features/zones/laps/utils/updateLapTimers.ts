import { PlayerInfo } from "../../../changePlayerState/playerList";
import { getIsGamePaused } from "../../../changeGameState/gameState";

export function updateLapTimers(playerData: PlayerInfo, room: RoomObject) {
  if (getIsGamePaused()) {
    return;
  }

  const now = performance.now();
  const delta = (now - playerData.lastLapTimeUpdate) / 1000;
  

  if (delta > 5) {
    playerData.lastLapTimeUpdate = now;
    return;
  }
  
  playerData.lapTime += delta;
  playerData.sectorTimeCounter += delta;
  playerData.lastLapTimeUpdate = now;
}

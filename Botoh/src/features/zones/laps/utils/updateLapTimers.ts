import { PlayerInfo } from "../../../changePlayerState/playerList";

export function updateLapTimers(playerData: PlayerInfo) {
  const now = performance.now();
  const delta = (now - playerData.lastLapTimeUpdate) / 1000;

  playerData.lapTime += delta;
  playerData.sectorTimeCounter += delta;
  playerData.lastLapTimeUpdate = now;
}

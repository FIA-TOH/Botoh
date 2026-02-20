import { PlayerInfo } from "../../../changePlayerState/playerList";
import { didGameTimeAdvance } from "../../updateAccuranteTime.";

export function updateLapTimers(playerData: PlayerInfo, room: RoomObject) {
  // if (!didGameTimeAdvance(room)) return;

  const now = performance.now();
  const delta = (now - playerData.lastLapTimeUpdate) / 1000;

  playerData.lapTime += delta;
  playerData.sectorTimeCounter += delta;
  playerData.lastLapTimeUpdate = now;
}

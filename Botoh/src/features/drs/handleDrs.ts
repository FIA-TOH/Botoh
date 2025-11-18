import { PlayerInfo } from "../changePlayerState/playerList";
import { drsOn, enableDRS } from "./handleDRSZone";

export function handleDRS(playerData: PlayerInfo, room: RoomObject) {
  if (playerData.currentLap === 2 && !drsOn) {
    enableDRS(room);
  }
}

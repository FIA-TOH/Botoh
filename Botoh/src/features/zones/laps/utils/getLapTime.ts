import { PlayerInfo } from "../../../changePlayerState/playerList";
import { serialize, someArray } from "../../../utils";

export function getLapTime(playerData: PlayerInfo, hasSector: boolean): number {
  let lap = serialize(playerData.lapTime);
  if (hasSector) lap = serialize(someArray(playerData.sectorTime));
  return lap;
}

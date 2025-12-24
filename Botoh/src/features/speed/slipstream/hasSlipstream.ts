import { playerList } from "../../changePlayerState/playerList";
import { constants } from "../constants";

export function playerHasSlipstream(
  playerId: number,
  room: RoomObject
): boolean {
  const info = playerList[playerId];
  if (!info) return false;

  if (info.slipstreamEndTime === undefined) return true;

  return (
    room.getScores().time - info.slipstreamEndTime <=
    constants.RESIDUAL_SLIPSTREAM_TIME
  );
}

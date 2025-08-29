import { playerList } from "../changePlayerState/playerList";
import { constants } from "../speed/constants";

export function applyCutPenalty(
  pad: { p: PlayerObject },
  penalty: number,
  room: RoomObject
) {
  const playerInfo = playerList[pad.p.id];
  const currentTime = room.getScores()?.time || 0;

  playerInfo.cutPenaltyEndTime = currentTime + penalty;
  playerInfo.cutPenaltyMultiplier = constants.PENALTY_SPEED;
}

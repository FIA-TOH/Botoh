import { playerList } from "../changePlayerState/playerList";
import { constants } from "../speed/constants";

export function applyCutPenalty(
  pad: { p: PlayerObject },
  penalty: number,
  room: RoomObject
) {
  const playerInfo = playerList[pad.p.id];
  const currentTime = room.getScores()?.time || 0;

  playerInfo.cutPenaltyEndTime = penalty > 0 ? currentTime + penalty : undefined;
  playerInfo.cutPenaltyMultiplier = penalty > 0 ? constants.PENALTY_SPEED : 1;
  playerInfo.cuttedTrackOnThisLap = true;
  playerInfo.lastLapValid = false;
}

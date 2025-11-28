import { calculateGripMultiplierForConditions } from "../grip/multiplierConditions";
import { constants } from "../constants";
import { PlayerInfo } from "../../changePlayerState/playerList";

/**
 * Calculates final grip value after penalties and ERS interactions
 */
export function calculateTotalGripMultiplier(
  p: PlayerObject,
  disc: DiscPropertiesObject,
  playerInfo: PlayerInfo,
  effectiveSlipstream: number,
  currentTime: number,
  room: RoomObject
) {
  const norm = Math.hypot(disc.xspeed, disc.yspeed);

  const isUsingERS = disc.damping === 0.986;
  const isIncoherentErs = playerInfo.kers <= 0 && isUsingERS;

  let gripMultiplier = calculateGripMultiplierForConditions(
    p,
    playerInfo.tires,
    playerInfo.wear,
    norm,
    disc,
    effectiveSlipstream,
    isIncoherentErs,
    isUsingERS,
    room
  );

  if (!gripMultiplier) {
    return 0;
  }

  if (
    playerInfo.cutPenaltyEndTime &&
    playerInfo.cutPenaltyMultiplier &&
    currentTime <= playerInfo.cutPenaltyEndTime
  ) {
    gripMultiplier *= playerInfo.cutPenaltyMultiplier;
  }

  return gripMultiplier;
}

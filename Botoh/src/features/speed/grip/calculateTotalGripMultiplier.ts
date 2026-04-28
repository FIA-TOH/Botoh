import { calculateGripMultiplierForConditions } from "../grip/multiplierConditions";
import { PlayerInfo } from "../../changePlayerState/playerList";
import { constants } from "../constants";

/**
 * Calculates final grip value after penalties and ERS interactions
 */
export function calculateTotalGripMultiplier(
  p: PlayerObject,
  disc: DiscPropertiesObject,
  playerInfo: PlayerInfo,
  effectiveSlipstream: number,
  currentTime: number,
  room: RoomObject,
) {
  const norm = Math.hypot(disc.xspeed, disc.yspeed);

  const isUsingERS = disc.damping === 0.986 || disc.damping === 0.9905;
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
    room,
  );

  if (gripMultiplier == null) {
    return 0;
  }

  if (
    playerInfo.cutPenaltyEndTime && 
    playerInfo.cutPenaltyMultiplier &&
    currentTime <= playerInfo.cutPenaltyEndTime
  ) {
    gripMultiplier *= playerInfo.cutPenaltyMultiplier;
  }

  if (playerInfo.isManagingTyres) {
    gripMultiplier -= constants.MANAGE_TYRES_PENALTY;
  }
  if (playerInfo.isTyreBlowed) {
    gripMultiplier -= constants.TYRES_BLOWED;
  }
  return gripMultiplier;
}

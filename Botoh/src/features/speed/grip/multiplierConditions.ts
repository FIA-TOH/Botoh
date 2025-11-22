import { playerList } from "../../changePlayerState/playerList";
// import { isRaining } from "../../rain/rain";
import { Tires, tyresActivated } from "../../tires&pits/tires";
import { constants } from "../constants";
import { calculateGripForDryConditions } from "./dryCondition";
import { calculateGripForWetConditions } from "./wetCondition";
import { slipstreamEnabled, gasEnabled } from "../handleSlipstream";
import { ersActivated, ersPenalty } from "../fuel&Ers/ers";
import { vsc } from "../../safetyCar/vsc";
import { fuelGripCalc } from "../fuel&Ers/fuelGrip";
import { engineGripCalc } from "../development/engine";
import { chassiGripCalc } from "../development/chassi";
import { vectorSpeed } from "../../utils";

const isRaining = false;

export function calculateGripMultiplierForConditions(
  player: PlayerObject,
  tyres: Tires,
  wear: number,
  norm: number,
  playerDisc: DiscPropertiesObject,
  effectiveSlipstream: number,
  isUsingErsInco: boolean,
  isUsingErs: boolean,
  room: RoomObject
) {
  const p = playerList[player.id];

  // Player is in the pitlane or VSC is active → car should be restricted
  if (playerList.inPitLane || vsc) {
    return;
  } else if (!tyresActivated) {
    /**
     * =============================
     *  CASE 1 — TYRES NOT ACTIVATED
     * =============================
     * Used for simplified/test modes or cases where tyre logic is disabled.
     * Grip is simply the base speed + basic modifiers.
     */
    let grip = constants.NORMAL_SPEED;

    // DRS speed bonus
    if (p.drs) {
      grip += constants.DRS_SPEED_GAIN;
    }

    // Slipstream gives additional speed
    if (effectiveSlipstream && slipstreamEnabled) {
      grip += effectiveSlipstream;
    }

    // ERS incorrect usage penalty
    if (isUsingErsInco && ersPenalty) {
      grip += constants.ERS_PENALTY;
    }

    // Trying to use ERS outside the activation zone → penalty
    if (isUsingErs && !ersActivated && ersPenalty) {
      grip += constants.ERS_PENALTY;
    }

    // Fuel load penalty (heavier car = slower)
    if (gasEnabled) {
      const gasFactor = p.gas / 100;
      const gasPenalty = constants.FULL_GAS_SPEED * gasFactor;
      grip -= gasPenalty;
    }

    return grip;
  } else if (!isRaining) {
    /**
     * ===========================================
     *  CASE 2 — DRY CONDITIONS AND TYRES ENABLED
     * ===========================================
     * Grip is derived from tyre compound + wear + track norm,
     * then we apply additional bonuses and penalties.
     */
    // Base grip from tyre behavior in dry conditions
    let grip = calculateGripForDryConditions(tyres, wear, norm) ?? 1;

    // DRS bonus
    if (p.drs) {
      grip += constants.DRS_SPEED_GAIN;
    }

    // Slipstream bonus
    if (effectiveSlipstream > 0 && slipstreamEnabled) {
      grip += effectiveSlipstream;
    }

    // ERS incorrect usage penalty
    if (isUsingErsInco && ersPenalty) {
      grip += constants.ERS_PENALTY;
    }

    // ERS activation attempt outside allowed zones
    if (isUsingErs && !ersActivated && ersPenalty) {
      grip += constants.ERS_PENALTY;
    }

    // Fuel load penalty (except with TRAIN tyres)
    grip = fuelGripCalc(p, grip);

    // Engine calculation penalty
    grip = engineGripCalc(p, grip, playerDisc, player, room);

    // Chassis calculation penalty
    grip = chassiGripCalc(p, grip);

    const speed = vectorSpeed(playerDisc.xspeed, playerDisc.yspeed);
    room.setPlayerAvatar(player.id, speed.toString());

    return grip;
  } else {
    /**
     * ======================
     *  CASE 3 — WET CONDITIONS
     * ======================
     */
    return calculateGripForWetConditions(tyres, wear, norm);
  }
}

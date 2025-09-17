import { vsc } from "../handleSpeed";

import { playerList } from "../../changePlayerState/playerList";
// import { isRaining } from "../../rain/rain";
import { Tires } from "../../tires&pits/tires";
import { constants } from "../constants";
import { calculateGripForDryConditions } from "./dryCondition";
import { calculateGripForWetConditions } from "./wetCondition";
import { slipstreamEnabled, gasEnabled } from "../handleSlipstream";
import { tyresActivated } from "../../commands/tyres/handleEnableTyresCommand";

const isRaining = false;

export function calculateGripMultiplierForConditions(
  player: PlayerObject,
  tyres: Tires,
  wear: number,
  norm: number,
  playerDisc: DiscPropertiesObject,
  effectiveSlipstream: number,
  isUsingErsInco: boolean
) {
  const p = playerList[player.id];
  if (playerList.inPitLane || vsc) {
    return;
  } else if (!tyresActivated) {
    let grip = constants.NORMAL_SPEED;
    if (p.drs) {
      grip += constants.DRS_SPEED_GAIN;
    }
    if (effectiveSlipstream && slipstreamEnabled) {
      grip += effectiveSlipstream;
    }
    if (isUsingErsInco) {
      grip += constants.ERS_PENALTY;
    }
    if (gasEnabled) {
      const gasFactor = p.gas / 100;
      const gasPenalty = constants.FULL_GAS_SPEED * gasFactor;
      grip -= gasPenalty;
    }
    return grip;
  } else if (!isRaining) {
    let grip = calculateGripForDryConditions(tyres, wear, norm) ?? 1;
    if (p.drs) {
      grip += constants.DRS_SPEED_GAIN;
    }
    if (effectiveSlipstream > 0 && slipstreamEnabled) {
      grip += effectiveSlipstream;
    }
    if (isUsingErsInco) {
      grip += constants.ERS_PENALTY;
    }
    if (gasEnabled && p.tires != Tires.TRAIN) {
      let gasPenalty;
      if (p.gas > 0) {
        const gasFactor = p.gas / 100;
        gasPenalty = constants.FULL_GAS_SPEED * gasFactor;
      } else {
        gasPenalty = constants.ZERO_GAS_PENALTY;
      }
      grip -= gasPenalty;
    }

    return grip;
  } else {
    return calculateGripForWetConditions(tyres, wear, norm);
  }
}

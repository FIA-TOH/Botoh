import { constants } from "./constants";
import { tyresActivated } from "./handleCommands";
import { gasEnabled, slipstreamEnabled } from "./handleSlipstream";
import { vsc } from "./handleSpeed";
import { laps } from "./laps";
import { playerList } from "./playerList";
import { isRaining, rainEnabled, rainIntensity } from "./rain";
import { Tires } from "./tires";

export function updateGripCounter(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[]
) {
  playersAndDiscs.forEach((player) => {
    const playerInfo = playerList[player.p.id];

    if (isRaining && rainEnabled) {
      playerInfo.gripCounter++;
    }

    playerList[player.p.id] = playerInfo;
  });
}

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

function calculateGripForDryConditions(
  tyres: Tires,
  wear: number,
  norm: Number
) {
  if (!norm) return;
  if (laps >= 23) {
    switch (tyres) {
      case "SOFT":
        return calculateGripMultiplier(wear, norm, 1.0, 0.993);
      case "MEDIUM":
        return calculateGripMultiplier(wear, norm, 0.9999, 0.994);
      case "HARD":
        return calculateGripMultiplier(wear, norm, 0.9998, 0.995);
      case "INTER":
        return calculateGripMultiplier(wear, norm, 0.998, 0.995);
      case "WET":
        return calculateGripMultiplier(wear, norm, 0.997, 0.994);
      case "FLAT":
        return 0.99;
      case "TRAIN":
        return 1.0;
    }
  } else {
    switch (tyres) {
      case "SOFT":
        return calculateGripMultiplier(wear, norm, 1.0, 0.996);
      case "MEDIUM":
        return calculateGripMultiplier(wear, norm, 0.99975, 0.9965);
      case "HARD":
        return calculateGripMultiplier(wear, norm, 0.9995, 0.997);
      case "INTER":
        return calculateGripMultiplier(wear, norm, 0.998, 0.995);
      case "WET":
        return calculateGripMultiplier(wear, norm, 0.997, 0.994);
      case "FLAT":
        return 0.99;
      case "TRAIN":
        return 1.0;
    }
  }
}

function calculateGripForWetConditions(
  tyres: Tires,
  wear: number,
  norm: Number
) {
  if (!norm) return;

  const normalizedRain = rainIntensity / 100;

  switch (tyres) {
    case "TRAIN":
    case "SOFT":
    case "MEDIUM":
    case "HARD": {
      // Decaimento linear de 0.001 a cada 10% de intensidade de chuva
      const rainImpact = Math.floor(normalizedRain / 0.1) * 0.001;
      const maxGrip = 0.998 - rainImpact;
      const minGrip = 0.995 - rainImpact;
      return calculateGripMultiplier(wear, norm, maxGrip, minGrip);
    }

    case "INTER": {
      if (normalizedRain <= 0.4) {
        return calculateGripMultiplier(wear, norm, 1, 0.995);
      } else {
        const rainImpact = Math.floor((normalizedRain - 0.4) / 0.1) * 0.001;
        const maxGrip = 1 - rainImpact;
        const minGrip = 0.995 - rainImpact;
        return calculateGripMultiplier(wear, norm, maxGrip, minGrip);
      }
    }

    case "WET": {
      if (normalizedRain >= 0.4) {
        return calculateGripMultiplier(wear, norm, 1, 0.995);
      } else {
        const rainImpact = Math.floor((0.4 - normalizedRain) / 0.1) * 0.001;
        const maxGrip = 1 - rainImpact;
        const minGrip = 0.995 - rainImpact;
        return calculateGripMultiplier(wear, norm, maxGrip, minGrip);
      }
    }

    case "FLAT":
      return 0.99;

    default:
      return;
  }
}

function calculateGripMultiplier(
  wear: number,
  norm: Number,
  maxGrip: number,
  minGrip: number
) {
  // 100% = tyreWear0, 0% = tyreWear100
  if (wear > 40) {
    const wearFactor = 0.1 * 1.6 ** ((wear - 40) / 10) - 0.1;
    return maxGrip - wearFactor * (maxGrip - minGrip);
  } else if (wear > 10) {
    return maxGrip;
  } else {
    return maxGrip - 0.0003;
  }
}

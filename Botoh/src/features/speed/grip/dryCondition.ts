import { Tires } from "../../tires&pits/tires";
import { laps } from "../../zones/laps";
import { currentWeather } from "../../weather/currentWeather";
import { playerList } from "../../changePlayerState/playerList";

import { calculateGripMultiplier } from "./grip";

const GRIP_BASE_VALUES = {
  SOFT_LATE_LAPS_INITIAL: 1.0,
  SOFT_LATE_LAPS_FINAL: 0.993,
  MEDIUM_LATE_LAPS_INITIAL: 0.9999,
  MEDIUM_LATE_LAPS_FINAL: 0.994,
  HARD_LATE_LAPS_INITIAL: 0.9998,
  HARD_LATE_LAPS_FINAL: 0.995,
  
  SOFT_EARLY_LAPS_INITIAL: 1.0,
  SOFT_EARLY_LAPS_FINAL: 0.996,
  MEDIUM_EARLY_LAPS_INITIAL: 0.99975,
  MEDIUM_EARLY_LAPS_FINAL: 0.9965,
  HARD_EARLY_LAPS_INITIAL: 0.9995,
  HARD_EARLY_LAPS_FINAL: 0.997,
  
  INTER_BASE_DRY: 0.9990,
  INTER_LATE_LAPS_FINAL: 0.994,
  INTER_EARLY_LAPS_FINAL: 0.995,
  
  WET_BASE_DRY: 0.9990,
  WET_LATE_LAPS_FINAL: 0.995,
  WET_EARLY_LAPS_FINAL: 0.994,
  
  FLAT_GRIP: 0.99,
  TRAIN_GRIP: 1.0,
} as const;

const RAIN_GRIP_VALUES = {
  INTER_MAX_INCREASE_PERCENT: 10,
  INTER_MAINTAIN_UNTIL_PERCENT: 65,
  INTER_DECREASE_START_PERCENT: 65,
  
  WET_MAX_INCREASE_PERCENT: 50,
  INTER_ZERO_WET_PENALTY_MULTIPLIER: 1.30,
  INTER_LOW_WET_PENALTY_MULTIPLIER: 1.15,
  INTER_HIGH_WET_PENALTY_MULTIPLIER: 1.5,
  WET_ZERO_WET_PENALTY_MULTIPLIER: 1.35,
  WET_LOW_WET_PENALTY_MULTIPLIER: 1.30,
  
  DRY_TYRE_LOSS_FIRST_10_PERCENT: 0.00075,
  DRY_TYRE_LOSS_10_TO_20_PERCENT: 0.0015,
  DRY_TYRE_LOSS_PER_10_PERCENT_AFTER_20: 0.0015,
} as const;

function calculateDynamicGripForCondition(
  baseGrip: number,
  conditionPercent: number,
  maxConditionPercent: number,
  maxGrip: number
): number {
  if (conditionPercent <= 0) return baseGrip;
  if (conditionPercent >= maxConditionPercent) return maxGrip;
  const ratio = conditionPercent / maxConditionPercent;
  return baseGrip + (maxGrip - baseGrip) * ratio;
}

function increaseGripPenalty(grip: number, multiplier: number): number {
  return 1 - (1 - grip) * multiplier;
}

function getPlayerSectorWet(playerId: number): number {
  const player = playerList[playerId];
  if (!player) return 0;
  const sector = player.currentSector || 1;
  switch (sector) {
    case 1:
      return currentWeather.wetS1;
    case 2:
      return currentWeather.wetS2;
    case 3:
      return currentWeather.wetS3;
    default:
      return currentWeather.wetS1;
  }
}

function calculateInterGripForWet(wetPercent: number): number {
  if (wetPercent <= 0) {
    return increaseGripPenalty(
      GRIP_BASE_VALUES.INTER_BASE_DRY,
      RAIN_GRIP_VALUES.INTER_ZERO_WET_PENALTY_MULTIPLIER
    );
  }
  
  if (wetPercent <= RAIN_GRIP_VALUES.INTER_MAX_INCREASE_PERCENT) {
    return increaseGripPenalty(
      calculateDynamicGripForCondition(
        GRIP_BASE_VALUES.INTER_BASE_DRY,
        wetPercent,
        RAIN_GRIP_VALUES.INTER_MAX_INCREASE_PERCENT,
        1.0
      ),
      RAIN_GRIP_VALUES.INTER_LOW_WET_PENALTY_MULTIPLIER
    );
  } else if (wetPercent <= RAIN_GRIP_VALUES.INTER_MAINTAIN_UNTIL_PERCENT) {
    return 1.0;
  } else {
    return increaseGripPenalty(
      calculateDynamicGripForCondition(
        1.0,
        wetPercent - RAIN_GRIP_VALUES.INTER_DECREASE_START_PERCENT,
        100 - RAIN_GRIP_VALUES.INTER_DECREASE_START_PERCENT,
        GRIP_BASE_VALUES.INTER_BASE_DRY
      ),
      RAIN_GRIP_VALUES.INTER_HIGH_WET_PENALTY_MULTIPLIER
    );
  }
}

function calculateWetGripForWet(wetPercent: number): number {
  if (wetPercent <= 0) {
    return increaseGripPenalty(
      GRIP_BASE_VALUES.WET_BASE_DRY,
      RAIN_GRIP_VALUES.WET_ZERO_WET_PENALTY_MULTIPLIER
    );
  }
  if (wetPercent >= RAIN_GRIP_VALUES.WET_MAX_INCREASE_PERCENT) return 1.0;
  return increaseGripPenalty(
    calculateDynamicGripForCondition(
      GRIP_BASE_VALUES.WET_BASE_DRY,
      wetPercent,
      RAIN_GRIP_VALUES.WET_MAX_INCREASE_PERCENT,
      1.0
    ),
    RAIN_GRIP_VALUES.WET_LOW_WET_PENALTY_MULTIPLIER
  );
}

function calculateDryTyreGripLoss(wetPercent: number): number {
  if (wetPercent <= 0) return 0;
  
  if (wetPercent <= 10) {
    return RAIN_GRIP_VALUES.DRY_TYRE_LOSS_FIRST_10_PERCENT * (wetPercent / 10);
  } else if (wetPercent <= 20) {
    const additionalLoss = RAIN_GRIP_VALUES.DRY_TYRE_LOSS_FIRST_10_PERCENT * ((wetPercent - 10) / 10);
    return RAIN_GRIP_VALUES.DRY_TYRE_LOSS_FIRST_10_PERCENT + additionalLoss;
  } else {
    const baseLoss = RAIN_GRIP_VALUES.DRY_TYRE_LOSS_10_TO_20_PERCENT;
    const additionalLoss = RAIN_GRIP_VALUES.DRY_TYRE_LOSS_PER_10_PERCENT_AFTER_20 * Math.floor((wetPercent - 20) / 10);
    return baseLoss + additionalLoss;
  }
}

export function calculateGripForDryConditions(
  tyres: Tires,
  wear: number,
  norm: Number,
  playerId: number,
) {
  if (!norm) return;
  if (laps >= 15) {
    switch (tyres) {
      case "SOFT": {
        const sectorWet = getPlayerSectorWet(playerId);
        const gripLoss = calculateDryTyreGripLoss(sectorWet);
        return calculateGripMultiplier(wear, norm, GRIP_BASE_VALUES.SOFT_LATE_LAPS_INITIAL - gripLoss, GRIP_BASE_VALUES.SOFT_LATE_LAPS_FINAL);
      }
      case "MEDIUM": {
        const sectorWet = getPlayerSectorWet(playerId);
        const gripLoss = calculateDryTyreGripLoss(sectorWet);
        return calculateGripMultiplier(wear, norm, GRIP_BASE_VALUES.MEDIUM_LATE_LAPS_INITIAL - gripLoss, GRIP_BASE_VALUES.MEDIUM_LATE_LAPS_FINAL);
      }
      case "HARD": {
        const sectorWet = getPlayerSectorWet(playerId);
        const gripLoss = calculateDryTyreGripLoss(sectorWet);
        return calculateGripMultiplier(wear, norm, GRIP_BASE_VALUES.HARD_LATE_LAPS_INITIAL - gripLoss, GRIP_BASE_VALUES.HARD_LATE_LAPS_FINAL);
      }
      case "INTER": {
        const sectorWet = getPlayerSectorWet(playerId);
        const dynamicGrip = calculateInterGripForWet(sectorWet);
        return calculateGripMultiplier(wear, norm, dynamicGrip, GRIP_BASE_VALUES.INTER_LATE_LAPS_FINAL);
      }
      case "WET": {
        const sectorWet = getPlayerSectorWet(playerId);
        const dynamicGrip = calculateWetGripForWet(sectorWet);
        return calculateGripMultiplier(wear, norm, dynamicGrip, GRIP_BASE_VALUES.WET_LATE_LAPS_FINAL);
      }
      case "FLAT":
        return GRIP_BASE_VALUES.FLAT_GRIP;
      case "TRAIN":
        return GRIP_BASE_VALUES.TRAIN_GRIP;
    }
  } else {
    switch (tyres) {
      case "SOFT": {
        const sectorWet = getPlayerSectorWet(playerId);
        const gripLoss = calculateDryTyreGripLoss(sectorWet);
        return calculateGripMultiplier(wear, norm, GRIP_BASE_VALUES.SOFT_EARLY_LAPS_INITIAL - gripLoss, GRIP_BASE_VALUES.SOFT_EARLY_LAPS_FINAL);
      }
      case "MEDIUM": {
        const sectorWet = getPlayerSectorWet(playerId);
        const gripLoss = calculateDryTyreGripLoss(sectorWet);
        return calculateGripMultiplier(wear, norm, GRIP_BASE_VALUES.MEDIUM_EARLY_LAPS_INITIAL - gripLoss, GRIP_BASE_VALUES.MEDIUM_EARLY_LAPS_FINAL);
      }
      case "HARD": {
        const sectorWet = getPlayerSectorWet(playerId);
        const gripLoss = calculateDryTyreGripLoss(sectorWet);
        return calculateGripMultiplier(wear, norm, GRIP_BASE_VALUES.HARD_EARLY_LAPS_INITIAL - gripLoss, GRIP_BASE_VALUES.HARD_EARLY_LAPS_FINAL);
      }
      case "INTER": {
        const sectorWet = getPlayerSectorWet(playerId);
        const dynamicGrip = calculateInterGripForWet(sectorWet);
        return calculateGripMultiplier(wear, norm, dynamicGrip, GRIP_BASE_VALUES.INTER_EARLY_LAPS_FINAL);
      }
      case "WET": {
        const sectorWet = getPlayerSectorWet(playerId);
        const dynamicGrip = calculateWetGripForWet(sectorWet);
        return calculateGripMultiplier(wear, norm, dynamicGrip, GRIP_BASE_VALUES.WET_EARLY_LAPS_FINAL);
      }
      case "FLAT":
        return GRIP_BASE_VALUES.FLAT_GRIP;
      case "TRAIN":
        return GRIP_BASE_VALUES.TRAIN_GRIP;
    }
  }
}

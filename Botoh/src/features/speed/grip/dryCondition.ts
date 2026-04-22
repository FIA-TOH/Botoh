import { Tires, tyresActivated } from "../../tires&pits/tires";
import { laps } from "../../zones/laps";
import { constants } from "../constants";
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
  INTER_MAINTAIN_UNTIL_PERCENT: 75,
  INTER_DECREASE_START_PERCENT: 75,
  
  WET_MAX_INCREASE_PERCENT: 50,
  
  DRY_TYRE_LOSS_FIRST_10_PERCENT: 0.00075,
  DRY_TYRE_LOSS_10_TO_20_PERCENT: 0.0015,
  DRY_TYRE_LOSS_PER_10_PERCENT_AFTER_20: 0.0015,
} as const;

function calculateDynamicGripForRain(
  baseGrip: number,
  rainPercent: number,
  maxRainPercent: number,
  maxGrip: number
): number {
  if (rainPercent <= 0) return baseGrip;
  if (rainPercent >= maxRainPercent) return maxGrip;
  const ratio = rainPercent / maxRainPercent;
  return baseGrip + (maxGrip - baseGrip) * ratio;
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
  if (wetPercent <= 0) return GRIP_BASE_VALUES.INTER_BASE_DRY;
  
  if (wetPercent <= RAIN_GRIP_VALUES.INTER_MAX_INCREASE_PERCENT) {
    return calculateDynamicGripForRain(GRIP_BASE_VALUES.INTER_BASE_DRY, wetPercent, RAIN_GRIP_VALUES.INTER_MAX_INCREASE_PERCENT, 1.0);
  } else if (wetPercent <= RAIN_GRIP_VALUES.INTER_MAINTAIN_UNTIL_PERCENT) {
    return 1.0;
  } else {
    return calculateDynamicGripForRain(1.0, wetPercent - RAIN_GRIP_VALUES.INTER_DECREASE_START_PERCENT, 25, GRIP_BASE_VALUES.INTER_BASE_DRY);
  }
}

function calculateWetGripForWet(wetPercent: number): number {
  if (wetPercent <= 0) return GRIP_BASE_VALUES.WET_BASE_DRY;
  if (wetPercent >= RAIN_GRIP_VALUES.WET_MAX_INCREASE_PERCENT) return 1.0;
  return calculateDynamicGripForRain(GRIP_BASE_VALUES.WET_BASE_DRY, wetPercent, RAIN_GRIP_VALUES.WET_MAX_INCREASE_PERCENT, 1.0);
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

import { Tires } from "../../tires&pits/tires";
import { playerList } from "../../changePlayerState/playerList";
import { getCurrentTireType, calculateTotalDrift } from "../../weather/rain/driftCalculator";
import { currentWeather } from "../../weather/currentWeather";

const DRIFT_MULTIPLIERS = {
  SOFT_DRIFT_MULTIPLIER: 1.0,
  MEDIUM_DRIFT_MULTIPLIER: 1.0,
  HARD_DRIFT_MULTIPLIER: 1.0,
  
  INTER_DRIFT_MULTIPLIER: 1.0,
  WET_DRIFT_MULTIPLIER: 1.0,
  
  FLAT_DRIFT_MULTIPLIER: 0.0,
  TRAIN_DRIFT_MULTIPLIER: 0.0,
} as const;

const DRIFT_PENALTY_BASE = 0.001;
export function calculateDriftPenalty(
  playerId: number,
  tyres: Tires,
  currentTime: number
): number {
  const playerInfo = playerList[playerId];
  if (!playerInfo) return 0;
  
  const currentSector = playerInfo.currentSector || 1;
  
  let wetness = currentWeather.wetAvg;
  switch (currentSector) {
    case 1:
      wetness = currentWeather.wetS1;
      break;
    case 2:
      wetness = currentWeather.wetS2;
      break;
    case 3:
      wetness = currentWeather.wetS3;
      break;
  }
  
  if (wetness <= 0) return 0;
  
  const wetnessDrift = (wetness / 100) * 50;
  
  const driftMultiplier = getDriftMultiplier(tyres);
  
  if (driftMultiplier === 0) return 0;
  
  const basePenalty = (wetnessDrift / 100) * DRIFT_PENALTY_BASE;
  
  const finalPenalty = basePenalty * driftMultiplier;
  
  return finalPenalty;
}

function getDriftMultiplier(tyres: Tires): number {
  switch (tyres) {
    case "SOFT":
      return DRIFT_MULTIPLIERS.SOFT_DRIFT_MULTIPLIER;
    case "MEDIUM":
      return DRIFT_MULTIPLIERS.MEDIUM_DRIFT_MULTIPLIER;
    case "HARD":
      return DRIFT_MULTIPLIERS.HARD_DRIFT_MULTIPLIER;
    case "INTER":
      return DRIFT_MULTIPLIERS.INTER_DRIFT_MULTIPLIER;
    case "WET":
      return DRIFT_MULTIPLIERS.WET_DRIFT_MULTIPLIER;
    case "FLAT":
      return DRIFT_MULTIPLIERS.FLAT_DRIFT_MULTIPLIER;
    case "TRAIN":
      return DRIFT_MULTIPLIERS.TRAIN_DRIFT_MULTIPLIER;
    default:
      return 1.0;
  }
}

export function applyFinalDriftFactor(
  grip: number,
  playerId: number,
  tyres: Tires,
  currentTime: number
): number {
  const driftPenalty = calculateDriftPenalty(playerId, tyres, currentTime);
  
  const finalGrip = grip - driftPenalty;
  
  return Math.max(finalGrip, 0);
}

import { DRIFT_CONFIG, TireType, DEFAULT_VALUES } from '../driftConfig';
import { currentWeather } from '../currentWeather';
import { Tires } from '../../tires&pits/tires';


export function calculateWetnessDrift(wetness: number): number {
  const { WETNESS_MIN, WETNESS_MAX } = DRIFT_CONFIG.WETNESS_IMPACT;
  
  return WETNESS_MIN + (wetness / 100) * (WETNESS_MAX - WETNESS_MIN);
}

export function calculateWetTrackDrift(wetness: number, tireType: TireType): number {
  const { WET_TRACK_THRESHOLDS, WET_TRACK_EXPONENTIAL_FACTORS } = DRIFT_CONFIG;
  
  let threshold: number;
  let exponentialFactor: number;
  
  switch (tireType) {
    case TireType.DRY:
      threshold = WET_TRACK_THRESHOLDS.DRY_TIRE;
      exponentialFactor = WET_TRACK_EXPONENTIAL_FACTORS.DRY_TIRE;
      break;
    case TireType.INTER:
      threshold = WET_TRACK_THRESHOLDS.INTER_TIRE;
      exponentialFactor = WET_TRACK_EXPONENTIAL_FACTORS.INTER_TIRE;
      break;
    case TireType.WET:
      threshold = WET_TRACK_THRESHOLDS.WET_TIRE;
      exponentialFactor = WET_TRACK_EXPONENTIAL_FACTORS.WET_TIRE;
      break;
    default:
      return 0;
  }
  
  let maxDrift = DEFAULT_VALUES.WET_TRACK_BONUS_MAX;
  if (tireType === TireType.INTER) {
    maxDrift = 75;
  } else if (tireType === TireType.WET) {
    maxDrift = 30;
  }
  
  if (tireType === TireType.WET) {
    const normalizedWetness = wetness / 100;
    const drift = maxDrift * (normalizedWetness * normalizedWetness);
    return Math.min(drift, maxDrift);
  }
  
  if (tireType === TireType.INTER) {
    const normalizedWetness = wetness / threshold;
    const drift = maxDrift * (normalizedWetness * normalizedWetness);
    return Math.min(drift, maxDrift);
  }
  
  if (wetness >= threshold) {
    return maxDrift;
  }
  
  const normalizedWetness = wetness / threshold;
  const drift = maxDrift * (1 - Math.exp(-exponentialFactor * normalizedWetness * 10));
  
  return Math.min(drift, maxDrift);
}

const driftCache = new Map<string, number>();
let lastWeatherUpdate = 0;


export function shouldCalculateDrift(wetness: number): boolean {
  return wetness > 0;
}


function getDriftCacheKey(
  tireType: TireType,
  sector: number,
  wetness: number
): string {
  return `${tireType}_${sector}_${wetness}`;
}


function shouldClearCache(currentTime: number): boolean {
  return currentTime - lastWeatherUpdate > 5000;
}

export function calculateTotalDrift(tireType: TireType, sector: number, currentTime: number = 0): number {
  let wetness = currentWeather.wetAvg;
  
  switch (sector) {
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
  
  if (!shouldCalculateDrift(wetness)) {
    return 0;
  }
  
  const cacheKey = getDriftCacheKey(tireType, sector, wetness);
  
  if (shouldClearCache(currentTime)) {
    driftCache.clear();
    lastWeatherUpdate = currentTime;
  }
  
  if (driftCache.has(cacheKey)) {
    return driftCache.get(cacheKey)!;
  }
  
  const wetnessDrift = calculateWetnessDrift(wetness);
  const wetTrackDrift = calculateWetTrackDrift(wetness, tireType);
  
  const totalDrift = wetnessDrift + wetTrackDrift;
  let finalDrift = Math.min(totalDrift, DEFAULT_VALUES.MAX_TOTAL_DRIFT);
  
  if (tireType === TireType.DRY) {
    finalDrift = Math.min(finalDrift * 4, DEFAULT_VALUES.MAX_TOTAL_DRIFT);
  } else if (tireType === TireType.WET) {
    finalDrift *= 0.5;
  }
  
  driftCache.set(cacheKey, finalDrift);
  
  return finalDrift;
}

export function driftToForceMultiplier(driftValue: number, detectorForce: number): number {
  const driftMultiplier = driftValue / 100;
  
  return driftMultiplier * detectorForce * DRIFT_CONFIG.DRIFT_MULTIPLIER;
}

export function getCurrentTireType(playerInfo: any): TireType {
  if (!playerInfo || !playerInfo.tires) {
    return TireType.DRY;
  }
  
  switch (playerInfo.tires) {
    case Tires.SOFT:
    case Tires.MEDIUM:
    case Tires.HARD:
      return TireType.DRY;
    case Tires.INTER:
      return TireType.INTER;
    case Tires.WET:
      return TireType.WET;
    default:
      return TireType.DRY;
  }
}

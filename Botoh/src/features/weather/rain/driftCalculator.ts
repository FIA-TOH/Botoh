import { DRIFT_CONFIG, TireType, DEFAULT_VALUES } from '../driftConfig';
import { currentWeather } from '../currentWeather';
import { Tires } from '../../tires&pits/tires';


export function calculateWetnessDrift(wetness: number): number {
  const { WETNESS_MIN, WETNESS_MAX } = DRIFT_CONFIG.WETNESS_IMPACT;
  
  return WETNESS_MIN + (wetness / 100) * (WETNESS_MAX - WETNESS_MIN);
}

export function calculateRainDrift(rainAmount: number, tireType: TireType): number {
  const { RAIN_THRESHOLDS, EXPONENTIAL_FACTORS } = DRIFT_CONFIG;
  
  let threshold: number;
  let exponentialFactor: number;
  
  switch (tireType) {
    case TireType.DRY:
      threshold = RAIN_THRESHOLDS.DRY_TIRE;
      exponentialFactor = EXPONENTIAL_FACTORS.DRY_TIRE;
      break;
    case TireType.INTER:
      threshold = RAIN_THRESHOLDS.INTER_TIRE;
      exponentialFactor = EXPONENTIAL_FACTORS.INTER_TIRE;
      break;
    case TireType.WET:
      threshold = RAIN_THRESHOLDS.WET_TIRE;
      exponentialFactor = EXPONENTIAL_FACTORS.WET_TIRE;
      break;
    default:
      return 0;
  }
  
  let maxDrift = DEFAULT_VALUES.RAIN_BONUS_MAX;
  if (tireType === TireType.INTER) {
    maxDrift = 75;
  } else if (tireType === TireType.WET) {
    maxDrift = 30;
  }
  
  if (tireType === TireType.WET) {
    const normalizedRain = rainAmount / 100;
    const drift = maxDrift * (normalizedRain * normalizedRain);
    return Math.min(drift, maxDrift);
  }
  
  if (tireType === TireType.INTER) {
    const normalizedRain = rainAmount / threshold;
    const drift = maxDrift * (normalizedRain * normalizedRain);
    return Math.min(drift, maxDrift);
  }
  
  if (rainAmount >= threshold) {
    return maxDrift;
  }
  
  const normalizedRain = rainAmount / threshold;
  const drift = maxDrift * (1 - Math.exp(-exponentialFactor * normalizedRain * 10));
  
  return Math.min(drift, maxDrift);
}

const driftCache = new Map<string, number>();
let lastWeatherUpdate = 0;


export function shouldCalculateDrift(rainAmount: number, wetness: number): boolean {
  return wetness > 0 && rainAmount > 0;
}


function getDriftCacheKey(sector: number, rainAmount: number, wetness: number): string {
  return `${sector}_${rainAmount}_${wetness}`;
}


function shouldClearCache(currentTime: number): boolean {
  return currentTime - lastWeatherUpdate > 5000;
}

export function calculateTotalDrift(tireType: TireType, sector: number, currentTime: number = 0): number {
  let rainAmount = currentWeather.rainGlobal;
  let wetness = currentWeather.wetAvg;
  
  switch (sector) {
    case 1:
      rainAmount = currentWeather.rainS1;
      wetness = currentWeather.wetS1;
      break;
    case 2:
      rainAmount = currentWeather.rainS2;
      wetness = currentWeather.wetS2;
      break;
    case 3:
      rainAmount = currentWeather.rainS3;
      wetness = currentWeather.wetS3;
      break;
  }
  
  if (!shouldCalculateDrift(rainAmount, wetness)) {
    return 0;
  }
  
  const cacheKey = getDriftCacheKey(sector, rainAmount, wetness);
  
  if (shouldClearCache(currentTime)) {
    driftCache.clear();
    lastWeatherUpdate = currentTime;
  }
  
  if (driftCache.has(cacheKey)) {
    return driftCache.get(cacheKey)!;
  }
  
  const wetnessDrift = calculateWetnessDrift(wetness);
  const rainDrift = calculateRainDrift(rainAmount, tireType);
  
  const totalDrift = wetnessDrift + rainDrift;
  const finalDrift = Math.min(totalDrift, DEFAULT_VALUES.MAX_TOTAL_DRIFT);
  
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

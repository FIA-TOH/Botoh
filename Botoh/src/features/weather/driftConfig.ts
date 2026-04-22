export const DRIFT_CONFIG = {
  DRIFT_MIN: 0,
  DRIFT_MAX: 100,
  
  WETNESS_IMPACT: {
    WETNESS_MIN: 0,
    WETNESS_MAX: 50,
  },
  
  RAIN_THRESHOLDS: {
    DRY_TIRE: 30,
    INTER_TIRE: 75,
    WET_TIRE: 90,
  },
  
  DRIFT_MULTIPLIER: 0.500,
  
  DIRECTION_CHANGER_DURATION: 2,
  
  EXPONENTIAL_FACTORS: {
    DRY_TIRE: 0.15,
    INTER_TIRE: 0.05,
    WET_TIRE: 0.008,
  }
};

export enum TireType {
  DRY = 'dry',
  INTER = 'inter',
  WET = 'wet'
}

export const DEFAULT_VALUES = {
  BASE_DRIFT: 0,
  WETNESS_BONUS_MAX: 50,
  RAIN_BONUS_MAX: 50,
  MAX_TOTAL_DRIFT: 100,
};

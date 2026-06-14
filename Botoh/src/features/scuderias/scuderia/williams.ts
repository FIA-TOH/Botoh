import { Batery } from '../batery';
import { Chassis } from '../chassis';
import { Engine } from '../engine';
import { PitCrew } from '../pitstop';
import { ScuderiaColors } from '../scuderiaColours';
import { leagueScuderia } from '../scuderias';
import { Suspension } from '../tyres';

export const WilliamsEngine: Engine = {
  name: 'Williams Engine',
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const WilliamsChassis: Chassis = {
  name: 'Williams Chassis',
  accelerationNerf: 0,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const WilliamsBatery: Batery = {
  name: 'Williams Batery',
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const WilliamsSuspension: Suspension = {
  name: 'Williams Suspension',
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const WilliamsPitCrew: PitCrew = {
  name: 'Williams Pit Crew',
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Williams: leagueScuderia = {
  name: 'Williams',
  tag: 'WIL',
  color: ScuderiaColors.WILLIAMS,
  engine: WilliamsEngine,
  chassis: WilliamsChassis,
  batery: WilliamsBatery,
  suspension: WilliamsSuspension,
  pitCrew: WilliamsPitCrew,
};

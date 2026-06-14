import { Batery } from '../batery';
import { Chassis } from '../chassis';
import { Engine } from '../engine';
import { PitCrew } from '../pitstop';
import { ScuderiaColors } from '../scuderiaColours';
import { leagueScuderia } from '../scuderias';
import { Suspension } from '../tyres';

export const HrtEngine: Engine = {
  name: 'HRT Engine',
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const HrtChassis: Chassis = {
  name: 'HRT Chassis',
  accelerationNerf: 0,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const HrtBatery: Batery = {
  name: 'HRT Batery',
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const HrtSuspension: Suspension = {
  name: 'HRT Suspension',
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const HrtPitCrew: PitCrew = {
  name: 'HRT Pit Crew',
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Hrt: leagueScuderia = {
  name: 'HRT',
  tag: 'HRT',
  color: ScuderiaColors.HRT,
  engine: HrtEngine,
  chassis: HrtChassis,
  batery: HrtBatery,
  suspension: HrtSuspension,
  pitCrew: HrtPitCrew,
};

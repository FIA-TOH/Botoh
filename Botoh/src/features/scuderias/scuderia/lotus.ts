import { Batery } from '../batery';
import { Chassis } from '../chassis';
import { Engine } from '../engine';
import { PitCrew } from '../pitstop';
import { ScuderiaColors } from '../scuderiaColours';
import { leagueScuderia } from '../scuderias';
import { Suspension } from '../tyres';

export const LotusEngine: Engine = {
  name: 'Lotus Engine',
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const LotusChassis: Chassis = {
  name: 'Lotus Chassis',
  accelerationNerf: 0,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const LotusBatery: Batery = {
  name: 'Lotus Batery',
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const LotusSuspension: Suspension = {
  name: 'Lotus Suspension',
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const LotusPitCrew: PitCrew = {
  name: 'Lotus Pit Crew',
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Lotus: leagueScuderia = {
  name: 'Lotus',
  tag: 'LOT',
  color: ScuderiaColors.LOTUS,
  engine: LotusEngine,
  chassis: LotusChassis,
  batery: LotusBatery,
  suspension: LotusSuspension,
  pitCrew: LotusPitCrew,
};

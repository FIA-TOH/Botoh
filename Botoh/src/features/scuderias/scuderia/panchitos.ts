import { Batery } from '../batery';
import { Chassis } from '../chassis';
import { Engine } from '../engine';
import { PitCrew } from '../pitstop';
import { ScuderiaColors } from '../scuderiaColours';
import { leagueScuderia } from '../scuderias';
import { Suspension } from '../tyres';

export const PanchitosEngine: Engine = {
  name: 'Panchitos Engine',
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const PanchitosChassis: Chassis = {
  name: 'Panchitos Chassis',
  accelerationNerf: 0,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const PanchitosBatery: Batery = {
  name: 'Panchitos Batery',
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const PanchitosSuspension: Suspension = {
  name: 'Panchitos Suspension',
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const PanchitosPitCrew: PitCrew = {
  name: 'Panchitos Pit Crew',
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Panchitos: leagueScuderia = {
  name: 'Panchitos',
  tag: 'PAN',
  color: ScuderiaColors.PANCHITOS,
  engine: PanchitosEngine,
  chassis: PanchitosChassis,
  batery: PanchitosBatery,
  suspension: PanchitosSuspension,
  pitCrew: PanchitosPitCrew,
};

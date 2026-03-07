import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const HispalisEngine: Engine = {
  name: "Hispalis Engine",
  initialAccelerationNerf: 107,
  medialAccelerationNerf: 33,
  finalAccelerationNerf: 68,
  topSpeedBoostNerf: -0.8,
  confiability: 100,
};

export const HispalisChassis: Chassis = {
  name: "Hispalis Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 50,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const HispalisBatery: Batery = {
  name: "Hispalis Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const HispalisSuspension: Suspension = {
  name: "Hispalis Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const HispalisPitCrew: PitCrew = {
  name: "Hispalis Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Hispalis : leagueScuderia = {
  name: "Hispalis",
  tag: "HIS",
  color: ScuderiaColors.HISPALIS,
  engine: HispalisEngine,
  chassis: HispalisChassis,
  batery: HispalisBatery,
  suspension: HispalisSuspension,
  pitCrew: HispalisPitCrew,
};

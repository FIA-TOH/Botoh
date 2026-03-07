import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const CadillacEngine: Engine = {
  name: "Cadillac Engine",
  initialAccelerationNerf: 120,
  medialAccelerationNerf: 31,
  finalAccelerationNerf: 64,
  topSpeedBoostNerf: -0.6,
  confiability: 100,
};

export const CadillacChassis: Chassis = {
  name: "Cadillac Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 40,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const CadillacBatery: Batery = {
  name: "Cadillac Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const CadillacSuspension: Suspension = {
  name: "Cadillac Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const CadillacPitCrew: PitCrew = {
  name: "Cadillac Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Cadillac : leagueScuderia = {
  name: "Cadillac",
  tag: "CAD",
  color: ScuderiaColors.CADILLAC,
  engine: CadillacEngine,
  chassis: CadillacChassis,
  batery: CadillacBatery,
  suspension: CadillacSuspension,
  pitCrew: CadillacPitCrew,
};

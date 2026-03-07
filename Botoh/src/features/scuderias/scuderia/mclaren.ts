import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const MclarenEngine: Engine = {
  name: "Mclaren Engine",
  initialAccelerationNerf: 112,
  medialAccelerationNerf: 36,
  finalAccelerationNerf: 72,
  topSpeedBoostNerf: 1.72,
  confiability: 100,
};

export const MclarenChassis: Chassis = {
  name: "Mclaren Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 50,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const MclarenBatery: Batery = {
  name: "Mclaren Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const MclarenSuspension: Suspension = {
  name: "Mclaren Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const MclarenPitCrew: PitCrew = {
  name: "Mclaren Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Mclaren : leagueScuderia = {
  name: "Mclaren",
  tag: "MCL",
  color: ScuderiaColors.MCLAREN,
  engine: MclarenEngine,
  chassis: MclarenChassis,
  batery: MclarenBatery,
  suspension: MclarenSuspension,
  pitCrew: MclarenPitCrew,
};

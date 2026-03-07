import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const GenskeEngine: Engine = {
  name: "Genske Engine",
  initialAccelerationNerf: 120,
  medialAccelerationNerf: 30,
  finalAccelerationNerf: 54,
  topSpeedBoostNerf: -0.6,
  confiability: 100,
};

export const GenskeChassis: Chassis = {
  name: "Genske Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 32,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const GenskeBatery: Batery = {
  name: "Genske Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const GenskeSuspension: Suspension = {
  name: "Genske Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const GenskePitCrew: PitCrew = {
  name: "Genske Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Genske : leagueScuderia = {
  name: "Genske",
  tag: "GEN",
  color: ScuderiaColors.GENSKE,
  engine: GenskeEngine,
  chassis: GenskeChassis,
  batery: GenskeBatery,
  suspension: GenskeSuspension,
  pitCrew: GenskePitCrew,
};

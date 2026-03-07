import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const FerrariEngine: Engine = {
  name: "Ferrari Engine",
  initialAccelerationNerf: 120,
  medialAccelerationNerf: 40,
  finalAccelerationNerf: 74,
  topSpeedBoostNerf: 1.32,
  confiability: 100,
};

export const FerrariChassis: Chassis = {
  name: "Ferrari Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 26,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const FerrariBatery: Batery = {
  name: "Ferrari Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const FerrariSuspension: Suspension = {
  name: "Ferrari Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const FerrariPitCrew: PitCrew = {
  name: "Ferrari Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Ferrari: leagueScuderia = {
  name: "Ferrari",
  tag: "FER",
  color: ScuderiaColors.FERRARI,
  engine: FerrariEngine,
  chassis: FerrariChassis,
  batery: FerrariBatery,
  suspension: FerrariSuspension,
  pitCrew: FerrariPitCrew,
};

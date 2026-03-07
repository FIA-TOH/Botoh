import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const HRTEngine: Engine = {
  name: "HRT Engine",
  initialAccelerationNerf: 107,
  medialAccelerationNerf: 33,
  finalAccelerationNerf: 68,
  topSpeedBoostNerf: -0.4,
  confiability: 100,
};

export const HRTChassis: Chassis = {
  name: "HRT Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 50,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const HRTBatery: Batery = {
  name: "HRT Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const HRTSuspension: Suspension = {
  name: "HRT Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const HRTPitCrew: PitCrew = {
  name: "HRT Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const HRT : leagueScuderia = {
  name: "HRT",
  tag: "HRT",
  color: ScuderiaColors.HRT,
  engine: HRTEngine,
  chassis: HRTChassis,
  batery: HRTBatery,
  suspension: HRTSuspension,
  pitCrew: HRTPitCrew,
};

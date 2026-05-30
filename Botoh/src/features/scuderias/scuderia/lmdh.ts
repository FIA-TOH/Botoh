import { constants } from "../../speed/constants";
import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const LmdhEngine: Engine = {
  name: "Lmdh Engine",
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const LmdhChassis: Chassis = {
  name: "Lmdh Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const LmdhBatery: Batery = {
  name: "Lmdh Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const LmdhSuspension: Suspension = {
  name: "Lmdh Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const LmdhPitCrew: PitCrew = {
  name: "Lmdh Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Lmdh: leagueScuderia = {
  name: "Lmdh",
  tag: "LMDH",
  color: ScuderiaColors.LMDH,
  engine: LmdhEngine,
  chassis: LmdhChassis,
  batery: LmdhBatery,
  suspension: LmdhSuspension,
  pitCrew: LmdhPitCrew,
};

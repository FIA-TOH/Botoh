import { constants } from "../../speed/constants";
import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const GtEngine: Engine = {
  name: "Gt Engine",
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 3,
  confiability: 100,
};

export const GtChassis: Chassis = {
  name: "Gt Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const GtBatery: Batery = {
  name: "Gt Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const GtSuspension: Suspension = {
  name: "Gt Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const GtPitCrew: PitCrew = {
  name: "Gt Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Gt: leagueScuderia = {
  name: "Gt",
  tag: "Gt",
  color: ScuderiaColors.GT,
  engine: GtEngine,
  chassis: GtChassis,
  batery: GtBatery,
  suspension: GtSuspension,
  pitCrew: GtPitCrew,
};

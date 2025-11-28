import { constants } from "../../speed/constants";
import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const McLarperEngine: Engine = {
  name: "McLarper Engine",
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const McLarperChassis: Chassis = {
  name: "McLarper Chassis",
  accelerationNerf: 200,
  slipstreamNerf: -10,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const McLarperBatery: Batery = {
  name: "McLarper Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const McLarperSuspension: Suspension = {
  name: "McLarper Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const McLarperPitCrew: PitCrew = {
  name: "McLarper Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const McLarper: leagueScuderia = {
  name: "McLarper",
  tag: "MC",
  color: ScuderiaColors.MCLARPER,
  engine: McLarperEngine,
  chassis: McLarperChassis,
  batery: McLarperBatery,
  suspension: McLarperSuspension,
  pitCrew: McLarperPitCrew,
};

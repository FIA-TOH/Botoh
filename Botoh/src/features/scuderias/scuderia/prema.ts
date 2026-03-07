import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const PremaEngine: Engine = {
  name: "Prema Engine",
  initialAccelerationNerf: 120,
  medialAccelerationNerf: 40,
  finalAccelerationNerf: 74,
  topSpeedBoostNerf: 1.4,
  confiability: 100,
};

export const PremaChassis: Chassis = {
  name: "Prema Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 2,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const PremaBatery: Batery = {
  name: "Prema Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const PremaSuspension: Suspension = {
  name: "Prema Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const PremaPitCrew: PitCrew = {
  name: "Prema Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Prema : leagueScuderia = {
  name: "Prema",
  tag: "PRE",
  color: ScuderiaColors.PREMA,
  engine: PremaEngine,
  chassis: PremaChassis,
  batery: PremaBatery,
  suspension: PremaSuspension,
  pitCrew: PremaPitCrew,
};

import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const BmwSwissEngine: Engine = {
  name: "Bmw Swiss Engine",
  initialAccelerationNerf: 120,
  medialAccelerationNerf: 31,
  finalAccelerationNerf: 64,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const BmwSwissChassis: Chassis = {
  name: "Bmw Swiss Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 50,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const BmwSwissBatery: Batery = {
  name: "Bmw Swiss Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const BmwSwissSuspension: Suspension = {
  name: "Bmw Swiss Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const BmwSwissPitCrew: PitCrew = {
  name: "Bmw Swiss Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const BmwSwiss : leagueScuderia = {
  name: "Bmw Swiss",
  tag: "BMWS",
  color: ScuderiaColors.BMWSWISS,
  engine: BmwSwissEngine,
  chassis: BmwSwissChassis,
  batery: BmwSwissBatery,
  suspension: BmwSwissSuspension,
  pitCrew: BmwSwissPitCrew,
};

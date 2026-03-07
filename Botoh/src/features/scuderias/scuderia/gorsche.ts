import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const GorscheEngine: Engine = {
  name: "Gorsce Engine",
  initialAccelerationNerf: 120,
  medialAccelerationNerf: 30,
  finalAccelerationNerf: 54,
  topSpeedBoostNerf: -0.8,
  confiability: 100,
};

export const GorscheChassis: Chassis = {
  name: "Gorsche Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 40,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const GorscheBatery: Batery = {
  name: "Gorsche Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const GorscheSuspension: Suspension = {
  name: "Gorsche Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const GorschePitCrew: PitCrew = {
  name: "Gorsche Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Gorsche: leagueScuderia = {
  name: "Gorsche",
  tag: "GOR",
  color: ScuderiaColors.GORSCHE,
  engine: GorscheEngine,
  chassis: GorscheChassis,
  batery: GorscheBatery,
  suspension: GorscheSuspension,
  pitCrew: GorschePitCrew,
};

import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const AlpineEngine: Engine = {
  name: "Alpine Engine",
  initialAccelerationNerf: 120,
  medialAccelerationNerf: 31,
  finalAccelerationNerf: 64,
  topSpeedBoostNerf: -0.6,
  confiability: 100,
};

export const AlpineChassis: Chassis = {
  name: "Alpine Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 40,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const AlpineBatery: Batery = {
  name: "Alpine Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const AlpineSuspension: Suspension = {
  name: "Alpine Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const AlpinePitCrew: PitCrew = {
  name: "Alpine Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Alpine : leagueScuderia = {
  name: "Alpine",
  tag: "ALP",
  color: ScuderiaColors.ALPINE,
  engine: AlpineEngine,
  chassis: AlpineChassis,
  batery: AlpineBatery,
  suspension: AlpineSuspension,
  pitCrew: AlpinePitCrew,
};

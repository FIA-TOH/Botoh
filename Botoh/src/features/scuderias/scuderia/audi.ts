import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const AudiEngine: Engine = {
  name: "Audi Engine",
  initialAccelerationNerf: 120,
  medialAccelerationNerf: 31,
  finalAccelerationNerf: 64,
  topSpeedBoostNerf: 0.2,
  confiability: 100,
};

export const AudiChassis: Chassis = {
  name: "Audi Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 50,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const AudiBatery: Batery = {
  name: "Audi Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const AudiSuspension: Suspension = {
  name: "Audi Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const AudiPitCrew: PitCrew = {
  name: "Audi Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Audi : leagueScuderia = {
  name: "Audi",
  tag: "AU",
  color: ScuderiaColors.AUDI,
  engine: AudiEngine,
  chassis: AudiChassis,
  batery: AudiBatery,
  suspension: AudiSuspension,
  pitCrew: AudiPitCrew,
};

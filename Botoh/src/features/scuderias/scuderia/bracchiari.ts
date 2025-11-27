import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const BracchiariEngine: Engine = {
  name: "Bracchiari Engine",
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const BracchiariChassis: Chassis = {
  name: "Bracchiari Chassis",
  accelerationNerf: 50,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const BracchiariBatery: Batery = {
  name: "Bracchiari Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const BracchiariSuspension: Suspension = {
  name: "Bracchiari Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const BracchiariPitCrew: PitCrew = {
  name: "Bracchiari Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Bracchiari: leagueScuderia = {
  name: "Bracchiari",
  tag: "BR",
  color: ScuderiaColors.BRACCHIARI,
  engine: BracchiariEngine,
  chassis: BracchiariChassis,
  batery: BracchiariBatery,
  suspension: BracchiariSuspension,
  pitCrew: BracchiariPitCrew,
};

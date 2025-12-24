import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const AstonMaiaEngine: Engine = {
  name: "Aston Maia Engine",
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const AstonMaiaChassis: Chassis = {
  name: "Aston Maia Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 0,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const AstonMaiaBatery: Batery = {
  name: "Aston Maia Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const AstonMaiaSuspension: Suspension = {
  name: "Aston Maia Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const AstonMaiaPitCrew: PitCrew = {
  name: "Aston Maia Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const AstonMaia: leagueScuderia = {
  name: "Aston Maia",
  tag: "AM",
  color: ScuderiaColors.ASTONMAIA,
  engine: AstonMaiaEngine,
  chassis: AstonMaiaChassis,
  batery: AstonMaiaBatery,
  suspension: AstonMaiaSuspension,
  pitCrew: AstonMaiaPitCrew,
};

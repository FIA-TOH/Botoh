import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const YamahaEngine: Engine = {
  name: "Yamaha Engine",
  initialAccelerationNerf: 112,
  medialAccelerationNerf: 36,
  finalAccelerationNerf: 72,
  topSpeedBoostNerf: 1.0,
  confiability: 100,
};

export const YamahaChassis: Chassis = {
  name: "Yamaha Chassis",
  accelerationNerf: 0,
  slipstreamNerf: 40,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const YamahaBatery: Batery = {
  name: "Yamaha Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const YamahaSuspension: Suspension = {
  name: "Yamaha Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const YamahaPitCrew: PitCrew = {
  name: "Yamaha Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Yamaha : leagueScuderia = {
  name: "Yamaha",
  tag: "YAM",
  color: ScuderiaColors.YAMAHA,
  engine: YamahaEngine,
  chassis: YamahaChassis,
  batery: YamahaBatery,
  suspension: YamahaSuspension,
  pitCrew: YamahaPitCrew,
};

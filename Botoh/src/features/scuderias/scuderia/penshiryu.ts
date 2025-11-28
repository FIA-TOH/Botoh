import { constants } from "../../speed/constants";
import { Batery } from "../batery";
import { Chassis } from "../chassis";
import { Engine } from "../engine";
import { PitCrew } from "../pitstop";
import { ScuderiaColors } from "../scuderiaColours";
import { leagueScuderia } from "../scuderias";
import { Suspension } from "../tyres";

export const PenshiryuEngine: Engine = {
  name: "Penshiryu Engine",
  initialAccelerationNerf: 0,
  medialAccelerationNerf: 0,
  finalAccelerationNerf: 0,
  topSpeedBoostNerf: 0,
  confiability: 100,
};

export const PenshiryuChassis: Chassis = {
  name: "Penshiryu Chassis",
  accelerationNerf: 100,
  slipstreamNerf: 20,
  dirtyAirBoost: 0,
  confiability: 100,
};

export const PenshiryuBatery: Batery = {
  name: "Penshiryu Batery",
  ERSConsputionReduction: 0,
  ERSSpeedBoost: 0,
  ERSChargeBoost: 0,
  confiability: 100,
};

export const PenshiryuSuspension: Suspension = {
  name: "Penshiryu Suspension",
  tyreDurabilityBoost: 0,
  tyreSpeedDegradatedBoost: 0,
  peakTimeBoost: 0,
  warmUpTimeBoost: 0,
  tyreBlowoutChanceReduction: 0,
  confiability: 100,
};

export const PenshiryuPitCrew: PitCrew = {
  name: "Penshiryu Pit Crew",
  errorChanceReduction: 0,
  fastPitChanceBoost: 0,
  normalPitSpeedTimeBoost: 0,
};

export const Penshiryu: leagueScuderia = {
  name: "Penshiryu",
  tag: "PE",
  color: ScuderiaColors.PENSHIRYU,
  engine: PenshiryuEngine,
  chassis: PenshiryuChassis,
  batery: PenshiryuBatery,
  suspension: PenshiryuSuspension,
  pitCrew: PenshiryuPitCrew,
};

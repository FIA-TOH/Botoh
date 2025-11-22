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
  initialAcceleration: constants.PENSHIRYU_ENGINE_INITIAL_ACCELERATION_BOOST,
  medialAcceleration: constants.PENSHIRYU_ENGINE_MEDIAL_ACCELERATION_BOOST,
  finalAcceleration: constants.PENSHIRYU_ENGINE_FINAL_ACCELERATION_BOOST,
  topSpeedBoost: 0,
  confiability: 100,
};

export const PenshiryuChassis: Chassis = {
  name: "Penshiryu Chassis",
  accelerationBoost: 0,
  slipstreamBoost: 0,
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

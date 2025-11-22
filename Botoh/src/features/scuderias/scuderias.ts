import { Batery } from "./batery";
import { Chassis } from "./chassis";
import { Engine } from "./engine";
import { PitCrew } from "./pitstop";
import { AstonMaia } from "./scuderia/astonMaia";
import { ScuderiaColors } from "./scuderiaColours";
import { Suspension } from "./tyres";

export interface leagueScuderia {
  name: string;
  tag: string;
  color: number;
  engine?: Engine;
  chassis?: Chassis;
  batery?: Batery;
  suspension?: Suspension;
  pitCrew?: PitCrew;
}

export const leagueScuderia: { [key: string]: leagueScuderia } = {
  Penshiryu: {
    name: "Penshiryu",
    tag: "PE",
    color: ScuderiaColors.PENSHIRYU,
  },
  AstonMaia,
  RubyBison: {
    name: "Ruby Bison",
    tag: "RB",
    color: ScuderiaColors.RUBYBISON,
  },
  McLarper: {
    name: "McLarper",
    tag: "MC",
    color: ScuderiaColors.MCLARPER,
  },
  Haax: {
    name: "Haax",
    tag: "HX",
    color: ScuderiaColors.HAAX,
  },
  MotorForce: {
    name: "BMW MotorForce",
    tag: "MF",
    color: ScuderiaColors.MOTORFORCE,
  },
  SART: {
    name: "SART",
    tag: "SA",
    color: ScuderiaColors.SART,
  },
  Konardi: {
    name: "Konardi",
    tag: "KO",
    color: ScuderiaColors.KONARDI,
  },
  LenaultMoreo: {
    name: "Lenaut Moreo",
    tag: "LM",
    color: ScuderiaColors.LENAULTMOREO,
  },
  Questi: {
    name: "Questi",
    tag: "QE",
    color: ScuderiaColors.QUESTI,
  },
  Sixdent: {
    name: "Sixdent",
    tag: "SX",
    color: ScuderiaColors.SIXDENT,
  },
  JeanBorghini: {
    name: "JeanBorghini",
    tag: "JB",
    color: ScuderiaColors.JEANBORGHINI,
  },
  Pejo: {
    name: "Pejo",
    tag: "PJ",
    color: ScuderiaColors.PEJO,
  },
  Brawndesco: {
    name: "Brawndesco",
    tag: "BW",
    color: ScuderiaColors.BRAWNDESCO,
  },
  Interforce: {
    name: "BMW Interforce",
    tag: "IF",
    color: ScuderiaColors.INTERFORCE,
  },
  Alpino: {
    name: "Alpino",
    tag: "AP",
    color: ScuderiaColors.ALPINO,
  },
  Toyossi: {
    name: "BMW Toyossi",
    tag: "TY",
    color: ScuderiaColors.TOYOSSI,
  },
  BMW: {
    name: "Swiss BMW",
    tag: "BM",
    color: ScuderiaColors.BMW,
  },
  Bracchiari: {
    name: "Bracchiari",
    tag: "SB",
    color: ScuderiaColors.BRACCHIARI,
  },
  PHM: {
    name: "PHM FAX",
    tag: "PH",
    color: ScuderiaColors.PHM,
  },
};

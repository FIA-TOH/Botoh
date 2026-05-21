import { Batery } from "./batery";
import { Chassis } from "./chassis";
import { Engine } from "./engine";
import { PitCrew } from "./pitstop";
import { AstonMaia } from "./scuderia/astonMaia";
import { Bracchiari } from "./scuderia/bracchiari";
import { McLarper } from "./scuderia/mclarper";
import { Penshiryu } from "./scuderia/penshiryu";
import { ScuderiaColors } from "./scuderiaColours";
import { Suspension } from "./tyres";

export type LeagueScuderiaId = string;

export interface Scuderia {
  name: string;
  tag: string;
  emoji?: string;
  color: number;
  pitLevel?: number;
  weatherLevel?: number;
  fromBD?: boolean;
  engine?: Engine;
  chassis?: Chassis;
  batery?: Batery;
  suspension?: Suspension;
  pitCrew?: PitCrew;
}

export type ScuderiaRegistry = Record<LeagueScuderiaId, Scuderia>;

const hardcodedLeagueScuderias = {
  Penshiryu,
  AstonMaia,
  McLarper,
  Bracchiari,
  RubyBison: {
    name: "Ruby Bison",
    tag: "RB",
    color: ScuderiaColors.RUBYBISON,
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

  PHM: {
    name: "PHM FAX",
    tag: "PH",
    color: ScuderiaColors.PHM,
  },
} satisfies ScuderiaRegistry;

export const leagueScuderia: ScuderiaRegistry = {
  ...hardcodedLeagueScuderias,
};

export function hasLeagueScuderia(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(leagueScuderia, id);
}

export function getLeagueScuderia(
  id: LeagueScuderiaId | null | undefined,
): Scuderia | null {
  if (!id || !hasLeagueScuderia(id)) return null;
  return leagueScuderia[id];
}

export function registerLeagueScuderia(
  id: LeagueScuderiaId,
  scuderia: Scuderia,
) {
  leagueScuderia[id] = {
    ...scuderia,
    fromBD: scuderia.fromBD ?? true,
  };
}

export function registerLeagueScuderias(scuderias: ScuderiaRegistry) {
  Object.assign(leagueScuderia, scuderias);
}

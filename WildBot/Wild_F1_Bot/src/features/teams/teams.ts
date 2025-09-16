export interface LeagueTeam {
  name: string;
  tag: string;
  color: number;
}
export enum TeamColors {
  PENSHIRYU = 0xb45568,
  ASTONMAIA = 0x059988,
  RUBYBISON = 0x4458a2,
  MCLARPER = 0xff8700,
  HAAX = 0xe6002b,
  MOTORFORCE = 0x06529d,
  SART = 0x40c3ff,
  KONARDI = 0x1d618c,
  LENAULTMOREO = 0xba3232,
  QUESTI = 0x4b56cc,
  SIXDENT = 0x9c7efc,
  JEANBORGHINI = 0xffd500,
  PEJO = 0xbdbdbd,
  BRAWNDESCO = 0xddff09,
  INTERFORCE = 0x83abc9,
  ALPINO = 0xddbc5f,
  TOYOSSI = 0x858585,
  BMW = 0x0066b1,
  BRACCHIARI = 0xec1c24,
  PHM = 0x5ef102,
}

export const LeagueTeam: { [key: string]: LeagueTeam } = {
  Penshiryu: {
    name: "Penshiryu",
    tag: "PE",
    color: TeamColors.PENSHIRYU,
  },
  AstonMaia: {
    name: "Aston Maia",
    tag: "AM",
    color: TeamColors.ASTONMAIA,
  },
  RubyBison: {
    name: "Ruby Bison",
    tag: "RB",
    color: TeamColors.RUBYBISON,
  },
  McLarper: {
    name: "McLarper",
    tag: "MC",
    color: TeamColors.MCLARPER,
  },
  Haax: {
    name: "Haax",
    tag: "HX",
    color: TeamColors.HAAX,
  },
  MotorForce: {
    name: "BMW MotorForce",
    tag: "MF",
    color: TeamColors.MOTORFORCE,
  },
  SART: {
    name: "SART",
    tag: "SA",
    color: TeamColors.SART,
  },
  Konardi: {
    name: "Konardi",
    tag: "KO",
    color: TeamColors.KONARDI,
  },
  LenaultMoreo: {
    name: "Lenaut Moreo",
    tag: "LM",
    color: TeamColors.LENAULTMOREO,
  },
  Questi: {
    name: "Questi",
    tag: "QE",
    color: TeamColors.QUESTI,
  },
  Sixdent: {
    name: "Sixdent",
    tag: "SX",
    color: TeamColors.SIXDENT,
  },
  JeanBorghini: {
    name: "JeanBorghini",
    tag: "JB",
    color: TeamColors.JEANBORGHINI,
  },
  Pejo: {
    name: "Pejo",
    tag: "PJ",
    color: TeamColors.PEJO,
  },
  Brawndesco: {
    name: "Brawndesco",
    tag: "BW",
    color: TeamColors.BRAWNDESCO,
  },
  Interforce: {
    name: "BMW Interforce",
    tag: "IF",
    color: TeamColors.INTERFORCE,
  },
  Alpino: {
    name: "Alpino",
    tag: "AP",
    color: TeamColors.ALPINO,
  },
  Toyossi: {
    name: "BMW Toyossi",
    tag: "TY",
    color: TeamColors.TOYOSSI,
  },
  BMW: {
    name: "Swiss BMW",
    tag: "BM",
    color: TeamColors.BMW,
  },
  Bracchiari: {
    name: "Bracchiari",
    tag: "SB",
    color: TeamColors.BRACCHIARI,
  },
  PHM: {
    name: "PHM FAX",
    tag: "PH",
    color: TeamColors.PHM,
  },
};

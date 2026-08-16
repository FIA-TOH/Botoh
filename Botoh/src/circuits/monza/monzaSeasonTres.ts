import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const monzaSeasonTres_raw = readFileSync(join(__dirname, "monzaSeasonTres.hbs"), "utf-8");

const MONZASEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1294,
      maxX: 1326,
      minY: 1998,
      maxY: 2413,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
     bounds: {
      minX: 1294,
      maxX: 1326,
      minY: 1998,
      maxY: 2413,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -3245,
      maxX: -2909,
      minY: 550,
      maxY: 582,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -501,
      maxX: -469,
      minY: 554,
      maxY: 1151,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Autodromo Nazionale di Monza - By Ximb - NewgenV3",
  boxLine: {
    minX: 1361,
    maxX: 2494,
    minY: 1998,
    maxY: 2073,
  },
  pitlaneStart: {
    minX: 3253,
    maxX: 3285,
    minY: 1994,
    maxY: 2152,
  },
  pitlaneEnd: {
    minX: 1237,
    maxX: 1269,
    minY: 1996,
    maxY: 2158,
  },
  drsStart: [
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  ],
  drsEnd: [
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  ],
  checkpoints: [],
  lastPlace: {
    x: 2560,
    y: 2044,
  },
  BestTime: bestTimes.monzaSeasonTres,
  MainColor: [0x009246, 0xffffff, 0xce2b37],
  AvatarColor: 0x000001,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: -20,
  physicsType: CircuitPhysics.WEC_NEWGEN,
  pitGap: 16,
  new_safetycar: true,
  CutDetectSegments: [
    { v0: [-581, 2138], v1: [-459, 2123], index: 206, penalty: 5 },
    { v0: [-718, 1950], v1: [-960, 2224], index: 208, penalty: 5 },
    { v0: [-1224, 2052], v1: [-1461, 2119], index: 210, penalty: 5 },
    { v0: [-2852, 2250], v1: [-2862, 2258], index: 212, penalty: 5 },
    { v0: [-3298, 54], v1: [-3338, 257], index: 214, penalty: 5 },
    { v0: [-3639, -30], v1: [-3520, -281], index: 216, penalty: 5 },
    { v0: [-3697, -1719], v1: [-3801, -2291], index: 218, penalty: 5 },
    { v0: [-164, 1011], v1: [-219, 755], index: 220, penalty: 5 },
    { v0: [761, 1212], v1: [816, 1184], index: 222, penalty: 5 },
  ],
CrashWallDetector: [
  {
    index: "185-61",
    v0: [-690, 2413],
    v1: [3565.5152621567995, 2413],
    curvatura: 0,
  },
  {
    index: "207-206",
    v0: [3565, 2412],
    v1: [-692, 2410],
    curvatura: 0,
  },
  {
    index: "208-209",
    v0: [-2713, 1651],
    v1: [-3131, -318],
    curvatura: 0,
  },
  {
    index: "210-211",
    v0: [-3764, 333],
    v1: [-4415, -1157],
    curvatura: 0,
  },
  {
    index: "212-214",
    v0: [-3050, -1497],
    v1: [-2825, -844],
    curvatura: 0,
  },
  {
    index: "214-216",
    v0: [-2825, -844],
    v1: [-2330, -187],
    curvatura: -36.290687226280106,
  },
  {
    index: "215-213",
    v0: [-2572, -803],
    v1: [-2839, -1747],
    curvatura: 0,
  },
  {
    index: "217-216",
    v0: [-323, 1195],
    v1: [-2330, -187],
    curvatura: 0,
  },
  {
    index: "219-220",
    v0: [696, 1436],
    v1: [3891, 1431],
    curvatura: 0,
  },
  {
    index: "218-221",
    v0: [906, 1220],
    v1: [4285, 1213],
    curvatura: 0,
  },
  {
    index: "220-222",
    v0: [3891, 1431],
    v1: [4152, 1532],
    curvatura: 0,
  },
  {
    index: "222-223",
    v0: [4152, 1532],
    v1: [4172, 1698],
    curvatura: 79.8926288097309,
  },
  {
    index: "165-169",
    v0: [3892, 1431],
    v1: [4152, 1533],
    curvatura: 44.43541167212415,
  },
],
DirectionChangerDetector: [
  {
    v0: [-404, 2133],
    v1: [-406, 2415],
    index: "000001",
    direction: SpecificDirection.LEFT,
    force: 0.6,
    sector: 1,
  },
  {
    v0: [-773, 2037],
    v1: [-437, 2125],
    index: "000002",
    direction: SpecificDirection.UP,
    force: 0.3,
    sector: 1,
  },
  {
    v0: [-3267, 270],
    v1: [-3003, 203],
    index: "000003",
    direction: SpecificDirection.UP,
    force: 0.6,
    sector: 2,
  },
  {
    v0: [-3339, 281],
    v1: [-3646, -283],
    index: "000004",
    direction: SpecificDirection.LEFT,
    force: 0.4,
    sector: 2,
  },
  {
    v0: [-4094, -999],
    v1: [-4337, -905],
    index: "000005",
    direction: SpecificDirection.UP,
    force: 0.3,
    sector: 2,
  },
  {
    v0: [-3351, -1562],
    v1: [-3584, -2310],
    index: "000006",
    direction: SpecificDirection.RIGHT,
    force: 0.4,
    sector: 2,
  },
  {
    v0: [-470, 1109],
    v1: [-195, 727],
    index: "000007",
    direction: SpecificDirection.RIGHTDOWN,
    force: 0.4,
    sector: 3,
  },
  {
    v0: [3745, 1197],
    v1: [3754, 1457],
    index: "000008",
    direction: SpecificDirection.RIGHT,
    force: 0.5,
    sector: 3,
  },
],


};

export const MONZASEASONTRES: Circuit = {
  map: monzaSeasonTres_raw,
  info: MONZASEASONTRES_INFO,
};

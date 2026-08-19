import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const spaSeasonTres_raw = readFileSync(join(__dirname, "spaSeasonTres.hbs"), "utf-8");
const spaSeasonTres_json = JSON.parse(spaSeasonTres_raw);

const SPASEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -2963,
      maxX: -2932,
      minY: -1120,
      maxY: -747,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Spa-Francorchamps - By Ximb - NewGenV3",
  sectorOne: {
    bounds: {
      minX: -2963,
      maxX: -2932,
      minY: -1120,
      maxY: -747,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: 2817,
      maxX: 2849,
      minY: -2121,
      maxY: -1805,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1843,
      maxX: 1875,
      minY: 1954,
      maxY: 2599,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: -2960,
    maxX: -1541,
    minY: -1120,
    maxY: -1018,
  },
  pitlaneStart: {
    minX: -1135,
    maxX: -1103,
    minY: -1153,
    maxY: -956,
  },
  pitlaneEnd: {
    minX: -3195,
    maxX: -3165,
    minY: -1215,
    maxY: -960,
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
    x: -1458,
    y: -1077,
  },
  BestTime: bestTimes.spaSeasonTres,
  MainColor: [0x000001, 0xfae042, 0xed2939],
  AvatarColor: 0xffffff,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  pitGap: 15,
  new_safetycar: true,
  physicsType: CircuitPhysics.WEC_NEWGEN,

  TireDegradationPercentage: -5,
  CutDetectSegments: [
  { v0: [-1349, -1948], v1: [-1263, -1921], index: 257, penalty: 5 },
  { v0: [-910, -2058], v1: [-915, -1746], index: 259, penalty: 5 },
  { v0: [-490, -2041], v1: [-313, -1963], index: 261, penalty: 5 },
  { v0: [3234, -1598], v1: [3600, -1852], index: 263, penalty: 5 },
  { v0: [3150, -1855], v1: [3100, -1833], index: 265, penalty: 5 },
  { v0: [3603, -1374], v1: [3640, -1328], index: 267, penalty: 5 },
  { v0: [3987, -818], v1: [4030, -820], index: 269, penalty: 5 },
  { v0: [3859, -79], v1: [3652, -35], index: 271, penalty: 5 },
  { v0: [3652, -35], v1: [3613, -197], index: 272, penalty: 5 },
  { v0: [3407, -574], v1: [3338, -657], index: 274, penalty: 5 },
  { v0: [1674, -1137], v1: [1577, -1048], index: 276, penalty: 5 },
  { v0: [1577, -1048], v1: [1622, -976], index: 277, penalty: 5 },
  { v0: [1451, -748], v1: [1468, -622], index: 279, penalty: 5 },
  { v0: [1468, -622], v1: [1550, -631], index: 280, penalty: 5 },
  { v0: [2441, 577], v1: [2491, 429], index: 282, penalty: 5 },
  { v0: [2183, 827], v1: [2072, 977], index: 284, penalty: 5 },
  { v0: [2072, 977], v1: [2131, 1076], index: 285, penalty: 5 },
  { v0: [2133, 1878], v1: [2030, 1837], index: 287, penalty: 5 },
  { v0: [1705, 2037], v1: [1556, 1961], index: 289, penalty: 5 },
  { v0: [1295, 5], v1: [1338, 46], index: 291, penalty: 5 },
  { v0: [1312, 23], v1: [1276, 77], index: 293, penalty: 5 },
  { v0: [711, -222], v1: [715, -368], index: 295, penalty: 5 },
  { v0: [-199, -254], v1: [-37, -609], index: 297, penalty: 5 },
  { v0: [-1144, -468], v1: [-37, -609], index: 299, penalty: 5 },
  { v0: [-1146, -761], v1: [-1199, -755], index: 300, penalty: 5 },
],
 CrashWallDetector: [
  {
    index: "88-89",
    v0: [-984, -956],
    v1: [-3735, -958],
    curvatura: 0,
  },
  {
    index: "99-102",
    v0: [607, -2323],
    v1: [3232, -2029],
    curvatura: 0,
  },
  {
    index: "112-113",
    v0: [1171, -524],
    v1: [2402, 341],
    curvatura: 0,
  },
  {
    index: "116-117",
    v0: [1684, -463],
    v1: [2850, 371],
    curvatura: 0,
  },
  {
    index: "119-121",
    v0: [1864, 1151],
    v1: [2031, 1578],
    curvatura: 0,
  },
  {
    index: "124-186",
    v0: [1513, -108],
    v1: [1583, 745],
    curvatura: 12.463008814134293,
  },
  {
    index: "208-111",
    v0: [3225, -895],
    v1: [1596, -1329],
    curvatura: 0,
  },
],
DirectionChangerDetector: [
  {
    v0: [-3602, -959],
    v1: [-3602, -761],
    index: "000001",
    direction: SpecificDirection.LEFT,
    force: 0.7,
    sector: 2,
  },
  {
    v0: [-916, -1891],
    v1: [-1386, -1937],
    index: "000002",
    direction: SpecificDirection.UP,
    force: 0.2,
    sector: 2,
  },
  {
    v0: [2935, -1905],
    v1: [2952, -2073],
    index: "000003",
    direction: SpecificDirection.RIGHT,
    force: 0.5,
    sector: 2,
  },
  {
    v0: [3265, -1668],
    v1: [3053, -1728],
    index: "000004",
    direction: SpecificDirection.DOWN,
    force: 0.3,
    sector: 2,
  },
  {
    v0: [3461, -1544],
    v1: [3506, -1341],
    index: "000005",
    direction: SpecificDirection.RIGHT,
    force: 0.3,
    sector: 2,
  },
  {
    v0: [3731, -153],
    v1: [4181, -233],
    index: "000006",
    direction: SpecificDirection.DOWN,
    force: 0.4,
    sector: 2,
  },
  {
    v0: [3308, -524],
    v1: [3641, -482],
    index: "000007",
    direction: SpecificDirection.UP,
    force: 0.4,
    sector: 2,
  },
  {
    v0: [1867, -1277],
    v1: [1761, -1020],
    index: "000008",
    direction: SpecificDirection.LEFT,
    force: 0.5,
    sector: 2,
  },
  {
    v0: [2360, 363],
    v1: [2517, 123],
    index: "000009",
    direction: SpecificDirection.RIGHT,
    force: 0.4,
    sector: 2,
  },
  {
    v0: [2363, 1651],
    v1: [2030, 1769],
    index: "000010",
    direction: SpecificDirection.DOWN,
    force: 0.4,
    sector: 2,
  },
  {
    v0: [1620, 136],
    v1: [1290, 166],
    index: "000011",
    direction: SpecificDirection.UP,
    force: 0.4,
    sector: 3,
  },
  {
    v0: [-973, -503],
    v1: [-1094, -201],
    index: "000012",
    direction: SpecificDirection.LEFT,
    force: 0.6,
    sector: 3,
  },
],

};

export const SPASEASONTRES: Circuit = {
  map: spaSeasonTres_raw,
  info: SPASEASONTRES_INFO,
};

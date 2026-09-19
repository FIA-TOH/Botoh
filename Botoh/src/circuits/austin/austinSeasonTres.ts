import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const austinSeasonTres_raw = readFileSync(join(__dirname, "austinSeasonTres.hbs"), "utf-8");
const austinSeasonTres_json = JSON.parse(austinSeasonTres_raw);

const AUSTINSEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 2098,
      maxX: 2473,
      minY: 1409,
      maxY: 1441,
    },
    passingDirection: Direction.UP,
  },
  sectorOne: {
    bounds: {
    minX: 2098,
      maxX: 2473,
      minY: 1409,
      maxY: 1441,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: -1359,
      maxX: -463,
      minY: -982,
      maxY: -950,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -1060,
      maxX: -383,
      minY: 953,
      maxY: 985,
    },
    passingDirection: Direction.UP,
  },
  name: "United States Grand Prix - By Ximb - NewGenV3",
  boxLine: {
    minX: 1780,
    maxX: 2175,
    minY: 1444,
    maxY: 2417,
  },
  pitlaneStart: {
    minX: 1680,
    maxX: 1839,
    minY: 2717,
    maxY: 2749,
  },
  pitlaneEnd: {
    minX: 2186,
    maxX: 2355,
    minY: 1150,
    maxY: 1182,
  },
  drsStart: [
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
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
    {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  ],
  checkpoints: [],
  lastPlace: {
    x: 1832,
    y: 3363,
  },
  BestTime: bestTimes.austinSeasonTres,
  MainColor: [0xb31942, 0xffffff, 0xb31942],
  AvatarColor: 0x0a3161,
  Angle: 90,
  Limit: 4,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: 15,
  pitGap: 14,
  new_safetycar: true,
  physicsType: CircuitPhysics.WEC_NEWGEN,
CrashWallDetector: [
  {
    index: "87-88",
    v0: [1847, 3372.3916347038125],
    v1: [2999.7579589411043, -164.90811996409434],
    curvatura: 0,
  },
  {
    index: "148-136",
    v0: [-2772, -2537],
    v1: [-1070, 1651],
    curvatura: 10,
  },
  {
    index: "178-179",
    v0: [2582, 68],
    v1: [2040, 821],
    curvatura: 0,
  },
  {
    index: "184-185",
    v0: [-2709, -2882],
    v1: [-1013, 1132],
    curvatura: 10,
  },
],
CutDetectSegments: [
  { v0: [1913, 556], v1: [1929, -329], index: 234, penalty: 5 },
  { v0: [1193, -20], v1: [1056, 564], index: 236, penalty: 5 },
  { v0: [755, -111], v1: [821, -315], index: 238, penalty: 5 },
  { v0: [316, -506], v1: [-35, 4], index: 240, penalty: 5 },
  { v0: [-730, -1161], v1: [-1246, -903], index: 242, penalty: 5 },
  { v0: [-1271, -1525], v1: [-764, -1840], index: 244, penalty: 5 },
  { v0: [-1335, -1931], v1: [-1565, -1939], index: 246, penalty: 5 },
  { v0: [-1648, -2554], v1: [-1680, -2522], index: 248, penalty: 5 },
  { v0: [-939, 1288], v1: [-1006, 1125], index: 250, penalty: 5 },
  { v0: [-184, 302], v1: [-140, 403], index: 252, penalty: 5 },
  { v0: [96, 475], v1: [-152, 333], index: 254, penalty: 5 },
  { v0: [260, 741], v1: [34, 695], index: 256, penalty: 5 },
  { v0: [510, 1156], v1: [745, 1072], index: 258, penalty: 5 },
  { v0: [615, 1089], v1: [641, 1140], index: 260, penalty: 5 },
  { v0: [1010, 1129], v1: [885, 1222], index: 262, penalty: 5 },
  { v0: [1082, 1394], v1: [966, 1384], index: 264, penalty: 5 },
  { v0: [925, 2078], v1: [1081, 2080], index: 266, penalty: 5 },
  { v0: [1719, 2977], v1: [1707, 2917], index: 268, penalty: 5 },
  { v0: [-23, 1139], v1: [1068, 588], index: 270, penalty: 15 },
  { v0: [-227, 1332], v1: [-23, 1139], index: 272, penalty: 5 },
  { v0: [-23, 1139], v1: [-119, 1030], index: 270, penalty: 5 },
  { v0: [-23, 1139], v1: [-127, 1590], index: 270, penalty: 5 },
],
};

export const AUSTINSEASONTRES: Circuit = {
  map: austinSeasonTres_raw,
  info: AUSTINSEASONTRES_INFO,
};

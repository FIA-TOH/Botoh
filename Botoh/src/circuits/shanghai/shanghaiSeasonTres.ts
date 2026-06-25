import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const shanghaiSeasonTres_raw = readFileSync(join(__dirname, "shanghaiSeasonTres.hbs"), "utf-8");

const SHANGHAISEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -994,
      maxX: -639,
      minY: -526,
      maxY: -494,
    },
    passingDirection: Direction.UP,
  },
  sectorOne: {
     bounds: {
      minX: -994,
      maxX: -639,
      minY: -526,
      maxY: -494,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: 1138,
      maxX: 1170,
      minY: -1801,
      maxY: -1552,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1415,
      maxX: 1447,
      minY: 175,
      maxY: 438,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Shanghai International Circuit - By Ximb - NewgenV3",
  boxLine: {
    minX: -714,
    maxX: -639,
    minY: -526,
    maxY: 474,
  },
  pitlaneStart: {
    minX: -745,
    maxX: -713,
    minY: 897,
    maxY: 1041,
  },
  pitlaneEnd: {
    minX: -793,
    maxX: -638,
    minY: -804,
    maxY: -772,
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
    x: -699,
    y: 509,
  },
  BestTime: bestTimes.shanghaiSeasonTres,
  MainColor: [0xd6001d],
  AvatarColor: 0xfae100,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: 15,
  physicsType: CircuitPhysics.WEC_NEWGEN,
  pitGap: 21,
  new_safetycar: true,
  CutDetectSegments: [
  { v0: [713, 459], v1: [707, 484], index: 254, penalty: 5 },
  { v0: [796, -1540], v1: [806, -1518], index: 252, penalty: 5 },
  { v0: [1507, 129], v1: [1628, 94], index: 256, penalty: 5 },
  { v0: [-1629, 1389], v1: [-1608, 1415], index: 258, penalty: 5 },
  { v0: [-1018, 896], v1: [-1073, 840], index: 260, penalty: 5 },
  { v0: [-455, -1083], v1: [-480, -1050], index: 262, penalty: 5 },
  { v0: [172, -1373], v1: [197, -1344], index: 264, penalty: 5 },
  { v0: [853, 68], v1: [847, 41], index: 266, penalty: 5 },
  { v0: [249, -914], v1: [282, -908], index: 268, penalty: 5 },
  { v0: [1302, -30], v1: [1257, -39], index: 270, penalty: 5 },
  { v0: [1523, -646], v1: [1536, -634], index: 272, penalty: 5 },
  { v0: [1973, -1537], v1: [1951, -1535], index: 274, penalty: 5 },
  { v0: [2437, 128], v1: [2451, 132], index: 276, penalty: 5 },
  { v0: [-2259, 1399], v1: [-2243, 1412], index: 278, penalty: 5 },
],
CrashWallDetector: [
  { index: "139-140", v0: [1726, -1246], v1: [822, -1055.5], curvatura: -10 },
  { index: "150-151", v0: [2214, 383], v1: [-2335, 2176], curvatura: 0 },
  { index: "159-160", v0: [-800, -1115], v1: [-800, -1448], curvatura: 0 },
  { index: "161-162", v0: [1129, -1559.5], v1: [1434, -1556], curvatura: 0 },
  { index: "167-168", v0: [-217, 1143], v1: [1711.5, 301.5], curvatura: 0 },
  { index: "171-172", v0: [-792, 843], v1: [-792, -817], curvatura: 0 },
  { index: "212-227", v0: [899, -324.5], v1: [451, -515], curvatura: 0 },
  { index: "145-228", v0: [574.5, 191.5], v1: [969, 291], curvatura: -34.85566299201482 },
  { index: "214-168", v0: [1738.5, -61.5], v1: [1711.5, 301.5], curvatura: 135.3530874979709 },
  { index: "167-221", v0: [-217, 1143], v1: [-2010.5, 1861], curvatura: 0 },
  { index: "235-226", v0: [-639, -435.0909091], v1: [535, -1375], curvatura: 0,
},
],
DirectionChangerDetector: [
  { v0: [-999, -1475], v1: [-797, -1475], index: "000001", direction: SpecificDirection.UP, force: 0.4, sector: 1 },
  { v0: [-424, -1834], v1: [-424, -2148], index: "000002", direction: SpecificDirection.RIGHT, force: 0.4, sector: 1 },
  { v0: [-122, -1439], v1: [261, -1443], index: "000003", direction: SpecificDirection.DOWN, force: 0.4, sector: 1 },
  { v0: [-556, -1295], v1: [-392, -1295], index: "000004", direction: SpecificDirection.UP, force: 0.3, sector: 1 },
  { v0: [468, -1604], v1: [655, -1446], index: "000005", direction: SpecificDirection.UP, force: 0.5, sector: 1 },
  { v0: [1368, -1556], v1: [1365, -1804], index: "000006", direction: SpecificDirection.RIGHT, force: 0.8, sector: 2 },
  { v0: [621, 221], v1: [717, -13], index: "000007", direction: SpecificDirection.LEFT, force: 0.6, sector: 2 },
  { v0: [653, 417], v1: [422, 510], index: "000008", direction: SpecificDirection.DOWN, force: 0.5, sector: 2 },
  { v0: [1558, 121], v1: [1666, 319], index: "000009", direction: SpecificDirection.RIGHT, force: 0.2, sector: 3 },
  { v0: [-1888, 1808], v1: [-1812, 1971], index: "000010", direction: SpecificDirection.LEFT, force: 0.8, sector: 3 },
  { v0: [-1158, 901], v1: [-1053, 1132], index: "000011", direction: SpecificDirection.RIGHT, force: 0.3, sector: 3 },
],

};

export const SHANGHAISEASONTRES: Circuit = {
  map: shanghaiSeasonTres_raw,
  info: SHANGHAISEASONTRES_INFO,
};

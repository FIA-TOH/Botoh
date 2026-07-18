import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const kyalamiPublic_raw = readFileSync(join(__dirname, "kyalamiPublic.hbs"), "utf-8");

const KYALAMIPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 226,
      maxX: 258,
      minY: 1230,
      maxY: 1587,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
     bounds: {
      minX: 226,
      maxX: 258,
      minY: 1230,
      maxY: 1587,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 608,
      maxX: 640,
      minY: 63,
      maxY: 323,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -2973,
      maxX: -2941,
      minY: -1183,
      maxY: -596,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Kyalami Grand Prix Circuit By Ximb and Nanoseb - Public",
  boxLine: {
    minX: -788,
    maxX: 222,
    minY: 1230,
    maxY: 1310,
  },
  pitlaneStart: {
    minX: -1142,
    maxX: -1110,
    minY: 1294,
    maxY: 1393,
  },
  pitlaneEnd: {
    minX: 376,
    maxX: 408,
    minY: 1218,
    maxY: 1391,
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
    x: -1986,
    y: 1559,
  },
  BestTime: bestTimes.kyalamiPublic,
  MainColor: [0xE03C31, 0x007749, 0x001489],
  AvatarColor: 0xffffff,
  Angle: 120,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.96,
  TireDegradationPercentage: 10,
  physicsType: CircuitPhysics.WEC_NEWGEN,
  pitGap: 16,
  new_safetycar: true,
  CutDetectSegments: [
    { v0: [2532, 1582], v1: [2925, 1697], index: 243, penalty: 5 },
    { v0: [2577, 370], v1: [2492, 362], index: 245, penalty: 5 },
    { v0: [1359, -221], v1: [1982, -345], index: 247, penalty: 5 },
    { v0: [-669, -1537], v1: [55, -1622], index: 249, penalty: 5 },
    { v0: [-1105, -945], v1: [-924, -1178], index: 251, penalty: 5 },
    { v0: [-1105, -945], v1: [-1035, -621], index: 251, penalty: 5 },
    { v0: [-1346, -784], v1: [-1425, -690], index: 254, penalty: 5 },
    { v0: [-1425, -690], v1: [-1850, -746], index: 255, penalty: 5 },
    { v0: [-1850, -746], v1: [-1837, -876], index: 256, penalty: 5 },
    { v0: [-2442, -1132], v1: [-2409, -1148], index: 258, penalty: 5 },
    { v0: [-2742, -1466], v1: [-2829, -1383], index: 260, penalty: 5 },
    { v0: [-3145, -1671], v1: [-3086, -1501], index: 262, penalty: 5 },
    { v0: [-3246, -1052], v1: [-2080, 79], index: 264, penalty: 5 },
    { v0: [-3399, -1461], v1: [-3510, -1461], index: 266, penalty: 5 },
    { v0: [-591, -570], v1: [-654, -525], index: 268, penalty: 5 },
    { v0: [-419, -311], v1: [-571, 276], index: 270, penalty: 5 },
    { v0: [-769, 513], v1: [-870, 471], index: 272, penalty: 5 },
    { v0: [2249, 890], v1: [2275, 889], index: 243, penalty: 5 },
    { v0: [2827, 363], v1: [2823, 382], index: 245, penalty: 5 },
    { v0: [2417, -593], v1: [2435, -589], index: 247, penalty: 5 },
    { v0: [-367, 226], v1: [-355, 244], index: 249, penalty: 5 },
    { v0: [591, -1695], v1: [602, -1683], index: 251, penalty: 5 },
    { v0: [-3011, -2101], v1: [-2996, -2101], index: 253, penalty: 5 },
    { v0: [-1919, 220], v1: [-1904, 222], index: 255, penalty: 5 },
    { v0: [-2039, 1565], v1: [-2038, 1578], index: 257, penalty: 5 },
  ],
  CrashWallDetector: [
    { index: "53-52", v0: [991, 1587], v1: [-1215.266294685696, 1587], curvatura: 0 },
    { index: "147-148", v0: [1145.1060953088004, 1603.8558896128], v1: [3510.3820433848864, 2158.278798016905], curvatura: 0 },
    { index: "199-200", v0: [1985, 1595], v1: [2338, 1675], curvatura: 0 },
    { index: "136-203", v0: [-349.5065761443625, -152.28625828174745], v1: [397, -1274], curvatura: 0 },
    { index: "237-238", v0: [5, -240], v1: [640, -1396], curvatura: 0 },
    { index: "001-002", v0: [80.09036728156161, 443.0308001826403], v1: [2310.175996858369, -200.8195883499526], curvatura: 0 },
  ],
DirectionChangerDetector: [
 
],

};

export const KYALAMIPUBLIC: Circuit = {
  map: kyalamiPublic_raw,
  info: KYALAMIPUBLIC_INFO,
};

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";
const imola_raw = readFileSync(join(__dirname, "imola.hbs"), "utf-8");
const imola_json = JSON.parse(imola_raw);

const IMOLA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -168,
      maxX: -138,
      minY: 1010,
      maxY: 1345,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: -168,
      maxX: -138,
      minY: 1010,
      maxY: 1345,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 2982,
      maxX: 3014,
      minY: -1638,
      maxY: -1308,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: -184,
      maxX: -154,
      minY: 158,
      maxY: 396,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Autodromo Imola - By Ximb",
  boxLine: {
    minX: -1068,
    maxX: -168,
    minY: 1263,
    maxY: 1345,
  },
  pitlaneStart: {
    minX: -1266,
    maxX: -1236,
    minY: 1194,
    maxY: 1345,
  },
  pitlaneEnd: {
    minX: 474,
    maxX: 506,
    minY: 1328,
    maxY: 1452,
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
    x: imola_json.redSpawnPoints[imola_json.redSpawnPoints.length - 1][0],
    y: imola_json.redSpawnPoints[imola_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.imola,
  MainColor: [0x009246, 0xfffff1, 0xce2b37],
  AvatarColor: 0x000001,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 5,
  CutDetectSegments: [
    {
      v0: [1862, 909],
      v1: [1571, 801],
      index: 236,
      penalty: 5,
    },
    {
      v0: [1889, 626],
      v1: [2583, 712],
      index: 237,
      penalty: 5,
    },
    {
      v0: [2307, 217],
      v1: [2154, 51],
      index: 238,
      penalty: 5,
    },
    {
      v0: [2617, -166],
      v1: [2649, -343],
      index: 239,
      penalty: 5,
    },
    {
      v0: [2508, -857],
      v1: [2274, -820],
      index: 240,
      penalty: 5,
    },
    {
      v0: [2404, -1144],
      v1: [2781, -1098],
      index: 241,
      penalty: 5,
    },
    {
      v0: [2252, -668],
      v1: [2215, -787],
      index: 242,
      penalty: 5,
    },
    {
      v0: [1323, -1532],
      v1: [1355, -1488],
      index: 243,
      penalty: 5,
    },
    {
      v0: [1267, -478],
      v1: [1329, -278],
      index: 244,
      penalty: 5,
    },
    {
      v0: [1292, 298],
      v1: [1318, 137],
      index: 245,
      penalty: 5,
    },
    {
      v0: [1118, 205],
      v1: [842, 478],
      index: 246,
      penalty: 5,
    },
    {
      v0: [-715, 234],
      v1: [-654, 194],
      index: 247,
      penalty: 5,
    },
    {
      v0: [-814, 110],
      v1: [-1350, 502],
      index: 248,
      penalty: 5,
    },
    {
      v0: [-1792, 488],
      v1: [-1676, 573],
      index: 249,
      penalty: 5,
    },
    {
      v0: [-2226, 927],
      v1: [-2299, 855],
      index: 250,
      penalty: 5,
    },
    {
      v0: [-2727, 1194],
      v1: [-2306, 1354],
      index: 251,
      penalty: 5,
    },
    {
      v0: [-2540, 1591],
      v1: [-2497, 1485],
      index: 252,
      penalty: 5,
    },
    {
      v0: [-1363, 1295],
      v1: [-1329, 1359],
      index: 253,
      penalty: 5,
    },
    {
      v0: [2218, -1788],
      v1: [2254, -1662],
      index: 254,
      penalty: 5,
    },
  ],
  DirectionChangerDetector: [

  // 000000
  {
    v0: [1682, 879],
    v1: [1925, 1237],
    index: "000000",
    direction: SpecificDirection.RIGHT,
    force: 0.9,
    sector: 1
  },

  // 000001
  {
    v0: [1962, 688],
    v1: [1597, 847],
    index: "000001",
    direction: SpecificDirection.UP,
    force: 0.4,
    sector: 1
  },

  // 000002
  {
    v0: [2265, 18],
    v1: [2335, 537],
    index: "000002",
    direction: SpecificDirection.RIGHT,
    force: 0.3,
    sector: 1
  },

  // 000003
  {
    v0: [2439, -785],
    v1: [2715, -747],
    index: "000003",
    direction: SpecificDirection.RIGHTUP,
    force: 0.4,
    sector: 1
  },

  // 000004
  {
    v0: [2487, -1119],
    v1: [2299, -868],
    index: "000004",
    direction: SpecificDirection.LEFTUP,
    force: 0.3,
    sector: 1
  },

  // 000005
  {
    v0: [2977, -1607],
    v1: [3043, -1402],
    index: "000005",
    direction: SpecificDirection.RIGHTUP,
    force: 0.8,
    sector: 2
  },

  // 000006
  {
    v0: [1462, -1542],
    v1: [1463, -1738],
    index: "000006",
    direction: SpecificDirection.LEFT,
    force: 0.6,
    sector: 2
  },

  // 000007
  {
    v0: [1325, 212],
    v1: [1677, 203],
    index: "000007",
    direction: SpecificDirection.DOWN,
    force: 0.8,
    sector: 2
  },

  // 000008
  {
    v0: [1333, 274],
    v1: [1311, 579],
    index: "000008",
    direction: SpecificDirection.LEFT,
    force: 0.4,
    sector: 2
  },

  // 000009
  {
    v0: [1152, 226],
    v1: [1246, 85],
    index: "000009",
    direction: SpecificDirection.LEFTUP,
    force: 0.2,
    sector: 2
  },

  // 000010
  {
    v0: [-643, 216],
    v1: [-624, 418],
    index: "000010",
    direction: SpecificDirection.LEFT,
    force: 0.7,
    sector: 3
  },

  // 000011
  {
    v0: [-810, 162],
    v1: [-620, 13],
    index: "000011",
    direction: SpecificDirection.UP,
    force: 0.4,
    sector: 3
  },

  // 000012
  {
    v0: [-2634, 1187],
    v1: [-2692, 950],
    index: "000012",
    direction: SpecificDirection.LEFT,
    force: 0.7,
    sector: 3
  },

  // 000013
  {
    v0: [-2603, 1505],
    v1: [-3162, 1753],
    index: "000013",
    direction: SpecificDirection.DOWN,
    force: 0.4,
    sector: 3
  }

]
};

export const IMOLA: Circuit = {
  map: imola_raw,
  info: IMOLA_INFO,
};

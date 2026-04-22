

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

const sepang_raw = readFileSync(join(__dirname, "sepang.hbs"), "utf-8");
const sepang_json = JSON.parse(sepang_raw);




const SEPANG_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 102,
      maxX: 132,
      minY: -345,
      maxY: 6,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sepang F1 International Circuit - By Ximb",
  sectorOne: {
    bounds: {
      minX: 102,
      maxX: 132,
      minY: -345,
      maxY: 6,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1161,
      maxX: -1130,
      minY: -2006,
      maxY: -1732,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 667,
      maxX: 699,
      minY: 413,
      maxY: 628,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: 133,
    maxX: 1226,
    minY: -345,
    maxY: -277,
  },
  pitlaneStart: {
    minX: 1496,
    maxX: 1526,
    minY: -435,
    maxY: -268,
  },
  pitlaneEnd: {
    minX: -219,
    maxX: -199,
    minY: -313,
    maxY: -183,
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
    x: sepang_json.redSpawnPoints[sepang_json.redSpawnPoints.length - 1][0],
    y: sepang_json.redSpawnPoints[sepang_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.sepang,
  MainColor: [0xc70000, 0x000080, 0xffffff],
  AvatarColor: 0xffd800,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  physicsType: CircuitPhysics.WEC_NEWGEN,
  CutDetectSegments: [
    {
      v0: [1749, -82],
      v1: [2026, -120],
      index: 151,
      penalty: 5,
    },
    {
      v0: [-2437, -304],
      v1: [-2347, -185],
      index: 152,
      penalty: 5,
    },
    {
      v0: [-2332, -383],
      v1: [-2347, -185],
      index: 153,
      penalty: 5,
    },
    {
      v0: [-1978, -907],
      v1: [-1659, -669],
      index: 154,
      penalty: 5,
    },
    {
      v0: [-1851, -1466],
      v1: [-1829, -1372],
      index: 155,
      penalty: 5,
    },
    {
      v0: [196, -1940],
      v1: [130, -1842],
      index: 156,
      penalty: 5,
    },
    {
      v0: [2316, 3],
      v1: [2026, -120],
      index: 157,
      penalty: 5,
    },
    {
      v0: [-1153, 894],
      v1: [-1428, 823],
      index: 158,
      penalty: 5,
    },
    {
      v0: [-1477, 979],
      v1: [-1428, 823],
      index: 159,
      penalty: 5,
    },
    {
      v0: [1333, 283],
      v1: [1428, 361],
      index: 160,
      penalty: 5,
    },
    {
      v0: [455, -1577],
      v1: [586, -1580],
      index: 161,
      penalty: 5,
    },
    {
      v0: [774, 338],
      v1: [1428, 361],
      index: 174,
      penalty: 5,
    },
    {
      v0: [2261, -497],
      v1: [2297, -645],
      index: 176,
      penalty: 5,
    },
    {
      v0: [1462, -930],
      v1: [1504, -435],
      index: 177,
      penalty: 5,
    },
    {
      v0: [1694, -879],
      v1: [1504, -435],
      index: 178,
      penalty: 5,
    },
  ],
DirectionChangerDetector: [

  // 000001
  {
    v0: [-2204, -187],
    v1: [-2206, 2],
    index: "000001",
    direction: SpecificDirection.LEFT,
    force: 0.6,
    sector: 1
  },

  // 000002
  {
    v0: [-2333, -186],
    v1: [-2742, -642],
    index: "000002",
    direction: SpecificDirection.UP,
    force: 0.2,
    sector: 1
  },

  // 000003
  {
    v0: [-2045, -512],
    v1: [-2240, -195],
    index: "000003",
    direction: SpecificDirection.RIGHTDOWN,
    force: 0.4,
    sector: 1
  },

  // 000004
  {
    v0: [-1834, -1345],
    v1: [-2365, -1456],
    index: "000004",
    direction: SpecificDirection.UP,
    force: 0.4,
    sector: 1
  },

  // 000005
  {
    v0: [66, -1881],
    v1: [16, -2180],
    index: "000005",
    direction: SpecificDirection.RIGHT,
    force: 0.6,
    sector: 2
  },

  // 000006
  {
    v0: [211, -1124],
    v1: [500, -1130],
    index: "000006",
    direction: SpecificDirection.DOWN,
    force: 0.4,
    sector: 2
  },


  // 000008
  {
    v0: [1453, -868],
    v1: [1159, -870],
    index: "000008",
    direction: SpecificDirection.UP,
    force: 0.5,
    sector: 2
  },

  // 000009
  {
    v0: [2226, -129],
    v1: [2411, -283],
    index: "000009",
    direction: SpecificDirection.RIGHTDOWN,
    force: 0.7,
    sector: 2
  },

  // 000010
  {
    v0: [2100, 193],
    v1: [2526, 500],
    index: "000010",
    direction: SpecificDirection.LEFTDOWN,
    force: 0.4,
    sector: 2
  },

  // 000011
  {
    v0: [459, 413],
    v1: [468, 651],
    index: "000011",
    direction: SpecificDirection.LEFT,
    force: 0.8,
    sector: 2
  },

  // 000012
  {
    v0: [692, 1100],
    v1: [798, 834],
    index: "000012",
    direction: SpecificDirection.RIGHT,
    force: 0.5,
    sector: 2
  },

  // 000013
  {
    v0: [674, 1685],
    v1: [1109, 2019],
    index: "000013",
    direction: SpecificDirection.LEFTDOWN,
    force: 0.4,
    sector: 2
  },

  // 000014
  {
    v0: [-402, 947],
    v1: [-145, 789],
    index: "000014",
    direction: SpecificDirection.UP,
    force: 0.6,
    sector: 3
  },

  // 000015
  {
    v0: [-1970, 710],
    v1: [-2443, 761],
    index: "000015",
    direction: SpecificDirection.UP,
    force: 0.7,
    sector: 3
  },

  // 000016
  {
    v0: [1394, 48],
    v1: [1430, 361],
    index: "000016",
    direction: SpecificDirection.RIGHT,
    force: 0.9,
    sector: 2
  }


]
};

export const SEPANG: Circuit = {
  map: sepang_raw,
  info: SEPANG_INFO,
};

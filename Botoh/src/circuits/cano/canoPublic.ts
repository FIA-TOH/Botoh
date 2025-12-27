import { bestTimes } from '../bestTimes';
import { Circuit, CircuitInfo, Direction } from '../Circuit';
import { readFileSync } from 'fs';
import { join } from 'path';

const canoPublic_raw = readFileSync(join(__dirname, 'canoPublic.hbs'), 'utf-8');
const canoPublic_json = JSON.parse(canoPublic_raw);

const CANOPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 2149,
      maxX: 2181,
      minY: -243,
      maxY: 400,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: 2149,
      maxX: 2181,
      minY: -243,
      maxY: 400,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1152,
      maxX: -112,
      minY: -112,
      maxY: -80,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -706,
      maxX: -674,
      minY: 155,
      maxY: 430,
    },
    passingDirection: Direction.RIGHT,
  },
  name: 'Circuito Urbano de La Villa Cano - By Ximb',
  boxLine: {
    minX: 1540,
    maxX: 2540,
    minY: -242,
    maxY: -176,
  },
  pitlaneStart: {
    minX: 2980,
    maxX: 3012,
    minY: -371,
    maxY: -210,
  },
  pitlaneEnd: {
    minX: 1474,
    maxX: 1506,
    minY: -253,
    maxY: -29,
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
    x: canoPublic_json.redSpawnPoints[canoPublic_json.redSpawnPoints.length - 1][0],
    y: canoPublic_json.redSpawnPoints[canoPublic_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.canoPublic,
  MainColor: [0x4415b0, 0x4e18c9, 0x571be0],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: 0,
  CutDetectSegments: [
    {
      v0: [258, 1290],
      v1: [275, 1224],
      index: 233,
      penalty: 5,
    },
    {
      v0: [25, 1269],
      v1: [-162, 1443],
      index: 234,
      penalty: 5,
    },
    {
      v0: [-1199, -1679],
      v1: [-1260, -1578],
      index: 235,
      penalty: 5,
    },
    {
      v0: [-1540, -1820],
      v1: [-1564, -1969],
      index: 236,
      penalty: 5,
    },
    {
      v0: [-1806, -1557],
      v1: [-1657, -1465],
      index: 237,
      penalty: 5,
    },
    {
      v0: [-1853, -1082],
      v1: [-2106, -1285],
      index: 238,
      penalty: 5,
    },
    {
      v0: [-2277, -869],
      v1: [-2348, -1147],
      index: 239,
      penalty: 5,
    },
    {
      v0: [-2524, -242],
      v1: [-1300, 163],
      index: 240,
      penalty: 5,
    },
    {
      v0: [711, 44],
      v1: [660, 78],
      index: 241,
      penalty: 5,
    },
    {
      v0: [1363, -464],
      v1: [1311, -155],
      index: 242,
      penalty: 5,
    },
    {
      v0: [267, -59],
      v1: [655, -278],
      index: 243,
      penalty: 5,
    },
    {
      v0: [655, -278],
      v1: [1123, -15],
      index: 244,
      penalty: 5,
    },
    {
      v0: [162, 109],
      v1: [267, -59],
      index: 245,
      penalty: 5,
    },
    {
      v0: [105, -47],
      v1: [267, -59],
      index: 246,
      penalty: 5,
    },
    {
      v0: [213, -174],
      v1: [267, -59],
      index: 247,
      penalty: 5,
    },
    {
      v0: [1974, -908],
      v1: [1970, -1095],
      index: 248,
      penalty: 5,
    },
    {
      v0: [2373, -785],
      v1: [2229, -398],
      index: 249,
      penalty: 5,
    },
    {
      v0: [2539, -762],
      v1: [2561, -243],
      index: 250,
      penalty: 5,
    },
    {
      v0: [2788, -534],
      v1: [2886, -762],
      index: 251,
      penalty: 5,
    },
    {
      v0: [3071, 44],
      v1: [3005, 132],
      index: 252,
      penalty: 5,
    },
  ],
};

export const CANOPUBLIC: Circuit = {
  map: canoPublic_raw,
  info: CANOPUBLIC_INFO,
};

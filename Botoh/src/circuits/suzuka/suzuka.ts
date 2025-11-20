import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const suzuka_raw = readFileSync(join(__dirname, "suzuka.hbs"), "utf-8");
const suzuka_json = JSON.parse(suzuka_raw);

const SUZUKA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1973,
      maxX: 2005,
      minY: -1086,
      maxY: -711,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 1973,
      maxX: 2005,
      minY: -1086,
      maxY: -711,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 173,
      maxX: 823,
      minY: 320,
      maxY: 352,
    },
    passingDirection: Direction.DOWN,
  },
  sectorThree: {
    bounds: {
      minX: -1474,
      maxX: -1442,
      minY: 1140,
      maxY: 1386,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Suzuka International Circuit - By Ximb",
  boxLine: {
    minX: 928,
    maxX: 1968,
    minY: -801,
    maxY: -711,
  },
  pitlaneStart: {
    minX: 824,
    maxX: 856,
    minY: -881,
    maxY: -700,
  },
  pitlaneEnd: {
    minX: 2099,
    maxX: 2131,
    minY: -881,
    maxY: -700,
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
    x: suzuka_json.redSpawnPoints[suzuka_json.redSpawnPoints.length - 1][0],
    y: suzuka_json.redSpawnPoints[suzuka_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.suzuka,
  MainColor: [0xffffff],
  AvatarColor: 0xbc002d,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  haveDebris: true,
  CutDetectSegments: [
    {
      v0: [2938, -562],
      v1: [3227, -332],
      index: 192,
      penalty: 5,
    },
    {
      v0: [2663, -187],
      v1: [3457, 267],
      index: 193,
      penalty: 5,
    },
    {
      v0: [2376, 43],
      v1: [2002, -258],
      index: 194,
      penalty: 5,
    },
    {
      v0: [1954, -31],
      v1: [1870, 172],
      index: 195,
      penalty: 5,
    },
    {
      v0: [1542, 161],
      v1: [1502, 49],
      index: 196,
      penalty: 5,
    },
    {
      v0: [1153, -143],
      v1: [1029, -129],
      index: 197,
      penalty: 5,
    },
    {
      v0: [361, 741],
      v1: [493, 885],
      index: 198,
      penalty: 5,
    },
    {
      v0: [-1050, 195],
      v1: [-1054, 129],
      index: 199,
      penalty: 5,
    },
    {
      v0: [-1287, 695],
      v1: [-1339, 568],
      index: 200,
      penalty: 5,
    },
    {
      v0: [-1507, 910],
      v1: [-1469, 739],
      index: 201,
      penalty: 5,
    },
    {
      v0: [-1864, 1048],
      v1: [-1815, 943],
      index: 202,
      penalty: 5,
    },
    {
      v0: [-2210, 1042],
      v1: [-2258.887039248235, 939.4756324015625],
      index: 203,
      penalty: 5,
    },
    {
      v0: [-2736, 991],
      v1: [-2790, 1150],
      index: 204,
      penalty: 5,
    },
    {
      v0: [-2928, 1360],
      v1: [-2790, 1150],
      index: 205,
      penalty: 5,
    },
    {
      v0: [-2868, 1427],
      v1: [-2750, 1365],
      index: 206,
      penalty: 5,
    },
    {
      v0: [-211, 404],
      v1: [-378, 692],
      index: 207,
      penalty: 5,
    },
    {
      v0: [2, -265],
      v1: [307, -28],
      index: 208,
      penalty: 5,
    },
    {
      v0: [-7, -473],
      v1: [148, -393],
      index: 209,
      penalty: 5,
    },
    {
      v0: [87, -591],
      v1: [-238, -704],
      index: 210,
      penalty: 5,
    },
  ],
};

export const SUZUKA: Circuit = {
  map: suzuka_raw,
  info: SUZUKA_INFO,
};

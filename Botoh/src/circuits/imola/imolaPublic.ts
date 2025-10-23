import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { readFileSync } from "fs";
import { join } from "path";

const imolaPublic_raw = readFileSync(
  join(__dirname, "imolaPublic.hbs"),
  "utf-8"
);
const imolaPublic_json = JSON.parse(imolaPublic_raw);

const IMOLAPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -150,
      maxX: -120,
      minY: 407,
      maxY: 760,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Autodromo Imola - By Ximb",
  sectorOne: {
    bounds: {
      minX: -150,
      maxX: -120,
      minY: 407,
      maxY: 760,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 2161,
      maxX: 2813,
      minY: -1797,
      maxY: -1767,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: -166,
      maxX: -136,
      minY: -455,
      maxY: -147,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: -1150,
    maxX: -150,
    minY: 667,
    maxY: 760,
  },
  pitlaneStart: {
    minX: -1248,
    maxX: -1218,
    minY: 601,
    maxY: 760,
  },
  pitlaneEnd: {
    minX: 330,
    maxX: 360,
    minY: 650,
    maxY: 760,
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
    x: imolaPublic_json.redSpawnPoints[
      imolaPublic_json.redSpawnPoints.length - 1
    ][0],
    y: imolaPublic_json.redSpawnPoints[
      imolaPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.imola,
  MainColor: [0x009246, 0xffffff, 0xce2b37],
  AvatarColor: 0x000001,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 5,
  CutDetectSegments: [
    {
      v0: [1726, 68],
      v1: [1775, 257],
      index: 153,
      penalty: 5,
    },
    {
      v0: [2023, -30],
      v1: [2348, 409],
      index: 154,
      penalty: 5,
    },
    {
      v0: [2480, -1262],
      v1: [2372, -1224],
      index: 155,
      penalty: 5,
    },
    {
      v0: [2452, -1579],
      v1: [2738, -1538],
      index: 156,
      penalty: 5,
    },
    {
      v0: [1387, -1413],
      v1: [1494, -1442],
      index: 157,
      penalty: 5,
    },
    {
      v0: [1556, -787],
      v1: [1465, -743],
      index: 158,
      penalty: 5,
    },
    {
      v0: [1314, -369],
      v1: [1381, -563],
      index: 159,
      penalty: 5,
    },
    {
      v0: [1017, -327],
      v1: [996, -148],
      index: 160,
      penalty: 5,
    },
    {
      v0: [-886, -358],
      v1: [-620, -389],
      index: 161,
      penalty: 5,
    },
    {
      v0: [-1141, -490],
      v1: [-1291, -144],
      index: 162,
      penalty: 5,
    },
    {
      v0: [-1679, -166],
      v1: [-1291, -144],
      index: 163,
      penalty: 5,
    },
    {
      v0: [-2246, 299],
      v1: [-2202, 318],
      index: 164,
      penalty: 5,
    },
    {
      v0: [-2188, 550],
      v1: [-2171, 646],
      index: 165,
      penalty: 5,
    },
    {
      v0: [-2345, 659],
      v1: [-2318, 860],
      index: 166,
      penalty: 5,
    },
    {
      v0: [-2488, 748],
      v1: [-2318, 860],
      index: 167,
      penalty: 5,
    },
    {
      v0: [-2392, 880],
      v1: [-2318, 860],
      index: 168,
      penalty: 5,
    },
    {
      v0: [-2311, 993],
      v1: [-2318, 860],
      index: 169,
      penalty: 5,
    },
  ],
};

export const IMOLAPUBLIC: Circuit = {
  map: imolaPublic_raw,
  info: IMOLAPUBLIC_INFO,
};

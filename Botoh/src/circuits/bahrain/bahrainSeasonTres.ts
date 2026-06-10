import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const bahrainSeasonTres_raw = readFileSync(join(__dirname, "bahrainSeasonTres.hbs"), "utf-8");
const bahrainSeasonTres_json = JSON.parse(bahrainSeasonTres_raw);

const BAHRAINSEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -359,
      maxX: -327,
      minY: -56,
      maxY: 271,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sakhir Bahrain International Circuit - By Ximb - NewgenV3",
  sectorOne: {
    bounds: {
      minX: -359,
      maxX: -327,
      minY: -56,
      maxY: 271,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -392,
      maxX: -360,
      minY: -2132,
      maxY: -1326,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 977,
      maxX: 1009,
      minY: -2059,
      maxY: -1609.2592592592596,
    },
    passingDirection: Direction.RIGHT,
  },
  boxLine: {
    minX: -327,
    maxX: 761,
    minY: -56,
    maxY: 10,
  },
  pitlaneStart: {
    minX: 1180,
    maxX: 1212,
    minY: -36,
    maxY: 76,
  },
  pitlaneEnd: {
    minX: -481,
    maxX: -449,
    minY: -56,
    maxY: 76,
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
    x: bahrainSeasonTres_json.redSpawnPoints[bahrainSeasonTres_json.redSpawnPoints.length - 1][0],
    y: bahrainSeasonTres_json.redSpawnPoints[bahrainSeasonTres_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.bahrainSeasonTres,
  MainColor: [0xffffff, 0xe90018, 0xe90018],
  AvatarColor: 0xf4d008,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: 15,
  pitGap: 15,
  new_safetycar: true,
CutDetectSegments: [
  {
    v0: [-1416, 36],
    v1: [-1184, 22],
    index: 242,
    penalty: 5,
  },
  {
    v0: [-1308, -311],
    v1: [-1352, -296],
    index: 244,
    penalty: 5,
  },
  {
    v0: [-1314, -574],
    v1: [-1317, -643],
    index: 246,
    penalty: 5,
  },
  {
    v0: [-1100, -2098],
    v1: [-1047, -1988],
    index: 248,
    penalty: 5,
  },
  {
    v0: [-674, -1902],
    v1: [-355, -2098],
    index: 250,
    penalty: 5,
  },
  {
    v0: [-355, -2098],
    v1: [-392, -1752],
    index: 251,
    penalty: 5,
  },
  {
    v0: [-56, -1567],
    v1: [-269, -1282],
    index: 253,
    penalty: 5,
  },
  {
    v0: [155, -1243],
    v1: [355, -1296],
    index: 255,
    penalty: 5,
  },
  {
    v0: [464, -732],
    v1: [266, -731],
    index: 257,
    penalty: 5,
  },
  {
    v0: [-355, -674],
    v1: [-229, -318],
    index: 259,
    penalty: 5,
  },
  {
    v0: [-714, -371],
    v1: [-470, -322],
    index: 261,
    penalty: 5,
  },
  {
    v0: [387, -112],
    v1: [389, -67],
    index: 263,
    penalty: 5,
  },
  {
    v0: [1568, -334],
    v1: [1532, -324],
    index: 265,
    penalty: 5,
  },
  {
    v0: [1249, -1832],
    v1: [1221, -1817],
    index: 267,
    penalty: 5,
  },
  {
    v0: [2085, -89],
    v1: [1855, -413],
    index: 269,
    penalty: 5,
  },
],
  CrashWallDetector: [
  {
    index: "183-184",
    v0: [419, 260],
    v1: [519, 270],
    curvatura: 0,
  },
  {
    index: "184-185",
    v0: [519, 270],
    v1: [2267, 272],
    curvatura: 0,
  },
  {
    index: "183-24",
    v0: [419, 260],
    v1: [-2008, 260],
    curvatura: 0,
  },
  {
    index: "189-190",
    v0: [-692.0985965426055, -1630.2076548377754],
    v1: [373.0711051100162, -758.3271723048964],
    curvatura: 0,
  },
  {
    index: "194-195",
    v0: [1364.2854632780675, -2213.531468747295],
    v1: [2383.1097465458674, 59.11209824945449],
    curvatura: 0,
  },
  {
    index: "195-185",
    v0: [2383.1097465458674, 59.11209824945449],
    v1: [2267, 272],
    curvatura: 112.5165057991202,
  },
],
};
export const BAHRAINSEASONTRES: Circuit = {
  map: bahrainSeasonTres_raw,
  info: BAHRAINSEASONTRES_INFO,
};

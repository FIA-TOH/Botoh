import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const bahrainPublic_raw = readFileSync(
  join(__dirname, "bahrainPublic.hbs"),
  "utf-8"
);
const bahrainPublic_json = JSON.parse(bahrainPublic_raw);

const BAHRAINPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -359,
      maxX: -327,
      minY: -56,
      maxY: 271,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sakhir Bahrain International Circuit - By Ximb - Public",
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
    x: 2331,
    y: 241,
  },
  BestTime: bestTimes.bahreinPublic,
  MainColor: [0xffffff, 0xe90018, 0xe90018],
  AvatarColor: 0xf4d008,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
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
};
export const BAHRAINPUBLIC: Circuit = {
  map: bahrainPublic_raw,
  info: BAHRAINPUBLIC_INFO,
};

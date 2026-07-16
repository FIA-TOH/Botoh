

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const argentinaPublic_raw = readFileSync(join(__dirname, "argentinaPublic.hbs"), "utf-8");
const argentinaPublic_json = JSON.parse(argentinaPublic_raw);




const ARGENTINAPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -1200,
      maxX: -836,
      minY: -168,
      maxY: -136,
    },
    passingDirection: Direction.UP,
  },
  sectorOne: {
    bounds: {
      minX: -1200,
      maxX: -836,
      minY: -168,
      maxY: -136,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: -268,
      maxX: 371,
      minY: -1531,
      maxY: -1499,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 491,
      maxX: 1410,
      minY: 50,
      maxY: 82,
    },
    passingDirection: Direction.UP,
  },
  name: "Autodromo Oscar Alfredo Galvez - By Ximb - Public",
  boxLine: {
    minX: -924,
    maxX: -836,
    minY: -136,
    maxY: 964,
  },
  pitlaneStart: {
    minX: -1010,
    maxX: -888,
    minY: 1336,
    maxY: 1368,
  },
  pitlaneEnd: {
    minX: -1010,
    maxX: -836,
    minY: -261,
    maxY: -229,
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
    x: argentinaPublic_json.redSpawnPoints[
      argentinaPublic_json.redSpawnPoints.length - 1
    ][0],
    y: argentinaPublic_json.redSpawnPoints[
      argentinaPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.argentinaPublic,
  MainColor: [0x6cace4, 0xffffff, 0x6cace4],
  AvatarColor: 0xffc300,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  CutDetectSegments: [
  { v0: [-474, -908], v1: [-447, -909], index: 162, penalty: 5 },
  { v0: [-320, -600], v1: [-189, -531], index: 164, penalty: 5 },
  { v0: [-365, -209], v1: [-337, -236], index: 166, penalty: 5 },
  { v0: [264, -775], v1: [264, -1020], index: 168, penalty: 5 },
  { v0: [265, -915], v1: [14, -856], index: 170, penalty: 5 },
  { v0: [143, -1353], v1: [310, -1534], index: 172, penalty: 5 },
  { v0: [656, -1474], v1: [1363, -39], index: 174, penalty: 5 },
  { v0: [872, -1580], v1: [892, -1583], index: 176, penalty: 5 },
  { v0: [720, 725], v1: [380, 571], index: 178, penalty: 5 },
  { v0: [865, 537], v1: [1047, 680], index: 180, penalty: 5 },
  { v0: [1081, 304], v1: [518, 27], index: 182, penalty: 5 },
  { v0: [1062, -11], v1: [1256, -186], index: 184, penalty: 5 },
  { v0: [-288, 664], v1: [11, 125], index: 186, penalty: 5 },
  { v0: [-288, 664], v1: [-438, 617], index: 186, penalty: 5 },
  { v0: [-203, 974], v1: [336, 731], index: 189, penalty: 5 },
  { v0: [42, 1095], v1: [132, 1212], index: 191, penalty: 5 },
  { v0: [132, 1212], v1: [-2, 1485], index: 192, penalty: 5 },
  { v0: [-2, 1485], v1: [-609, 1185], index: 193, penalty: 5 },
  { v0: [-1127, 2406], v1: [-237, 1901], index: 195, penalty: 5 },
  { v0: [-672, 2146], v1: [-618, 2259], index: 197, penalty: 5 },
  { v0: [-1448, 2161], v1: [-1418, 2254], index: 199, penalty: 5 },
],
};

export const ARGENTINAPUBLIC: Circuit = {
  map: argentinaPublic_raw,
  info: ARGENTINAPUBLIC_INFO,
};



import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const interlagosPublic_raw = readFileSync(join(__dirname, "interlagosPublic.hbs"), "utf-8");
const interlagosPublic_json = JSON.parse(interlagosPublic_raw);




const INTERLAGOSPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 773,
      maxX: 805,
      minY: 1017,
      maxY: 1336,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 773,
      maxX: 805,
      minY: 1017,
      maxY: 1336,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 109,
      maxX: 141,
      minY: -1332,
      maxY: -833,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -1680,
      maxX: -1167,
      minY: -379,
      maxY: -347,
    },
    passingDirection: Direction.UP,
  },
  name: "Autodromo Interlagos - By Ximb - Public",
  boxLine: {
    minX: -227,
    maxX: 773,
    minY: 1017,
    maxY: 1093,
  },
  pitlaneStart: {
    minX: -724,
    maxX: -692,
    minY: 1051,
    maxY: 1157,
  },
  pitlaneEnd: {
    minX: 1248,
    maxX: 1421,
    minY: 923,
    maxY: 955,
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
    x: interlagosPublic_json.redSpawnPoints[
      interlagosPublic_json.redSpawnPoints.length - 1
    ][0],
    y: interlagosPublic_json.redSpawnPoints[
      interlagosPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.interlagosPublic,
  MainColor: [0x10a100, 0xffff00, 0x10a100],
  AvatarColor: 0x00008c,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 10,
  CutDetectSegments: [
  { v0: [1728, 1011], v1: [1371, 1013], index: 146, penalty: 5 },
  { v0: [1647, 740], v1: [1923, 705], index: 148, penalty: 5 },
  { v0: [1831, 74], v1: [1670, 256], index: 150, penalty: 5 },
  { v0: [953, -469], v1: [188, -909], index: 152, penalty: 5 },
  { v0: [140, -1220], v1: [917, -807], index: 154, penalty: 5 },
  { v0: [140, -1220], v1: [175, -1274], index: 154, penalty: 5 },
  { v0: [-347, -1194], v1: [-309, -1127], index: 157, penalty: 5 },
  { v0: [-334, 433], v1: [-237, 460], index: 159, penalty: 5 },
  { v0: [-237, 460], v1: [-270, 709], index: 160, penalty: 5 },
  { v0: [-270, 709], v1: [-407, 803], index: 161, penalty: 5 },
  { v0: [-407, 803], v1: [-939, 813], index: 162, penalty: 5 },
  { v0: [-1220, 373], v1: [-976, 123], index: 164, penalty: 5 },
  { v0: [-1220, 373], v1: [-1772, 544], index: 164, penalty: 5 },
  { v0: [-1876, 1393], v1: [1563, 1385], index: 167, penalty: 5 },
],
};

export const INTERLAGOSPUBLIC: Circuit = {
  map: interlagosPublic_raw,
  info: INTERLAGOSPUBLIC_INFO,
};

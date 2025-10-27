import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const valenciaPublic_raw = readFileSync(
  join(__dirname, "valenciaPublic.hbs"),
  "utf-8"
);
const valenciaPublic_json = JSON.parse(valenciaPublic_raw);

const VALENCIAPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -215,
      maxX: 210,
      minY: 68,
      maxY: 100,
    },
    passingDirection: Direction.UP,
  },
  sectorOne: {
    bounds: {
      minX: -215,
      maxX: 210,
      minY: 68,
      maxY: 100,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: 3580,
      maxX: 3610,
      minY: -359,
      maxY: -208,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: -543,
      maxX: -513,
      minY: 1100,
      maxY: 1280,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Valencia Street Circuit - By Ximb",
  boxLine: {
    minX: 87,
    maxX: 162,
    minY: 104,
    maxY: 688,
  },
  pitlaneStart: {
    minX: -6,
    maxX: 163,
    minY: 720,
    maxY: 750,
  },
  pitlaneEnd: {
    minX: 6,
    maxX: 146,
    minY: -331,
    maxY: -300,
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
    x: valenciaPublic_json.redSpawnPoints[
      valenciaPublic_json.redSpawnPoints.length - 1
    ][0],
    y: valenciaPublic_json.redSpawnPoints[
      valenciaPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.valenciaPublic,
  MainColor: [0xc60b1e, 0xffc400, 0xc60b1e],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  CutDetectSegments: [
    {
      v0: [3970, 175],
      v1: [4156, 351],
      index: 186,
      penalty: 5,
    },
    {
      v0: [-3496, -121],
      v1: [-3455, -118],
      index: 211,
      penalty: 5,
    },
    {
      v0: [-2183, -706],
      v1: [-2187, -858],
      index: 212,
      penalty: 5,
    },
    {
      v0: [-1644, -405],
      v1: [-1623, -509],
      index: 213,
      penalty: 5,
    },
    {
      v0: [-625, 539],
      v1: [-555, 492],
      index: 214,
      penalty: 5,
    },
    {
      v0: [380, 1283],
      v1: [385, 1223],
      index: 215,
      penalty: 5,
    },
    {
      v0: [248, 1117],
      v1: [53, 1186],
      index: 217,
      penalty: 5,
    },
    {
      v0: [67, 1068],
      v1: [53, 1186],
      index: 224,
      penalty: 5,
    },
    {
      v0: [2370, -805],
      v1: [2407, -596],
      index: 225,
      penalty: 5,
    },
  ],
};

export const VALENCIAPUBLIC: Circuit = {
  map: valenciaPublic_raw,
  info: VALENCIAPUBLIC_INFO,
};

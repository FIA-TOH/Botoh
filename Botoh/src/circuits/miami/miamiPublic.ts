import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction, SpecificDirection } from "../Circuit";

const miamiPublic_raw = readFileSync(join(__dirname, "miamiPublic.hbs"), "utf-8");
const miamiPublic_json = JSON.parse(miamiPublic_raw);

const MIAMIPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -13,
      maxY: 344,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -13,
      maxY: 344,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: -1412,
      maxX: -1380,
      minY: 1868,
      maxY: 2081,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1296,
      maxX: 1328,
      minY: -1585,
      maxY: -1336,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Miami by Rodri - Public",
  boxLine: {
    minX: -900,
    maxX: 1,
    minY: 265,
    maxY: 344,
  },
  pitlaneStart: {
    minX: -1429,
    maxX: -965,
    minY: 600,
    maxY: 632,
  },
  pitlaneEnd: {
    minX: 132,
    maxX: 164,
    minY: 188,
    maxY: 307,
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
    x: miamiPublic_json.redSpawnPoints[miamiPublic_json.redSpawnPoints.length - 1][0],
    y: miamiPublic_json.redSpawnPoints[miamiPublic_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.miamiPublic,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.96,
  TireDegradationPercentage: 10,
  pitGap: 15,
  new_safetycar: true,


CutDetectSegments: [
  {
    v0: [1468, 44],
    v1: [1566, -142],
    index: 255,
    penalty: 5,
  },
  {
    v0: [1623, -1093],
    v1: [1656, -1121],
    index: 257,
    penalty: 5,
  },
  {
    v0: [1593, -1258],
    v1: [1646, -1357],
    index: 259,
    penalty: 5,
  },
],
};

export const MIAMIPUBLIC: Circuit = {
  map: miamiPublic_raw,
  info: MIAMIPUBLIC_INFO,
};

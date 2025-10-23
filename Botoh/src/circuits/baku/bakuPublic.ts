import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const bakuPublic_raw = readFileSync(join(__dirname, "bakuPublic.hbs"), "utf-8");
const bakuPublic_json = JSON.parse(bakuPublic_raw);

const BAKUPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1100,
      maxX: 1140,
      minY: -151,
      maxY: 204,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 1100,
      maxX: 1140,
      minY: -151,
      maxY: 204,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: -887,
      maxX: -857,
      minY: -631,
      maxY: -458,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -5610,
      maxX: -5472,
      minY: -247,
      maxY: -217,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Baku City Circuit - By Ximb",
  boxLine: {
    minX: 0,
    maxX: 1100,
    minY: -148,
    maxY: -64,
  },
  pitlaneStart: {
    minX: -396,
    maxX: -366,
    minY: -64,
    maxY: 22,
  },
  pitlaneEnd: {
    minX: 2408,
    maxX: 2438,
    minY: -64,
    maxY: 22,
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
    x: bakuPublic_json.redSpawnPoints[
      bakuPublic_json.redSpawnPoints.length - 1
    ][0],
    y: bakuPublic_json.redSpawnPoints[
      bakuPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.baku,
  MainColor: [0x00b5e2, 0xef3340, 0x509e2f],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: -10,
  CutDetectSegments: [
    {
      v0: [-4744, 1115],
      v1: [-4752, 1224],
      index: 220,
      penalty: 5,
    },
    {
      v0: [-5558, 84],
      v1: [-5640, 129],
      index: 221,
      penalty: 5,
    },
  ],
};

export const BAKUPUBLIC: Circuit = {
  map: bakuPublic_raw,
  info: BAKUPUBLIC_INFO,
};

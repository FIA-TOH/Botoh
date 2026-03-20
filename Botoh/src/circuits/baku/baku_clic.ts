import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const baku_clic_raw = readFileSync(join(__dirname, "baku_clic.hbs"), "utf-8");
const baku_clic_json = JSON.parse(baku_clic_raw);

const BAKU_CLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -208,
      maxX: -178,
      minY: -1612,
      maxY: -1282,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: -208,
      maxX: -178,
      minY: -1612,
      maxY: -1282,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: -3206,
      maxX: -3176,
      minY: -1912,
      maxY: -1491,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -6501,
      maxX: -6319,
      minY: -696,
      maxY: -666,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Baku - Clicquot",
  boxLine: {
    minX: -1313,
    maxX: -184,
    minY: -1612,
    maxY: -1557,
  },
  pitlaneStart: {
    minX: -1355,
    maxX: -1325,
    minY: -1557,
    maxY: -1495,
  },
  pitlaneEnd: {
    minX: -209,
    maxX: -179,
    minY: -1557,
    maxY: -1495,
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
    x: baku_clic_json.redSpawnPoints[baku_clic_json.redSpawnPoints.length - 1][0],
    y: baku_clic_json.redSpawnPoints[baku_clic_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.baku_clic,
  MainColor: [0x00b5e2, 0xef3340, 0x509e2f],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  physicsType: CircuitPhysics.SEMINEWGEN,
  CutDetectSegments: 
[
  {
    v0: [
      -4587.238435773618,
      -2223.634422455079
    ],
    v1: [
      -4818.086451599975,
      -2242.4398733915427
    ],
    index: 137,
    penalty: 5
  },
  {
    v0: [
      -6907.105674184283,
      -1420.0698011221214
    ],
    v1: [
      -6776.865566439284,
      -1435.6851231864043
    ],
    index: 180,
    penalty: 5
  },
  {
    v0: [
      -6195.9222498184245,
      -669.7982068829488
    ],
    v1: [
      -6220.812844141705,
      -580.5781102665984
    ],
    index: 181,
    penalty: 5
  },
  {
    v0: [
      -3519.21862580085,
      -1722.6786885902864
    ],
    v1: [
      -3406.2025495626553,
      -1630.5392950623993
    ],
    index: 183,
    penalty: 5
  },
  {
    v0: [
      -3237.2769377830136,
      -1695.4520726182052
    ],
    v1: [
      -3037.3764750725704,
      -1571.4397485293189
    ],
    index: 184,
    penalty: 5
  }
],
};

export const BAKU_CLIC: Circuit = {
  map: baku_clic_raw,
  info: BAKU_CLIC_INFO,
};

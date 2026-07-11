

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";

const estoril_raw = readFileSync(join(__dirname, "estoril.hbs"), "utf-8");
const estoril_json = JSON.parse(estoril_raw);

const ESTORIL_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 285,
      maxX: 315,
      minY: -130,
      maxY: 250,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: 285,
      maxX: 315,
      minY: -130,
      maxY: 250,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -220,
      maxX: -190,
      minY: -639,
      maxY: -306,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1553,
      maxX: 1583,
      minY: -1938,
      maxY: -1283,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Autódromo Fernanda Pires da Silva (Estoril) By Nanoseb",
  boxLine: {
    minX: -500,
    maxX: 400,
    minY: -130,
    maxY: -75,
  },
  pitlaneStart: {
    minX: 430,
    maxX: 460,
    minY: -75,
    maxY: -10,
  },
  pitlaneEnd: {
    minX: -1105,
    maxX: -1075,
    minY: -75,
    maxY: -10,
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
    x: estoril_json.redSpawnPoints[
      estoril_json.redSpawnPoints.length - 1
    ][0],
    y: estoril_json.redSpawnPoints[
      estoril_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.estoril,
  MainColor: [0x10a100, 0xffff00, 0x10a100],
  AvatarColor: 0x00008c,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  physicsType: CircuitPhysics.FH_NEWGEN,
CutDetectSegments: 
[
  {
    "v0": [
      1636.0674269552649,
      -1955.0291658670092
    ],
    "v1": [
      1799.515482218497,
      -1509.117481119745
    ],
    "index": 238,
    "penalty": 5
  }
]
};

export const ESTORIL: Circuit = {
  map: estoril_raw,
  info: ESTORIL_INFO,
};

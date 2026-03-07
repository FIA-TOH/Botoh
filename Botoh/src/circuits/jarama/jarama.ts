

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";

const jarama_raw = readFileSync(join(__dirname, "jarama.hbs"), "utf-8");
const jarama_json = JSON.parse(jarama_raw);




const JARAMA_INFO: CircuitInfo = {
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
      minX: -745,
      maxX: -715,
      minY: -605,
      maxY: -305,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 722,
      maxX: 1213,
      minY: -775,
      maxY: -745,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Circuito de Madrid Jarama By Nanoseb",
  boxLine: {
    minX: -500,
    maxX: 400,
    minY: -130,
    maxY: -75,
  },
  pitlaneStart: {
    minX: 370,
    maxX: 400,
    minY: -75,
    maxY: -10,
  },
  pitlaneEnd: {
    minX: -500,
    maxX: -470,
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
    x: jarama_json.redSpawnPoints[
      jarama_json.redSpawnPoints.length - 1
    ][0],
    y: jarama_json.redSpawnPoints[
      jarama_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.jarama,
  MainColor: [0x10a100, 0xffff00, 0x10a100],
  AvatarColor: 0x00008c,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  physicsType: CircuitPhysics.FH_NEWGEN,
  CutDetectSegments:[
  {
    v0: [
      -408.4732053504002,
      -489.28624957440024
    ],
    v1: [
      -387.5171467764061,
      -445.81618655692733
    ],
    index: 159,
    penalty: 5
  },
  {
    v0: [
      -318.84419266560013,
      -593.6085430272003
    ],
    v1: [
      -270.91906721536355,
      -587.2770919067216
    ],
    index: 160,
    penalty: 5
  },
  {
    v0: [
      1129.8545179361286,
      -1690.021153935361
    ],
    v1: [
      1076.2816407935393,
      -1718.9657415858599
    ],
    index: 161,
    penalty: 5
  },
  {
    v0: [
      1521.242521226474,
      -2172.9180296625195
    ],
    v1: [
      1497.2453102592008,
      -1996.816856371201
    ],
    index: 162,
    penalty: 5
  },
  {
    v0: [
      621.7703992145631,
      -675.7435241463828
    ],
    v1: [
      946.2472814592005,
      -725.8480699392004
    ],
    index: 163,
    penalty: 5
  }
]
};

export const JARAMA: Circuit = {
  map: jarama_raw,
  info: JARAMA_INFO,
};

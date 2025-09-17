

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const interlagos_raw = readFileSync(join(__dirname, "interlagos.hbs"), "utf-8");
const interlagos_json = JSON.parse(interlagos_raw);




const INTERLAGOS_INFO: CircuitInfo = {
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
  name: "Autodromo Interlagos - By Ximb",
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
    x: interlagos_json.redSpawnPoints[
      interlagos_json.redSpawnPoints.length - 1
    ][0],
    y: interlagos_json.redSpawnPoints[
      interlagos_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.interlagos,
  MainColor: [0x10a100, 0xffff00, 0x10a100],
  AvatarColor: 0x00008c,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const INTERLAGOS: Circuit = {
  map: interlagos_raw,
  info: INTERLAGOS_INFO,
};

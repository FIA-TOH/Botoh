import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const portero_raw = readFileSync(join(__dirname, "portero.hbs"), "utf-8");
const portero_json = JSON.parse(portero_raw);

const PORTERO_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -457,
      maxX: -425,
      minY: -1263,
      maxY: -738,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Potrero de los funes by Metilazo",
  sectorOne: {
    bounds: {
      minX: -457,
      maxX: -425,
      minY: -1263,
      maxY: -738,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 768,
      maxX: 1164,
      minY: -260,
      maxY: -228,
    },
    passingDirection: Direction.DOWN,
  },
  sectorThree: {
    bounds: {
      minX: 48,
      maxX: 80,
      minY: 374,
      maxY: 614,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  },
  pitlaneStart: {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  },
  pitlaneEnd: {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
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
    x: portero_json.redSpawnPoints[portero_json.redSpawnPoints.length - 1][0],
    y: portero_json.redSpawnPoints[portero_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.portero,
  MainColor: [0x6cace4, 0xffffff, 0x6cace4],
  AvatarColor: 0xffc300,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 1,
  TireDegradationPercentage: 0,
};

export const PORTERO: Circuit = {
  map: portero_raw,
  info: PORTERO_INFO,
};

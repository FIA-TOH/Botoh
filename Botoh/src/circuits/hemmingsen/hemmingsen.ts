import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";

const hemmingsen_raw = readFileSync(join(__dirname, "hemmingsen.hbs"), "utf-8");
const hemmingsen_json = JSON.parse(hemmingsen_raw);

const HEMMINGSEN_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -15,
      maxX: 15,
      minY: -400,
      maxY: -21,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -15,
      maxX: 15,
      minY: -400,
      maxY: -21,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -748,
      maxX: -718,
      minY: 1100,
      maxY: 1240,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 585,
      maxX: 735,
      minY: 240,
      maxY: 270,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Hemmingsen-banen by Rodri",
  boxLine: {
    minX: -200,
    maxX: 630,
    minY: -400,
    maxY: -320,
  },
  pitlaneStart: {
    minX: 500,
    maxX: 530,
    minY: -320,
    maxY: -200,
  },
  pitlaneEnd: {
    minX: -1100,
    maxX: -1070,
    minY: -320,
    maxY: -200,
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
    x: hemmingsen_json.redSpawnPoints[hemmingsen_json.redSpawnPoints.length - 1][0],
    y: hemmingsen_json.redSpawnPoints[hemmingsen_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.hemmingsen,
  MainColor: [0xD0CFD4, 0xFDFDEE3, 0xDFDEE3],
  AvatarColor: 0xD0CFD4,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  physicsType: CircuitPhysics.CLASSIC,
};

export const HEMMINGSEN: Circuit = {
  map: hemmingsen_raw,
  info: HEMMINGSEN_INFO,
};

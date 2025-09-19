

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const argentinaLeague_raw = readFileSync(join(__dirname, "argentinaLeague.hbs"), "utf-8");
const argentinaLeague_json = JSON.parse(argentinaLeague_raw);




const ARGENTINALEAGUE_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -1200,
      maxX: -836,
      minY: -168,
      maxY: -136,
    },
    passingDirection: Direction.UP,
  },
  sectorOne: {
    bounds: {
      minX: -1200,
      maxX: -836,
      minY: -168,
      maxY: -136,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: -268,
      maxX: 371,
      minY: -1531,
      maxY: -1499,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 491,
      maxX: 1410,
      minY: 50,
      maxY: 82,
    },
    passingDirection: Direction.UP,
  },
  name: "Autodromo Oscar Alfredo Galvez - By Ximb",
  boxLine: {
    minX: -924,
    maxX: -836,
    minY: -136,
    maxY: 964,
  },
  pitlaneStart: {
    minX: -1010,
    maxX: -888,
    minY: 1336,
    maxY: 1368,
  },
  pitlaneEnd: {
    minX: -1010,
    maxX: -836,
    minY: -261,
    maxY: -229,
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
    x: argentinaLeague_json.redSpawnPoints[
      argentinaLeague_json.redSpawnPoints.length - 1
    ][0],
    y: argentinaLeague_json.redSpawnPoints[
      argentinaLeague_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.argentina,
  MainColor: [0x6cace4, 0xffffff, 0x6cace4],
  AvatarColor: 0xffc300,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const ARGENTINALEAGUE: Circuit = {
  map: argentinaLeague_raw,
  info: ARGENTINALEAGUE_INFO,
};

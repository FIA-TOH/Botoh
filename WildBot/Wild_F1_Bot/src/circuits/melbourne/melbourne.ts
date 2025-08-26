import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import melbourne_json from "./melbourne.json";

const MELBOURNE_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 75,
      maxX: 105,
      minY: -75,
      maxY: 275,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Albert-Park Melbourne Circuit - By Ximb",
  sectorOne: {
    bounds: {
      minX: 75,
      maxX: 105,
      minY: -75,
      maxY: 275,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -2691,
      maxX: -2377,
      minY: -2114,
      maxY: -2084,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 98,
      maxX: 128,
      minY: -983,
      maxY: -793,
    },
    passingDirection: Direction.RIGHT,
  },
  boxLine: {
    minX: 100,
    maxX: 800,
    minY: -75,
    maxY: 48,
  },
  pitlaneStart: {
    minX: 820,
    maxX: 850,
    minY: -72,
    maxY: 32,
  },
  pitlaneEnd: {
    minX: 70,
    maxX: 100,
    minY: -75,
    maxY: 60,
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
    x: melbourne_json.redSpawnPoints[
      melbourne_json.redSpawnPoints.length - 1
    ][0],
    y: melbourne_json.redSpawnPoints[
      melbourne_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.melbourne,
  MainColor: [0x023286, 0x023286, 0x023286],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const MELBOURNE: Circuit = {
  map: JSON.stringify(melbourne_json),
  info: MELBOURNE_INFO,
};

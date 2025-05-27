import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import suzukaLeague_json from "./suzukaLeague.json";

const SUZUKALEAGUE_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1973,
      maxX: 2005,
      minY: -1086,
      maxY: -711,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorOne: {
    bounds: {
      minX: 1973,
      maxX: 2005,
      minY: -1086,
      maxY: -711,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 173,
      maxX: 823,
      minY: 320,
      maxY: 352,
    },
    passingDirection: Direction.DOWN,
  },
  sectorThree: {
    bounds: {
      minX: -1474,
      maxX: -1442,
      minY: 1140,
      maxY: 1386,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Suzuka International Circuit - By Ximb",
  boxLine: {
    minX: 928,
    maxX: 1968,
    minY: -801,
    maxY: -711,
  },
  pitlaneStart: {
    minX: 824,
    maxX: 856,
    minY: -881,
    maxY: -700,
  },
  pitlaneEnd: {
    minX: 2099,
    maxX: 2131,
    minY: -881,
    maxY: -700,
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
    x: suzukaLeague_json.redSpawnPoints[
      suzukaLeague_json.redSpawnPoints.length - 1
    ][0],
    y: suzukaLeague_json.redSpawnPoints[
      suzukaLeague_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.suzuka,
  MainColor: [0xffffff],
  AvatarColor: 0xbc002d,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.94,
};

export const SUZUKALEAGUE: Circuit = {
  map: JSON.stringify(suzukaLeague_json),
  info: SUZUKALEAGUE_INFO,
};

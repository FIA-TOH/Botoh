import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import shanghaiPublic_json from "./shanghaiPublic.json";

const SHANGHAIPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -642,
      maxX: -610,
      minY: -125,
      maxY: 247,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -642,
      maxX: -610,
      minY: -125,
      maxY: 247,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1915,
      maxX: -1510,
      minY: -1780,
      maxY: -1748,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 69,
      maxX: 360,
      minY: -2234,
      maxY: -2202,
    },
    passingDirection: Direction.UP,
  },
  name: "Shanghai International Circuit - By Ximb",
  boxLine: {
    minX: -610,
    maxX: 390,
    minY: -125,
    maxY: -52,
  },
  pitlaneStart: {
    minX: 450,
    maxX: 482,
    minY: -165,
    maxY: 26,
  },
  pitlaneEnd: {
    minX: -837,
    maxX: -805,
    minY: -126,
    maxY: 26,
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
    x: shanghaiPublic_json.redSpawnPoints[
      shanghaiPublic_json.redSpawnPoints.length - 1
    ][0],
    y: shanghaiPublic_json.redSpawnPoints[
      shanghaiPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.shanghai,
  MainColor: [0xd6001d],
  AvatarColor: 0xfae100,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.95,
};

export const SHANGHAIPUBLIC: Circuit = {
  map: JSON.stringify(shanghaiPublic_json),
  info: SHANGHAIPUBLIC_INFO,
};

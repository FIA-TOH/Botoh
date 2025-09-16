import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import balaton_json from "./balaton.json";

const BALATON_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -34,
      maxX: -2,
      minY: -409,
      maxY: 22,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -34,
      maxX: -2,
      minY: -409,
      maxY: 22,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: 1029,
      maxX: 1061,
      minY: 176,
      maxY: 388,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: -209,
      maxX: 355,
      minY: 4256,
      maxY: 4288,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Balaton Park by Rodri",
  boxLine: {
    minX: -1,
    maxX: -353,
    minY: 1000,
    maxY: -273,
  },
  pitlaneStart: {
    minX: -1267,
    maxX: -1299,
    minY: -299,
    maxY: -201,
  },
  pitlaneEnd: {
    minX: -150,
    maxX: -118,
    minY: -400,
    maxY: -201,
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
    x: balaton_json.redSpawnPoints[balaton_json.redSpawnPoints.length - 1][0],
    y: balaton_json.redSpawnPoints[balaton_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.balaton,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.955,
};

export const BALATON: Circuit = {
  map: JSON.stringify(balaton_json),
  info: BALATON_INFO,
};

import austinPublic_json from "./austinPublic.json";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const AUSTINPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -2800,
      maxX: -2430,
      minY: -1315,
      maxY: -1285,
    },
    passingDirection: Direction.DOWN,
  },
  sectorOne: {
    bounds: {
      minX: -2800,
      maxX: -2430,
      minY: -1315,
      maxY: -1285,
    },
    passingDirection: Direction.DOWN,
  },
  sectorTwo: {
    bounds: {
      minX: 867,
      maxX: 2067,
      minY: 807,
      maxY: 839,
    },
    passingDirection: Direction.DOWN,
  },
  sectorThree: {
    bounds: {
      minX: 208,
      maxX: 595,
      minY: -844,
      maxY: -812,
    },
    passingDirection: Direction.DOWN,
  },
  name: "United States Grand Prix - By Ximb",
  boxLine: {
    minX: -2515,
    maxX: -2430,
    minY: -1991,
    maxY: -1285,
  },
  pitlaneStart: {
    minX: -2582,
    maxX: -2430,
    minY: -2037,
    maxY: -2007,
  },
  pitlaneEnd: {
    minX: -2584,
    maxX: -2498,
    minY: -952,
    maxY: -922,
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
    x: austinPublic_json.redSpawnPoints[
      austinPublic_json.redSpawnPoints.length - 1
    ][0],
    y: austinPublic_json.redSpawnPoints[
      austinPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.austin,
  MainColor: [0xb31942, 0xffffff, 0xb31942],
  AvatarColor: 0x0a3161,
  Angle: 90,
  Limit: 4,
  Votes: 0,
  pitSpeed: 0.94,
};

export const AUSTINPUBLIC: Circuit = {
  map: JSON.stringify(austinPublic_json),
  info: AUSTINPUBLIC_INFO,
};

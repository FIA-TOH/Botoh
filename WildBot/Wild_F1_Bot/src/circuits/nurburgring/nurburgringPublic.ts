import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import nurburgringPublic_json from "./nurburgringPublic.json";

const NURBURGRINGPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -654,
      maxX: -624,
      minY: -194,
      maxY: 150,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Aramco Grosser Preis der Eifel - By Ximb",
  sectorOne: {
    bounds: {
      minX: -654,
      maxX: -624,
      minY: -194,
      maxY: 150,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 2516,
      maxX: 2548,
      minY: -319,
      maxY: -32,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1571,
      maxX: 1603,
      minY: 1082,
      maxY: 1483,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: -1454,
    maxX: -654,
    minY: 71,
    maxY: 150,
  },
  pitlaneStart: {
    minX: -1536,
    maxX: -1506,
    minY: 11,
    maxY: 82,
  },
  pitlaneEnd: {
    minX: 300,
    maxX: 330,
    minY: 11,
    maxY: 150,
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
    x: nurburgringPublic_json.redSpawnPoints[
      nurburgringPublic_json.redSpawnPoints.length - 1
    ][0],
    y: nurburgringPublic_json.redSpawnPoints[
      nurburgringPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.nurburgring,
  MainColor: [0x000001, 0xdd0000, 0xffce00],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.95,
};

export const NURBURGRINGPUBLIC: Circuit = {
  map: JSON.stringify(nurburgringPublic_json),
  info: NURBURGRINGPUBLIC_INFO,
};

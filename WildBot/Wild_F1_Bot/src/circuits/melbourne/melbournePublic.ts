import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import melbournePublic_json from "./melbournePublic.json";

const MELBOURNEPUBLIC_INFO: CircuitInfo = {
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
    x: melbournePublic_json.redSpawnPoints[
      melbournePublic_json.redSpawnPoints.length - 1
    ][0],
    y: melbournePublic_json.redSpawnPoints[
      melbournePublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.melbourne,
  MainColor: [0x023286, 0x023286, 0x023286],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const MELBOURNEPUBLIC: Circuit = {
  map: JSON.stringify(melbournePublic_json),
  info: MELBOURNEPUBLIC_INFO,
};

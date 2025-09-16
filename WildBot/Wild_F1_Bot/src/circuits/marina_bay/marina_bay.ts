import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import marina_bay_json from "./marina_bay.json";

const MARINA_BAY_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -155,
      maxX: 216,
      minY: -513,
      maxY: -482,
    },
    passingDirection: Direction.UP,
  },
  name: "Marina Bay Street Circuit - By Ximb",
  boxLine: {
    minX: -155,
    maxX: -64,
    minY: -482,
    maxY: 426,
  },
  pitlaneStart: {
    minX: -65,
    maxX: 13,
    minY: 550,
    maxY: 580,
  },
  pitlaneEnd: {
    minX: -155,
    maxX: 15,
    minY: -594,
    maxY: -564,
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
    x: marina_bay_json.redSpawnPoints[
      marina_bay_json.redSpawnPoints.length - 1
    ][0],
    y: marina_bay_json.redSpawnPoints[
      marina_bay_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.marinaBay,
  MainColor: [0x6cace4, 0xffffff, 0x6cace4],
  AvatarColor: 0xffc300,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const MARINA_BAY: Circuit = {
  map: JSON.stringify(marina_bay_json),
  info: MARINA_BAY_INFO,
};

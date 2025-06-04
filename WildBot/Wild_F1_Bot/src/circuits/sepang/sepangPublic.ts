import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import sepangPublic_json from "./sepangPublic.json";

const SEPANGPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 102,
      maxX: 132,
      minY: -345,
      maxY: 6,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sepang F1 International Circuit - By Ximb",
  sectorOne: {
    bounds: {
      minX: 102,
      maxX: 132,
      minY: -345,
      maxY: 6,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1161,
      maxX: -1130,
      minY: -2006,
      maxY: -1732,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 667,
      maxX: 699,
      minY: 413,
      maxY: 628,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: 133,
    maxX: 1226,
    minY: -345,
    maxY: -277,
  },
  pitlaneStart: {
    minX: 1496,
    maxX: 1526,
    minY: -435,
    maxY: -268,
  },
  pitlaneEnd: {
    minX: -219,
    maxX: -199,
    minY: -313,
    maxY: -183,
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
    x: sepangPublic_json.redSpawnPoints[
      sepangPublic_json.redSpawnPoints.length - 1
    ][0],
    y: sepangPublic_json.redSpawnPoints[
      sepangPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.sepang,
  MainColor: [0xc70000, 0x000080, 0xffffff],
  AvatarColor: 0xffd800,
  Angle: 0,
  Limit: 5,
  Votes: 0,
};

export const SEPANGPUBLIC: Circuit = {
  map: JSON.stringify(sepangPublic_json),
  info: SEPANGPUBLIC_INFO,
};

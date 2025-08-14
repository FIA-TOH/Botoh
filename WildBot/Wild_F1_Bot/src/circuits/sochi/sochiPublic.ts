import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import sochiPublic_json from "./sochiPublic.json";

const SOCHIPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 2001,
      maxX: 2033,
      minY: 1528,
      maxY: 1777,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sochi Autodrom - By Ximb",
  sectorOne: {
    bounds: {
      minX: 2001,
      maxX: 2033,
      minY: 1528,
      maxY: 1777,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -2446,
      maxX: -2416,
      minY: -674,
      maxY: -407,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: 867,
      maxX: 1201,
      minY: 407,
      maxY: 437,
    },
    passingDirection: Direction.DOWN,
  },
  boxLine: {
    minX: 2123,
    maxX: 3124,
    minY: 1454,
    maxY: 1537,
  },
  pitlaneStart: {
    minX: 3086,
    maxX: 3223,
    minY: 1025,
    maxY: 1055,
  },
  pitlaneEnd: {
    minX: 1328,
    maxX: 1358,
    minY: 1526,
    maxY: 1606,
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
    x: sochiPublic_json.redSpawnPoints[
      sochiPublic_json.redSpawnPoints.length - 1
    ][0],
    y: sochiPublic_json.redSpawnPoints[
      sochiPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.sochi,
  MainColor: [0xffffff, 0x000080, 0xdd0000],
  AvatarColor: 0xffe817,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const SOCHIPUBLIC: Circuit = {
  map: JSON.stringify(sochiPublic_json),
  info: SOCHIPUBLIC_INFO,
};

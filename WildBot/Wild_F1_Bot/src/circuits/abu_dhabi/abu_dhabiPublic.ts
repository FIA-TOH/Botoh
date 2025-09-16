import abu_dhabiPublic_json from "./abu_dhabiPublic.json";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const ABU_DHABIPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -369,
      maxX: 7,
      minY: 110,
      maxY: 143,
    },
    passingDirection: Direction.DOWN,
  },
  name: "Yas Marina Circuit - By Ximb",
  boxLine: {
    minX: -369,
    maxX: -296,
    minY: -553,
    maxY: 145,
  },
  pitlaneStart: {
    minX: -341,
    maxX: -198,
    minY: -613,
    maxY: -583,
  },
  pitlaneEnd: {
    minX: -288,
    maxX: -198,
    minY: 795,
    maxY: 825,
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
    x: abu_dhabiPublic_json.redSpawnPoints[
      abu_dhabiPublic_json.redSpawnPoints.length - 1
    ][0],
    y: abu_dhabiPublic_json.redSpawnPoints[
      abu_dhabiPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.yasMarina,
  MainColor: [0x047a3d, 0xffffff, 0x047a3d],
  AvatarColor: 0xf30505,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const ABU_DHABIPUBLIC: Circuit = {
  map: JSON.stringify(abu_dhabiPublic_json),
  info: ABU_DHABIPUBLIC_INFO,
};

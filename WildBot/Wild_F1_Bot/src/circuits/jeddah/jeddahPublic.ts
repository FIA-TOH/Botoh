import jeddahPublic_json from "./jeddahPublic.json";
import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const JEDDAHPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 470,
      maxX: 502,
      minY: -160,
      maxY: 201,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Jeddah Street Circuit - By Ximb",
  boxLine: {
    minX: 470,
    maxX: 1424,
    minY: 100,
    maxY: 201,
  },
  pitlaneStart: {
    minX: 1482,
    maxX: 1512,
    minY: 10,
    maxY: 150,
  },
  pitlaneEnd: {
    minX: -395,
    maxX: -365,
    minY: 110,
    maxY: 213,
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
    x: jeddahPublic_json.redSpawnPoints[
      jeddahPublic_json.redSpawnPoints.length - 1
    ][0],
    y: jeddahPublic_json.redSpawnPoints[
      jeddahPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.jeddah,
};
export const JEDDAHPUBLIC: Circuit = {
  map: JSON.stringify(jeddahPublic_json),
  info: JEDDAHPUBLIC_INFO,
};

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const shanghaiPublic_raw = readFileSync(
  join(__dirname, "shanghaiPublic.hbs"),
  "utf-8"
);
const shanghaiPublic_json = JSON.parse(shanghaiPublic_raw);

const SHANGHAIPUBLIC_INFO: CircuitInfo = {
 finishLine: {
    bounds: {
      minX: -994,
      maxX: -639,
      minY: -526,
      maxY: -494,
    },
    passingDirection: Direction.UP,
  },
  sectorOne: {
     bounds: {
      minX: -994,
      maxX: -639,
      minY: -526,
      maxY: -494,
    },
    passingDirection: Direction.UP,
  },
  sectorTwo: {
    bounds: {
      minX: 1138,
      maxX: 1170,
      minY: -1801,
      maxY: -1552,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1415,
      maxX: 1447,
      minY: 175,
      maxY: 438,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Shanghai International Circuit - By Ximb - Public",
boxLine: {
    minX: -714,
    maxX: -639,
    minY: -526,
    maxY: 474,
  },
  pitlaneStart: {
    minX: -745,
    maxX: -713,
    minY: 897,
    maxY: 1041,
  },
  pitlaneEnd: {
    minX: -793,
    maxX: -638,
    minY: -804,
    maxY: -772,
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
  BestTime: bestTimes.shanghaiPublic,
  MainColor: [0xd6001d],
  AvatarColor: 0xfae100,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  CutDetectSegments: [
  { v0: [713, 459], v1: [707, 484], index: 254, penalty: 5 },
  { v0: [796, -1540], v1: [806, -1518], index: 252, penalty: 5 },
  { v0: [1507, 129], v1: [1628, 94], index: 256, penalty: 5 },
  { v0: [-1629, 1389], v1: [-1608, 1415], index: 258, penalty: 5 },
  { v0: [-1018, 896], v1: [-1073, 840], index: 260, penalty: 5 },
  { v0: [-455, -1083], v1: [-480, -1050], index: 262, penalty: 5 },
  { v0: [172, -1373], v1: [197, -1344], index: 264, penalty: 5 },
  { v0: [853, 68], v1: [847, 41], index: 266, penalty: 5 },
  { v0: [249, -914], v1: [282, -908], index: 268, penalty: 5 },
  { v0: [1302, -30], v1: [1257, -39], index: 270, penalty: 5 },
  { v0: [1523, -646], v1: [1536, -634], index: 272, penalty: 5 },
  { v0: [1973, -1537], v1: [1951, -1535], index: 274, penalty: 5 },
  { v0: [2437, 128], v1: [2451, 132], index: 276, penalty: 5 },
  { v0: [-2259, 1399], v1: [-2243, 1412], index: 278, penalty: 5 },
],
};

export const SHANGHAIPUBLIC: Circuit = {
  map: shanghaiPublic_raw,
  info: SHANGHAIPUBLIC_INFO,
};

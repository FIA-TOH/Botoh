import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const barcelona_raw = readFileSync(join(__dirname, "barcelona.hbs"), "utf-8");
const barcelona_json = JSON.parse(barcelona_raw);

const BARCELONA_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -340,
      maxY: -26,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Circuit de Barcelona-Catalunya by Rodri",
  sectorOne: {
    bounds: {
      minX: 1,
      maxX: 33,
      minY: -340,
      maxY: -26,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -1527,
      maxX: -1495,
      minY: -2012,
      maxY: -1608,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 545,
      maxX: 577,
      minY: -1161,
      maxY: -869,
    },
    passingDirection: Direction.RIGHT,
  },
  boxLine: {
    minX: -200,
    maxX: 800,
    minY: -340,
    maxY: -260,
  },
  pitlaneStart: {
    minX: 1197,
    maxX: 1229,
    minY: -295,
    maxY: -187,
  },
  pitlaneEnd: {
    minX: -690,
    maxX: -658,
    minY: -366,
    maxY: -187,
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
    x: barcelona_json.redSpawnPoints[
      barcelona_json.redSpawnPoints.length - 1
    ][0],
    y: barcelona_json.redSpawnPoints[
      barcelona_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.barcelona,
  MainColor: [0xc60b1e, 0xffc400, 0xc60b1e],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  TireDegradationPercentage: 0,
  CutDetectSegments: [
    {
      v0: [-2041.772863341188, -421.0704000000001],
      v1: [-1920.3703703703707, -506.4814814814816],
      index: 190,
      penalty: 5,
    },
    {
      v0: [1072.4400000000003, -760.3200000000002],
      v1: [1075.0824576000007, -867.3671116800004],
      index: 191,
      penalty: 5,
    },
    {
      v0: [1674.1572480000007, -1031.7041280000005],
      v1: [1559.5200000000004, -951.4800000000002],
      index: 192,
      penalty: 8,
    },
    {
      v0: [1638.0000000000005, -786.0000000000002],
      v1: [1720.4400000000005, -831.6000000000003],
      index: 193,
      penalty: 8,
    },
  ],
};

export const BARCELONA: Circuit = {
  map: barcelona_raw,
  info: BARCELONA_INFO,
};

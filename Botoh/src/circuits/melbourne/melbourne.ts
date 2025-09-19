import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const melbourne_raw = readFileSync(join(__dirname, "melbourne.hbs"), "utf-8");
const melbourne_json = JSON.parse(melbourne_raw);





const MELBOURNE_INFO: CircuitInfo = {
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
  sectorOne: {
    bounds: {
      minX: 75,
      maxX: 105,
      minY: -75,
      maxY: 275,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -2691,
      maxX: -2377,
      minY: -2114,
      maxY: -2084,
    },
    passingDirection: Direction.UP,
  },
  sectorThree: {
    bounds: {
      minX: 98,
      maxX: 128,
      minY: -983,
      maxY: -793,
    },
    passingDirection: Direction.RIGHT,
  },
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
    x: melbourne_json.redSpawnPoints[
      melbourne_json.redSpawnPoints.length - 1
    ][0],
    y: melbourne_json.redSpawnPoints[
      melbourne_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.melbourne,
  MainColor: [0x023286, 0x023286, 0x023286],
  AvatarColor: 0xffffff,
  Angle: 90,
  Limit: 5,
  Votes: 0,
  CutDetectSegments: [
    {
      v0: [-1987.395569781029, -769.2137377432301],
      v1: [-2137.790225067317, -833.5238530711781],
      index: 150,
      penalty: 5,
    },
    {
      v0: [311.97607072092666, -1127.241782248641],
      v1: [296.4403800233703, -1002.868261951938],
      index: 151,
      penalty: 5,
    },
    {
      v0: [640.8190824569424, -1178.7175227353553],
      v1: [690.6340496875475, -899.4119290758522],
      index: 152,
      penalty: 5,
    },
    {
      v0: [1774.215058680079, -959.743179393385],
      v1: [1868.4749276024993, -906.1846263272874],
      index: 153,
      penalty: 5,
    },
    {
      v0: [1068.4981964131484, -260.3769750546156],
      v1: [1118.509627597419, -197.66422801402223],
      index: 154,
      penalty: 5,
    },
    {
      v0: [-2575, -1465],
      v1: [-2493, -1421],
      index: 164,
      penalty: 5,
    },
  ],
};

export const MELBOURNE: Circuit = {
  map: melbourne_raw,
  info: MELBOURNE_INFO,
};

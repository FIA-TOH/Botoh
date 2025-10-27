import { readFileSync } from "fs";
import { join } from "path";

import { Circuit, CircuitInfo, Direction } from "../Circuit";
import { bestTimes } from "../bestTimes";

const bahrainPublic_raw = readFileSync(
  join(__dirname, "bahrainPublic.hbs"),
  "utf-8"
);
const bahrainPublic_json = JSON.parse(bahrainPublic_raw);

const BAHRAINPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 70,
      maxX: 100,
      minY: -56,
      maxY: 271,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Sakhir Bahrain International Circuit - By Ximb",
  sectorOne: {
    bounds: {
      minX: 70,
      maxX: 100,
      minY: -56,
      maxY: 271,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -100,
      maxX: -60,
      minY: -1545,
      maxY: -1014,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 493,
      maxX: 837,
      minY: -1385,
      maxY: -1355,
    },
    passingDirection: Direction.UP,
  },
  boxLine: {
    minX: 106,
    maxX: 1100,
    minY: -56,
    maxY: 10,
  },
  pitlaneStart: {
    minX: 1126,
    maxX: 1156,
    minY: -56,
    maxY: 66,
  },
  pitlaneEnd: {
    minX: -546,
    maxX: -516,
    minY: -49,
    maxY: 68,
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
    x: bahrainPublic_json.redSpawnPoints[
      bahrainPublic_json.redSpawnPoints.length - 1
    ][0],
    y: bahrainPublic_json.redSpawnPoints[
      bahrainPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.bahrein,
  MainColor: [0xffffff, 0xe90018, 0xe90018],
  AvatarColor: 0xf4d008,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  CutDetectSegments: [
    {
      v0: [388, -128],
      v1: [388, -59],
      index: 86,
      penalty: 5,
    },
    {
      v0: [-1297, 34],
      v1: [-926, -119],
      index: 155,
      penalty: 5,
    },
    {
      v0: [-1193, -325],
      v1: [-1385, -435],
      index: 156,
      penalty: 5,
    },
    {
      v0: [-972, -1273],
      v1: [-1072, -1345],
      index: 157,
      penalty: 5,
    },
    {
      v0: [-549, -1676],
      v1: [-550, -1638],
      index: 158,
      penalty: 5,
    },
    {
      v0: [-115, -1499],
      v1: [-97, -1555],
      index: 159,
      penalty: 5,
    },
    {
      v0: [124, -1242],
      v1: [-79, -1093],
      index: 160,
      penalty: 5,
    },
    {
      v0: [234, -997],
      v1: [514, -1127],
      index: 161,
      penalty: 5,
    },
    {
      v0: [495, -617],
      v1: [246, -679],
      index: 162,
      penalty: 5,
    },
    {
      v0: [-456, -455],
      v1: [-430, -414],
      index: 163,
      penalty: 5,
    },
    {
      v0: [-590, -355],
      v1: [-533, -346],
      index: 164,
      penalty: 5,
    },
    {
      v0: [1233, -511],
      v1: [1203, -332],
      index: 165,
      penalty: 5,
    },
    {
      v0: [881, -970],
      v1: [1024, -1044],
      index: 166,
      penalty: 5,
    },
    {
      v0: [797, -1219],
      v1: [905, -1150],
      index: 167,
      penalty: 5,
    },
    {
      v0: [994, -1673],
      v1: [984, -1636],
      index: 168,
      penalty: 5,
    },
    {
      v0: [1383, -1518],
      v1: [1517, -1517],
      index: 169,
      penalty: 5,
    },
    {
      v0: [1604, -1168],
      v1: [1736, -1176],
      index: 170,
      penalty: 5,
    },
    {
      v0: [1753, -918],
      v1: [1898, -904],
      index: 171,
      penalty: 5,
    },
    {
      v0: [1922, -655],
      v1: [2045, -640],
      index: 172,
      penalty: 5,
    },
    {
      v0: [2075, -414],
      v1: [2186, -418],
      index: 173,
      penalty: 5,
    },
  ],
};
export const BAHRAINPUBLIC: Circuit = {
  map: bahrainPublic_raw,
  info: BAHRAINPUBLIC_INFO,
};

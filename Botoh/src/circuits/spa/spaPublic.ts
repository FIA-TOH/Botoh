import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const spaPublic_raw = readFileSync(join(__dirname, "spaPublic.hbs"), "utf-8");
const spaPublic_json = JSON.parse(spaPublic_raw);

const SPAPUBLIC_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -2963,
      maxX: -2932,
      minY: -1120,
      maxY: -747,
    },
    passingDirection: Direction.LEFT,
  },
  name: "Spa-Francorchamps - By Ximb",
  sectorOne: {
    bounds: {
      minX: -2963,
      maxX: -2932,
      minY: -1120,
      maxY: -747,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: 2817,
      maxX: 2849,
      minY: -2121,
      maxY: -1805,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1843,
      maxX: 1875,
      minY: 1954,
      maxY: 2599,
    },
    passingDirection: Direction.LEFT,
  },
  boxLine: {
    minX: -2960,
    maxX: -1670,
    minY: -1120,
    maxY: -1018,
  },
  pitlaneStart: {
    minX: -1135,
    maxX: -1103,
    minY: -1153,
    maxY: -956,
  },
  pitlaneEnd: {
    minX: -3195,
    maxX: -3165,
    minY: -1215,
    maxY: -960,
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
    x: spaPublic_json.redSpawnPoints[
      spaPublic_json.redSpawnPoints.length - 1
    ][0],
    y: spaPublic_json.redSpawnPoints[
      spaPublic_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.spaPublic,
  MainColor: [0x000001, 0xfae042, 0xed2939],
  AvatarColor: 0xffffff,
  Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  TireDegradationPercentage: -5,
  CutDetectSegments: [
    {
      v0: [-3328, -1109],
      v1: [-3200, -1138],
      index: 222,
      penalty: 5,
    },
    {
      v0: [-1238, -1943],
      v1: [-1373.7337145887604, -1932.5321407735755],
      index: 223,
      penalty: 5,
    },
    {
      v0: [-981, -2071],
      v1: [-878, -1737],
      index: 224,
      penalty: 5,
    },
    {
      v0: [-441, -1946],
      v1: [-516, -2060],
      index: 225,
      penalty: 5,
    },
    {
      v0: [3160, -1862],
      v1: [3096, -1824],
      index: 226,
      penalty: 5,
    },
    {
      v0: [3215, -1594],
      v1: [3692, -1816],
      index: 227,
      penalty: 5,
    },
    {
      v0: [3633, -1378],
      v1: [3612, -1331],
      index: 228,
      penalty: 5,
    },
    {
      v0: [3976, -820],
      v1: [4044, -826],
      index: 229,
      penalty: 5,
    },
    {
      v0: [3912, -223],
      v1: [3708, 2],
      index: 230,
      penalty: 5,
    },
    {
      v0: [3420, -570],
      v1: [3330, -682],
      index: 231,
      penalty: 5,
    },
    {
      v0: [1663, -1149],
      v1: [1626, -1073],
      index: 232,
      penalty: 5,
    },
    {
      v0: [1451, -624],
      v1: [1469, -688],
      index: 233,
      penalty: 5,
    },
    {
      v0: [2507, 502],
      v1: [2446, 490],
      index: 234,
      penalty: 5,
    },
    {
      v0: [2111, 877],
      v1: [2173, 942],
      index: 235,
      penalty: 5,
    },
    {
      v0: [2137, 1884],
      v1: [2019, 1837],
      index: 236,
      penalty: 5,
    },
    {
      v0: [1551, 1965],
      v1: [1703, 2034],
      index: 237,
      penalty: 5,
    },
    {
      v0: [1321, 29],
      v1: [1295, 96],
      index: 238,
      penalty: 5,
    },
    {
      v0: [709, -211],
      v1: [719, -378],
      index: 239,
      penalty: 5,
    },
    {
      v0: [-199, -243],
      v1: [-136, -671],
      index: 240,
      penalty: 5,
    },
    {
      v0: [-1148, -470],
      v1: [-388, -801],
      index: 241,
      penalty: 5,
    },
    {
      v0: [-1137, -763],
      v1: [-1212, -748],
      index: 242,
      penalty: 5,
    },
  ],
};

export const SPAPUBLIC: Circuit = {
  map: spaPublic_raw,
  info: SPAPUBLIC_INFO,
};

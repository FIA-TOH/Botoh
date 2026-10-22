import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction, SpecificDirection } from "../Circuit";

import { readFileSync } from "fs";
import { join } from "path";

const lemansnight_raw = readFileSync(join(__dirname, "lemansnight.hbs"), "utf-8");

const LEMANSNIGHT_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -4765,
      maxX: -4733,
      minY: 3834,
      maxY: 4160,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
     bounds: {
     minX: -4765,
      maxX: -4733,
      minY: 3834,
      maxY: 4160,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -7285,
      maxX: -7253,
      minY: -1064,
      maxY: 1077,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 6656,
      maxX: 8530,
      minY: -3612,
      maxY: -3580,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Le Mans Circuit - Night - By Rodri and Ximb",
  boxLine: {
    minX: -4732.639802200822,
    maxX: -4032.6398022008216,
    minY: 3845.2996692102747,
    maxY: 3911.2996692102747,
  },
  pitlaneStart: {
    minX: -3759,
    maxX: -3727,
    minY: 3837,
    maxY: 3949,
  },
  pitlaneEnd: {
    minX: -5150,
    maxX: -5118,
    minY: 3893,
    maxY: 3959.2996692102747,
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
    x: -2530,
    y: 4131,
  },
  BestTime: bestTimes.lemansnight,
      MainColor: [0x0055a4, 0xffffff, 0xef4135],
    AvatarColor: 0x000001,
    Angle: 0,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.96,
  TireDegradationPercentage: -110,
  physicsType: CircuitPhysics.WEC_NEWGEN,
  pitGap: 16,
  new_safetycar: true,
  CutDetectSegments: [
    { v0: [-5785, 3682], v1: [-4860, 2488], index: 194, penalty: 5 },
    { v0: [-6165, 3276], v1: [-6198, 4156], index: 196, penalty: 5 },
    { v0: [-6406, 3264], v1: [-6151, 2358], index: 198, penalty: 5 },
    { v0: [-6618, 2728], v1: [-7569, 4160], index: 200, penalty: 5 },
    { v0: [-6805, 2290], v1: [-4860, 2488], index: 202, penalty: 5 },
    { v0: [-7174, 1659], v1: [-7075, 3415], index: 204, penalty: 5 },
    { v0: [-7639, 529], v1: [-7258, 1039], index: 206, penalty: 5 },
    { v0: [-7561, 945], v1: [-7258, 1039], index: 208, penalty: 5 },
    { v0: [-6772, -164], v1: [-7259, 1033], index: 209, penalty: 5 },
    { v0: [-3166, -1256], v1: [-3316, -1836], index: 211, penalty: 5 },
    { v0: [-3328, -1200], v1: [-3184, -1313], index: 213, penalty: 5 },
    { v0: [-3507, -1358], v1: [-5836, 1119], index: 215, penalty: 5 },
    { v0: [-6723, -557], v1: [-3319, -1836], index: 217, penalty: 5 },
    { v0: [-2814, -1581], v1: [-1824, -1010], index: 219, penalty: 5 },
    { v0: [1684, -3419], v1: [362, -3878], index: 221, penalty: 5 },
    { v0: [1725, -3986], v1: [2685, -2832], index: 223, penalty: 5 },
    { v0: [2418, -3863], v1: [2643, -3770], index: 225, penalty: 5 },
    { v0: [2511, -3786], v1: [2688, -4332], index: 227, penalty: 5 },
    { v0: [3687, -3935], v1: [3897, -3321], index: 229, penalty: 5 },
    { v0: [7468, -3813], v1: [5723, -3341], index: 231, penalty: 5 },
    { v0: [4898, 631], v1: [4101, -423], index: 233, penalty: 5 },
    { v0: [4469, 1006], v1: [6570, 1222], index: 235, penalty: 5 },
    { v0: [5073, 1845], v1: [3252, 1632], index: 237, penalty: 5 },
    { v0: [3969, 2286], v1: [4541, 3543], index: 239, penalty: 5 },
    { v0: [2217, 3724], v1: [2213, 2194], index: 241, penalty: 5 },
    { v0: [1614, 3487], v1: [1193, 4161], index: 243, penalty: 5 },
    { v0: [114, 3538], v1: [209, 3766], index: 245, penalty: 5 },
    { v0: [209, 3766], v1: [515, 3808], index: 246, penalty: 5 },
    { v0: [515, 3808], v1: [1449, 2484], index: 247, penalty: 5 },
    { v0: [-352, 3457], v1: [-1134, 4162], index: 249, penalty: 5 },
    { v0: [-970, 3105], v1: [-614, 1849], index: 251, penalty: 5 },
    { v0: [-1322, 3090], v1: [-1894, 4156], index: 253, penalty: 5 },
    { v0: [-2712, 3582], v1: [-1894, 4156], index: 255, penalty: 5 },
    { v0: [-2952, 3652], v1: [-3445, 3637], index: 256, penalty: 5 },
    { v0: [-3270, 3843], v1: [-1894, 4156], index: 258, penalty: 5 },
    { v0: [-3417, 3991], v1: [-3652, 3700], index: 259, penalty: 5 },
  ],
  CrashWallDetector: [
    {
      index: "lemans-straight-4160",
      v0: [-2733, 4160.299669210275],
      v1: [-5656, 4160.299669210275],
      curvatura: 0,
    },
  ],



};

export const LEMANSNIGHT: Circuit = {
  map: lemansnight_raw,
  info: LEMANSNIGHT_INFO,
};

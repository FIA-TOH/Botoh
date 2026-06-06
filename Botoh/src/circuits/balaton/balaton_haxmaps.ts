import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";

const balaton_haxmaps_raw = readFileSync(join(__dirname, "balaton_haxmaps.hbs"), "utf-8");
const balaton_haxmaps_json = JSON.parse(balaton_haxmaps_raw);

const BALATON_HAXMAPS_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -20,
      maxX: 10,
      minY: -280,
      maxY: -20,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -20,
      maxX: -10,
      minY: -280,
      maxY: -20,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: 480,
      maxX: 512,
      minY: 60,
      maxY: 192,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 545,
      maxX: 575,
      minY: 1311,
      maxY: 1434,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Balaton Park Circuit by Liberty from HaxMaps",
  boxLine: {
    minX: -248,
    maxX: 526,
    minY: -787,
    maxY: -335,
  },
  pitlaneStart: {
    minX: 631,
    maxX: 661,
    minY: -413,
    maxY: -219,
  },
  pitlaneEnd: {
    minX: -15,
    maxX: 15,
    minY: -280,
    maxY: -185,
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
    x: balaton_haxmaps_json.redSpawnPoints[balaton_haxmaps_json.redSpawnPoints.length - 1][0],
    y: balaton_haxmaps_json.redSpawnPoints[balaton_haxmaps_json.redSpawnPoints.length - 1][1],
  },
  BestTime: bestTimes.balaton_haxmaps,
  MainColor: [0xd6001d, 0xd6001d, 0xffffff],
  AvatarColor: 0xffffff,
  Angle: 60,
  Limit: 5,
  Votes: 0,
  pitSpeed: 0.97,
  physicsType: CircuitPhysics.CLASSIC,
};

export const BALATON_HAXMAPS: Circuit = {
  map: balaton_haxmaps_raw,
  info: BALATON_HAXMAPS_INFO,
};

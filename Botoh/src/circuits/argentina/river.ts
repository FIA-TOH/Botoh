

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, Direction } from "../Circuit";

const river_raw = readFileSync(join(__dirname, "river.hbs"), "utf-8");
const river_json = JSON.parse(river_raw);




const RIVER_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: -452,
      maxX: -422,
      minY: -59,
      maxY: 439,
    },
    passingDirection: Direction.LEFT,
  },
  sectorOne: {
    bounds: {
      minX: -452,
      maxX: -422,
      minY: -59,
      maxY: 439,
    },
    passingDirection: Direction.LEFT,
  },
  sectorTwo: {
    bounds: {
      minX: -730,
      maxX: -700,
      minY: -806,
      maxY: -689,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorThree: {
    bounds: {
      minX: 1023,
      maxX: 1053,
      minY: -85,
      maxY: 57,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Circuito Antonio V. Liberti by New Era",
  boxLine: {
    minX: -781,
    maxX: -400,
    minY: -72,
    maxY: 191,
  },
  pitlaneStart: {
    minX: -156,
    maxX: -126,
    minY: 157,
    maxY: 255,
  },
  pitlaneEnd: {
    minX: -789,
    maxX: -576,
    minY: 219,
    maxY: 249,
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
    x: river_json.redSpawnPoints[
      river_json.redSpawnPoints.length - 1
    ][0],
    y: river_json.redSpawnPoints[
      river_json.redSpawnPoints.length - 1
    ][1],
  },
  BestTime: bestTimes.river,
  MainColor: [0x6cace4, 0xffffff, 0x6cace4],
  AvatarColor: 0xffc300,
  Angle: 90,
  Limit: 5,
  Votes: 0,
};

export const RIVER: Circuit = {
  map: river_raw,
  info: RIVER_INFO,
};

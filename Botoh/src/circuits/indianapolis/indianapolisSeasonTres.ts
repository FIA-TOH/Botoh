import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import { Circuit, CircuitInfo, CircuitPhysics, Direction } from "../Circuit";

const indianapolisSeasonTres_raw = readFileSync(
  join(__dirname, "indianapolisSeasonTres.hbs"),
  "utf-8"
);
const indianapolisSeasonTres_json = JSON.parse(indianapolisSeasonTres_raw);

const INDIANAPOLISSEASONTRES_INFO: CircuitInfo = {
  finishLine: {
    bounds: {
      minX: 450,
      maxX: 482,
      minY: 69,
      maxY: 444,
    },
    passingDirection: Direction.RIGHT,
  },
  name: "Indianapolis Motor Speedway - By Ximb - 2026",
  sectorOne: {
    bounds: {
      minX: 450,
      maxX: 482,
      minY: 69,
      maxY: 444,
    },
    passingDirection: Direction.RIGHT,
  },
  sectorTwo: {
    bounds: {
      minX: 2625,
      maxX: 2657,
      minY: -4939,
      maxY: -4338,
    },
    passingDirection: Direction.LEFT,
  },
  sectorThree: {
    bounds: {
      minX: -3339,
      maxX: -3307,
      minY: 68,
      maxY: 444,
    },
    passingDirection: Direction.RIGHT,
  },
  boxLine: {
    minX: -3295,
    maxX: -3295,
    minY: -382,
    maxY: -382,
  },
  pitlaneStart: {
    minX: -1776,
    maxX: -1744,
    minY: -144,
    maxY: 93,
  },
  pitlaneEnd: {
    minX: 1446,
    maxX: 1478,
    minY: -168,
    maxY: 90,
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
    x: -3303.438583073945,
    y: 414,
  },
  BestTime: bestTimes.indianapolisSeasonTres,
  MainColor: [0xffffff],
  AvatarColor: 0xbc002d,
  Angle: 90,
  Votes: 0,
  pitSpeed: 0.98,
  physicsType: CircuitPhysics.INDY,
  new_safetycar: true,
  CrashWallDetector: [
    {
      index: "18-21",
      v0: [2754.412325957214, 444],
      v1: [4577.255276695453, -1229.0612287075805],
      curvatura: -87.4314106887699,
    },
    {
      index: "21-23",
      v0: [4577.255276695453, -1229.0612287075805],
      v1: [4542.378845028378, -3258.61260746248],
      curvatura: 0,
    },
    {
      index: "23-24",
      v0: [4542.378845028378, -3258.61260746248],
      v1: [2646.728199761886, -4923.730242394676],
      curvatura: -84,
    },
    {
      index: "24-26",
      v0: [2646.728199761886, -4923.730242394676],
      v1: [-2855.8328728495885, -4913.308771982084],
      curvatura: 0,
    },
    {
      index: "26-28",
      v0: [-2855.8328728495885, -4913.308771982084],
      v1: [-4919.109523152749, -3291.2039384425193],
      curvatura: -75,
    },
    {
      index: "28-30",
      v0: [-4919.109523152749, -3291.2039384425193],
      v1: [-5184.7794707732655, -1376.3512818762633],
      curvatura: 0,
    },
    {
      index: "30-17",
      v0: [-5184.7794707732655, -1376.3512818762633],
      v1: [-3303.5222497270897, 444],
      curvatura: -88,
    },
    {
      index: "78-17",
      v0: [2524.23876953125, 444],
      v1: [-3303.5222497270897, 444],
      curvatura: 0,
    },
    {
      index: "extra-17-18",
      v0: [-3303.5222497270897, 443],
      v1: [2754.412325957214, 443],
      curvatura: 0,
    },
    {
      index: "extra-21-23",
      v0: [4575.255276695453, -1229.0612287075805],
      v1: [4540.378845028378, -3258.61260746248],
      curvatura: 0,
    },
    {
      index: "extra-24-26",
      v0: [2646.728199761886, -4921.730242394676],
      v1: [-2855.8328728495885, -4911.308771982084],
      curvatura: 0,
    },
    {
      index: "extra-28-30",
      v0: [-4917.109523152749, -3291.2039384425193],
      v1: [-5182.7794707732655, -1376.3512818762633],
      curvatura: 0,
    },
  ],
};

export const INDIANAPOLISSEASONTRES: Circuit = {
  map: indianapolisSeasonTres_raw,
  info: INDIANAPOLISSEASONTRES_INFO,
};

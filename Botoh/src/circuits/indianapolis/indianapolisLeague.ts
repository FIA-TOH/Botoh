

import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";

const indianapolisLeague_raw = readFileSync(join(__dirname, "indianapolisLeague.hbs"), "utf-8");
const indianapolisLeague_json = JSON.parse(indianapolisLeague_raw);




const INDIANAPOLISLEAGUE_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 431,
            maxX: 463,
            minY: -144,
            maxY: 460
        },
        passingDirection: Direction.RIGHT
    },
    name: "Indianapolis Motor Speedway - By Ximb",
    sectorOne:{
        bounds: {
            minX: 431,
            maxX: 463,
            minY: -144,
            maxY: 460
        },
        passingDirection: Direction.RIGHT
    },
    sectorTwo:{
        bounds: {
            minX: 2625,
            maxX: 2657,
            minY: -4939,
            maxY: -4338
        },
        passingDirection: Direction.LEFT
    },
    sectorThree:{
        bounds: {
            minX: -3339,
            maxX: -3307,
            minY: 68,
            maxY: 444
        },
        passingDirection: Direction.RIGHT
    },
    boxLine: {
        minX: -1724,
        maxX:453,
        minY: -312,
        maxY: -144
    },
    pitlaneStart: {
        minX: -1776,
        maxX: -1744,
        minY: -144,
        maxY: 93
    },
    pitlaneEnd: {
        minX: 1446,
        maxX: 1478,
        minY: -168,
        maxY: 90
    },
    drsStart: [
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        }
    ],
    drsEnd: [
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        }
    ],
    checkpoints: [],
    lastPlace: {
        x: indianapolisLeague_json.redSpawnPoints[indianapolisLeague_json.redSpawnPoints.length - 1][0],
        y: indianapolisLeague_json.redSpawnPoints[indianapolisLeague_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.indianapolis,
    MainColor: [0xffffff],
    AvatarColor: 0xbc002d,
    Angle: 90,
    Votes: 0,
    pitSpeed: 0.98
}

export const INDIANAPOLISLEAGUE: Circuit = {
    map: indianapolisLeague_raw,
    info: INDIANAPOLISLEAGUE_INFO
}


import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";

const valenciaLeague_raw = readFileSync(join(__dirname, "valenciaLeague.hbs"), "utf-8");
const valenciaLeague_json = JSON.parse(valenciaLeague_raw);





const VALENCIALEAGUE_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -215,
            maxX: 210,
            minY: 68,
            maxY: 100
        },
        passingDirection: Direction.UP
    },
    sectorOne:{
        bounds: {
                minX: -215,
                maxX: 210,
                minY: 68,
                maxY: 100
            },
            passingDirection: Direction.UP
    },
    sectorTwo:{
        bounds: {
            minX: 3580,
            maxX: 3610,
            minY: -359,
            maxY: -208
        },
        passingDirection: Direction.RIGHT
    },
    sectorThree:{
        bounds: {
            minX: -543,
            maxX: -513,
            minY: 1100,
            maxY: 1280
        },
        passingDirection: Direction.LEFT
    },
    name: "Valencia Street Circuit - By Ximb",
    boxLine: {
        minX: 87,
        maxX: 162,
        minY: 104,
        maxY: 688
    },
    pitlaneStart: {
        minX: -6,
        maxX: 163,
        minY: 720,
        maxY: 750
    },
    pitlaneEnd: {
        minX: 6,
        maxX: 146,
        minY: -331,
        maxY: -300
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
        }
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
        x: valenciaLeague_json.redSpawnPoints[valenciaLeague_json.redSpawnPoints.length - 1][0],
        y: valenciaLeague_json.redSpawnPoints[valenciaLeague_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.valenciaLeague,
    MainColor: [0xc60b1e, 0xffc400, 0xc60b1e],
    AvatarColor: 0xffffff,
    Angle: 90,
    Limit: 5,
    Votes: 0,
    pitSpeed: 0.92
}

export const VALENCIALEAGUE: Circuit = {
    map: valenciaLeague_raw,
    info: VALENCIALEAGUE_INFO
}


import { readFileSync } from "fs";
import { join } from "path";

import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";

const mexico_raw = readFileSync(join(__dirname, "mexico.hbs"), "utf-8");
const mexico_json = JSON.parse(mexico_raw);




const MEXICO_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -1693,
            maxX: -1661,
            minY: -277,
            maxY: 144
        },
        passingDirection: Direction.RIGHT
    },
    sectorOne:{
        bounds: {
            minX: -1693,
            maxX: -1661,
            minY: -277,
            maxY: 144
        },
        passingDirection: Direction.RIGHT
    },
    sectorTwo:{
        bounds: {
            minX: 1923,
            maxX: 2205,
            minY: 1832,
            maxY: 1864
        },
        passingDirection: Direction.DOWN
    },
    sectorThree:{
        bounds: {
            minX: -2139,
            maxX: -2107,
            minY: 806,
            maxY: 971
        },
        passingDirection: Direction.LEFT
    },
    name: "Mexico City - Autodromo Hermanos Rodriquez By Ximb",
    boxLine: {
        minX: -2430,
        maxX: -1700,
        minY: 75,
        maxY: 144
    },
    pitlaneStart: {
        minX: -2843,
        maxX: -2811,
        minY: -13,
        maxY: 75
    },
    pitlaneEnd: {
        minX: -894,
        maxX: -862,
        minY: -12,
        maxY: 75
    },
    drsStart: [{
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    }],
    drsEnd: [{
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    }],
    checkpoints: [],
    lastPlace: {
        x: mexico_json.redSpawnPoints[mexico_json.redSpawnPoints.length - 1][0],
        y: mexico_json.redSpawnPoints[mexico_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.mexico,
    MainColor: [0xd6001d, 0xd6001d, 0xffffff],
    AvatarColor: 0xffffff,
    Angle: 60,
    Limit: 5,
    Votes: 0,
    pitSpeed: 0.955
}

export const MEXICO: Circuit = {
    map: mexico_raw,
    info: MEXICO_INFO
}
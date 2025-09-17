import { bestTimes } from "../bestTimes";



import { readFileSync } from "fs";
import { join } from "path";


import {Circuit, CircuitInfo, Direction} from "../Circuit";

const wales_raw = readFileSync(join(__dirname, "wales.hbs"), "utf-8");
const wales_json = JSON.parse(wales_raw);



const WALES_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 16,
            maxX: 220,
            minY: -30,
            maxY: 0
        },
        passingDirection: Direction.UP
    },
    name: "Trac Môn Tŷ Croes",
    boxLine: {
        minX: 213,
        maxX: 333,
        minY: 360,
        maxY: 1080
    },
    pitlaneStart: {
        minX: 141,
        maxX: 171,
        minY: 1100,
        maxY: 1163
    },
    pitlaneEnd: {
        minX: 531,
        maxX: 561,
        minY: -188,
        maxY: -136
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
        }
    ],
    checkpoints: [],
    lastPlace: {
        x: wales_json.redSpawnPoints[wales_json.redSpawnPoints.length - 1][0],
        y: wales_json.redSpawnPoints[wales_json.redSpawnPoints.length - 1][1],
    }
}

export const WALES: Circuit = {
    map: wales_raw,
    info: WALES_INFO
}
import { bestTimes } from "../bestTimes";



import { readFileSync } from "fs";
import { join } from "path";

import {Circuit, CircuitInfo, Direction} from "../Circuit";

const tarnow_raw = readFileSync(join(__dirname, "tarnow.hbs"), "utf-8");
const tarnow_json = JSON.parse(tarnow_raw);





const TARNOW_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -30,
            maxX: 5,
            minY: 17,
            maxY: 167
        },
        passingDirection: Direction.LEFT
    },
    name: "Tarnow Street Circuit by Quest",
    boxLine: {
        minX: -710,
        maxX: 10,
        minY: -395,
        maxY: -365
    },
    pitlaneStart: {
        minX: -785,
        maxX: -745,
        minY: -340,
        maxY: -310
    },
    pitlaneEnd: {
        minX: 645,
        maxX: -675,
        minY: -13,
        maxY: 17
    },
    drsStart: [
        {
            minX: -1619,
            maxX: -1495,
            minY: 1313,
            maxY: 1283,
        }, 
    ],
    drsEnd: [
        {
            minX: -1619,
            maxX: -1495,
            minY: 605,
            maxY: 635,
        },
    ],
    checkpoints: [],
    lastPlace: {
        x: tarnow_json.redSpawnPoints[tarnow_json.redSpawnPoints.length - 1][0],
        y: tarnow_json.redSpawnPoints[tarnow_json.redSpawnPoints.length - 1][1],
    }
}

export const TARNOW: Circuit = {
    map: tarnow_raw,
    info: TARNOW_INFO
}

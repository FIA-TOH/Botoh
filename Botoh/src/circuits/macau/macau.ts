import { bestTimes } from "../bestTimes";



import { readFileSync } from "fs";
import { join } from "path";


import {Circuit, CircuitInfo, Direction} from "../Circuit";

const macau_raw = readFileSync(join(__dirname, "macau.hbs"), "utf-8");
const macau_json = JSON.parse(macau_raw);



const MACAU_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -30,
            maxX: 0,
            minY: -35,
            maxY: 167
        },
        passingDirection: Direction.LEFT
    },
    name: "Guia Macau Circuit ",
    boxLine: {
        minX: 70,
        maxX: 550,
        minY: -155,
        maxY: -35
    },
    pitlaneStart: {
        minX: 582,
        maxX: 619,
        minY: -114,
        maxY: -84
    },
    pitlaneEnd: {
        minX: -620,
        maxX: -568,
        minY: 33,
        maxY: 63
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
        x: macau_json.redSpawnPoints[macau_json.redSpawnPoints.length - 1][0],
        y: macau_json.redSpawnPoints[macau_json.redSpawnPoints.length - 1][1],
    }
}

export const MACAU: Circuit = {
    map: macau_raw,
    info: MACAU_INFO

}
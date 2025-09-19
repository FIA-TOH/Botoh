import { bestTimes } from "../bestTimes";



import { readFileSync } from "fs";
import { join } from "path";


import {Circuit, CircuitInfo, Direction} from "../Circuit";

const jeddah_raw = readFileSync(join(__dirname, "jeddah.hbs"), "utf-8");
const jeddah_json = JSON.parse(jeddah_raw);



const JEDDAH_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 470,
            maxX: 502,
            minY: -160,
            maxY: 201
        },
        passingDirection: Direction.LEFT
    },
    name: "Jeddah Street Circuit - By Ximb",
    boxLine: {
        minX: 470,
        maxX: 1424,
        minY: 100,
        maxY: 201
    },
    pitlaneStart: {
        minX: 1482,
        maxX: 1512,
        minY: 10,
        maxY: 150
    },
    pitlaneEnd: {
        minX: -395,
        maxX: -365,
        minY: 110,
        maxY: 213
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
        x: jeddah_json.redSpawnPoints[jeddah_json.redSpawnPoints.length - 1][0],
        y: jeddah_json.redSpawnPoints[jeddah_json.redSpawnPoints.length - 1][1],
    }
}
export const JEDDAH: Circuit = {
    map: jeddah_raw,
    info: JEDDAH_INFO
}
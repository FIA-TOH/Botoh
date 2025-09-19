import { bestTimes } from "../bestTimes";



import { readFileSync } from "fs";
import { join } from "path";

import {Circuit, CircuitInfo, Direction} from "../Circuit";

const algarve_raw = readFileSync(join(__dirname, "algarve.hbs"), "utf-8");
const algarve_json = JSON.parse(algarve_raw);





const ALGARVE_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 238,
            maxX: 268,
            minY: 47,
            maxY: 256
        },
        passingDirection: Direction.LEFT
    },
    name: "Portimão Circuit",
    boxLine: {
        minX: 300,
        maxX: 900,
        minY: 17,
        maxY: 47
    },
    pitlaneStart: {
        minX: 1012,
        maxX: 1158,
        minY: 75,
        maxY: 105
    },
    pitlaneEnd: {
        minX: -700,
        maxX: -600,
        minY: 75,
        maxY: 105
    },
    drsStart: [
        {
            minX: 1158,
            maxX: 1128,
            minY: 105,
            maxY: 257,
        },
        {
            minX: -716,
            maxX: -746,
            minY: -209,
            maxY: -80,
        }
    ],
    drsEnd: [
        {
            minX: -953,
            maxX: -923,
            minY: 105,
            maxY: 257,
        },
        {
            minX: 78,
            maxX: 108,
            minY: -209,
            maxY: -80,
        }
    ],
    checkpoints: [],
    lastPlace: {
        x: algarve_json.redSpawnPoints[algarve_json.redSpawnPoints.length - 1][0],
        y: algarve_json.redSpawnPoints[algarve_json.redSpawnPoints.length - 1][1],
    }
}

export const ALGARVE: Circuit = {
    map: algarve_raw,
    info: ALGARVE_INFO
}
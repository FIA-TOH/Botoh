import {Circuit, CircuitInfo, Direction} from "../Circuit";
import hungary_json from "./hungary.json";

const HUNGARY_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -26,
            maxX: 4,
            minY: -122,
            maxY: 280
        },
        passingDirection: Direction.LEFT
    },
    name: "Hungaroring - By Ximb",
    boxLine: {
        minX: 0,
        maxX: 1000,
        minY: -122,
        maxY: -36
    },
    pitlaneStart: {
        minX: 1582,
        maxX: 1612,
        minY: -36,
        maxY: 34
    },
    pitlaneEnd: {
        minX: -151,
        maxX: -121,
        minY: -122,
        maxY: 34
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
        x: hungary_json.redSpawnPoints[hungary_json.redSpawnPoints.length - 1][0],
        y: hungary_json.redSpawnPoints[hungary_json.redSpawnPoints.length - 1][1],
    }
}

export const HUNGARY: Circuit = {
    map: JSON.stringify(hungary_json),
    info: HUNGARY_INFO
}
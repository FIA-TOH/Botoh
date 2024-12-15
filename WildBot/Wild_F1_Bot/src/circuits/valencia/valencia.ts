import {Circuit, CircuitInfo, Direction} from "../Circuit";
import valencia_json from "./valencia.json";


const VALENCIA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -167,
            maxX: -17,
            minY: -222,
            maxY: -192
        },
        passingDirection: Direction.UP
    },
    name: "Valencia Street Circuit",
    boxLine: {
        minX: 45,
        maxX: 75,
        minY: -100,
        maxY: 620
    },
    pitlaneStart: {
        minX: -12,
        maxX: 18,
        minY: 717,
        maxY: 753
    },
    pitlaneEnd: {
        minX: 2,
        maxX: 32,
        minY: -339,
        maxY: -258
    },
    drsStart: [
        {
            minX: 653,
            maxX: 623,
            minY: 965,
            maxY: 1206,
        },
        {
            minX: -654,
            maxX: -684,
            minY: 136,
            maxY: 832,
        }
    ],
    drsEnd: [
        {
            minX: -62,
            maxX: -32,
            minY: 965,
            maxY: 1206,
        },
        {
            minX: -1645,
            maxX: -1615,
            minY: 136,
            maxY: 832,
        },
        
    ],
    checkpoints: [],
    lastPlace: {
        x: valencia_json.redSpawnPoints[valencia_json.redSpawnPoints.length - 1][0],
        y: valencia_json.redSpawnPoints[valencia_json.redSpawnPoints.length - 1][1],
    }
}

export const VALENCIA: Circuit = {
    map: JSON.stringify(valencia_json),
    info: VALENCIA_INFO
}
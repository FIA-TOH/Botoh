import {Circuit, CircuitInfo, Direction} from "../Circuit";
import netherlands_json from "./netherlands.json";

const NETHERLANDS_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -55,
            maxX: 167,
            minY: -30,
            maxY: 0
        },
        passingDirection: Direction.UP
    },
    name: "Zandvoort Park Circuit",
    boxLine: {
        minX: -175,
        maxX: -55,
        minY: 280,
        maxY: 880
    },
    pitlaneStart: {
        minX: -13,
        maxX: 17,
        minY: 960,
        maxY: 1060
    },
    pitlaneEnd: {
        minX: -55,
        maxX: -20,
        minY: -25,
        maxY: 5
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
        x: netherlands_json.redSpawnPoints[netherlands_json.redSpawnPoints.length - 1][0],
        y: netherlands_json.redSpawnPoints[netherlands_json.redSpawnPoints.length - 1][1],
    }
}

export const NETHERLANDS: Circuit = {
    map: JSON.stringify(netherlands_json),
    info: NETHERLANDS_INFO
}
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import austria_json from "./austria.json";

const AUSTRIA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -30,
            maxX: 0,
            minY: 45,
            maxY: 256
        },
        passingDirection: Direction.LEFT
    },
    name: "Red Bull Ring - Austria",
    boxLine: {
        minX: 100,
        maxX: 700,
        minY: -75,
        maxY: 45
    },
    pitlaneStart: {
        minX: 761,
        maxX: 791,
        minY: 45,
        maxY: 77
    },
    pitlaneEnd: {
        minX: -1028,
        maxX: -998,
        minY: 45,
        maxY: 77
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
        x: austria_json.redSpawnPoints[austria_json.redSpawnPoints.length - 1][0],
        y: austria_json.redSpawnPoints[austria_json.redSpawnPoints.length - 1][1],
    }
}

export const AUSTRIA: Circuit = {
    map: JSON.stringify(austria_json),
    info: AUSTRIA_INFO
}
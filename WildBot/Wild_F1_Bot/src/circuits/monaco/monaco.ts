import monaco_json from "./monaco.json";
import {Circuit, CircuitInfo, Direction} from "../Circuit";

const MONACO_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 0,
            maxX: 30,
            minY: -200,
            maxY: 200
        },
        passingDirection: Direction.LEFT
    },
    name: "Circuit de Monaco",
    boxLine: {
        minX: 60,
        maxX: 900,
        minY: -140,
        maxY: -20
    },
    pitlaneStart: {
        minX: 960,
        maxX: 990,
        minY: -180,
        maxY: -140
    },
    pitlaneEnd: {
        minX: -508,
        maxX: -478,
        minY: -95,
        maxY: -19
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
        x: monaco_json.redSpawnPoints[monaco_json.redSpawnPoints.length - 1][0],
        y: monaco_json.redSpawnPoints[monaco_json.redSpawnPoints.length - 1][1],
    }
}

export const MONACO: Circuit = {
    map: JSON.stringify(monaco_json),
    info: MONACO_INFO
}
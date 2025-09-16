import jeddah_json from "./jeddah.json";
import {Circuit, CircuitInfo, Direction} from "../Circuit";

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
    map: JSON.stringify(jeddah_json),
    info: JEDDAH_INFO
}
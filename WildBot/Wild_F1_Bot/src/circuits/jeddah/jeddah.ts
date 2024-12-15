import jeddah_json from "./jeddah.json";
import {Circuit, CircuitInfo, Direction} from "../Circuit";

const JEDDAH_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 1300,
            maxX: 1330,
            minY: -535,
            maxY: -290
        },
        passingDirection: Direction.LEFT
    },
    name: "Jeddah Corniche Circuit",
    boxLine: {
        minX: 1340,
        maxX: 1940,
        minY: -290,
        maxY: -180
    },
    pitlaneStart: {
        minX: 2151,
        maxX: 2257,
        minY: -378,
        maxY: -368
    },
    pitlaneEnd: {
        minX: 902,
        maxX: 932,
        minY: -175,
        maxY: -117
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
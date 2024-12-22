import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import interlagos_json from "./interlagos.json";

const INTERLAGOS_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -100,
            maxX: -75,
            minY: -100,
            maxY: 224
        },
        passingDirection: Direction.RIGHT
    },
    name: "Autodromo Interlagos - By Ximb",
    boxLine: {
        minX: -1100,
        maxX: -100,
        minY: -100,
        maxY: -24
    },
    pitlaneStart: {
        minX: -1601,
        maxX: -1571,
        minY: -71,
        maxY: 36
    },
    pitlaneEnd: {
        minX: 438,
        maxX: 468,
        minY: -61,
        maxY: 33
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
        x: interlagos_json.redSpawnPoints[interlagos_json.redSpawnPoints.length - 1][0],
        y: interlagos_json.redSpawnPoints[interlagos_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.interlagos,
    MainColor: [0x10a100, 0xffff00, 0x10a100],
    AvatarColor: 0x00008C,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const INTERLAGOS: Circuit = {
    map: JSON.stringify(interlagos_json),
    info: INTERLAGOS_INFO

}
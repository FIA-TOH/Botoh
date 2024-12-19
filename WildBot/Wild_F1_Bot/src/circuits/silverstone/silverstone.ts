import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import silverstone_json from "./silverstone.json";

const SILVERSTONE_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 1,
            maxX: 33,
            minY: -270,
            maxY: 255
        },
        passingDirection: Direction.RIGHT
    },
    name: "Silverstone Circuit - By Ximb",
    boxLine: {
        minX: -350,
        maxX: 550,
        minY: 180,
        maxY: 255
    },
    pitlaneStart: {
        minX: -616,
        maxX: -415,
        minY: 566,
        maxY: 596
    },
    pitlaneEnd: {
        minX: 736,
        maxX: 766,
        minY: 174,
        maxY: 305
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
        x: silverstone_json.redSpawnPoints[silverstone_json.redSpawnPoints.length - 1][0],
        y: silverstone_json.redSpawnPoints[silverstone_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.silverstone,
    MainColor: [0x023286, 0x023286, 0xff0000],
    AvatarColor: 0xffffff,
    Angle: 60,
    Limit: 5,
    Votes: 0,
}

export const SILVERSTONE: Circuit = {
    map: JSON.stringify(silverstone_json),
    info: SILVERSTONE_INFO
}
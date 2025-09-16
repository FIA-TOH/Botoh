import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import silverstone_json from "./silverstone.json";

const SILVERSTONE_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -1300,
            maxX: -1268,
            minY: -1200,
            maxY: -763
        },
        passingDirection: Direction.RIGHT
    },
    sectorOne:{
        bounds: {
            minX: -1300,
            maxX: -1270,
            minY: -1200,
            maxY: -763
            },
            passingDirection: Direction.RIGHT
    },
    sectorTwo:{
        bounds: {
            minX: 1336,
            maxX: 1663,
            minY: -1059,
            maxY: -1029
        },
        passingDirection: Direction.UP
    },
    sectorThree:{
        bounds: {
            minX: -105,
            maxX: -75,
            minY: 787,
            maxY: 1039
        },
        passingDirection: Direction.LEFT
    },
    name: "Silverstone Circuit - By Ximb",
    boxLine: {
        minX: -2202,
        maxX: -1300,
        minY: -838,
        maxY: -763
    },
    pitlaneStart: {
        minX: -2610,
        maxX: -2377,
        minY: -335,
        maxY: -303
    },
    pitlaneEnd: {
        minX: -1061,
        maxX: -1029,
        minY: -956,
        maxY: -762
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
    pitSpeed: 0.95
}

export const SILVERSTONE: Circuit = {
    map: JSON.stringify(silverstone_json),
    info: SILVERSTONE_INFO
}
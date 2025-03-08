import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import sochiLeague_json from "./sochiLeague.json";

const SOCHI_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 2001,
            maxX: 2033,
            minY: 1528,
            maxY: 1777
        },
        passingDirection: Direction.LEFT
    },
    name: "Sochi Autodrom - By Ximb",
    sectorOne:{
        bounds: {
            minX: 2001,
            maxX: 2033,
            minY: 1528,
            maxY: 1777
        },
        passingDirection: Direction.LEFT
    },
    sectorTwo:{
        bounds: {
            minX: -2446,
            maxX: -2416,
            minY: -674,
            maxY: -407
        },
        passingDirection: Direction.LEFT
    },
    sectorThree:{
        bounds: {
            minX: 867,
            maxX: 1201,
            minY: 407,
            maxY: 437
        },
        passingDirection: Direction.DOWN
    },
    boxLine: {
        minX: 2123,
        maxX: 3124,
        minY: 1454,
        maxY: 1537
    },
    pitlaneStart: {
        minX: 3086,
        maxX: 3223,
        minY: 1025,
        maxY: 1055
    },
    pitlaneEnd: {
        minX: 1328,
        maxX: 1358,
        minY: 1526,
        maxY: 1606
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
        x: sochiLeague_json.redSpawnPoints[sochiLeague_json.redSpawnPoints.length - 1][0],
        y: sochiLeague_json.redSpawnPoints[sochiLeague_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.sochi,
    MainColor: [0xffffff, 0x000080, 0xdd0000],
    AvatarColor: 0xFFE817,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const SOCHILEAGUE: Circuit = {
    map: JSON.stringify(sochiLeague_json),
    info: SOCHI_INFO
}
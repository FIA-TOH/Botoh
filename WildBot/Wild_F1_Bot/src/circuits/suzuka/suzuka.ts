import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import suzuka_json from "./suzuka.json";

const SUZUKA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 202,
            maxX: 232,
            minY: -225,
            maxY: 150
        },
        passingDirection: Direction.RIGHT
    },
    name: "Suzuka International Circuit - By Ximb",
    boxLine: {
        minX: -840,
        maxX: 200,
        minY: 60,
        maxY: 150
    },
    pitlaneStart: {
        minX: -1047,
        maxX: -1017,
        minY: 17,
        maxY: 143
    },
    pitlaneEnd: {
        minX: 380,
        maxX: 410,
        minY: -26,
        maxY: 150
    },
    drsStart: [
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        }
    ],
    drsEnd: [
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        }
    ],
    checkpoints: [],
    lastPlace: {
        x: suzuka_json.redSpawnPoints[suzuka_json.redSpawnPoints.length - 1][0],
        y: suzuka_json.redSpawnPoints[suzuka_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.suzuka,
    MainColor: [0xffffff],
    AvatarColor: 0xbc002d,
    Angle: 90,
    Limit: 5,
    Votes: 0
}

export const SUZUKA: Circuit = {
    map: JSON.stringify(suzuka_json),
    info: SUZUKA_INFO
}
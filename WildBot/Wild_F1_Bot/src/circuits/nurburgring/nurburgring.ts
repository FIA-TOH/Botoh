import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import nurburgring_json from "./nurburgring.json";

const NURBURGRING_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -654,
            maxX: -624,
            minY: -194,
            maxY: 150
        },
        passingDirection: Direction.RIGHT
    },
    name: "Aramco Grosser Preis der Eifel - By Ximb",
    boxLine: {
        minX: -1454,
        maxX: -654,
        minY: 71,
        maxY: 150
    },
    pitlaneStart: {
        minX: -1536,
        maxX: -1506,
        minY: 11,
        maxY: 82
    },
    pitlaneEnd: {
        minX: 300,
        maxX: 330,
        minY: 11,
        maxY: 150
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
        x: nurburgring_json.redSpawnPoints[nurburgring_json.redSpawnPoints.length - 1][0],
        y: nurburgring_json.redSpawnPoints[nurburgring_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.nurburgring,
    MainColor: [0x000000, 0xdd0000, 0xffce00],
    AvatarColor: 0xffffff,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const NURBURGRING: Circuit = {
    map: JSON.stringify(nurburgring_json),
    info: NURBURGRING_INFO

}
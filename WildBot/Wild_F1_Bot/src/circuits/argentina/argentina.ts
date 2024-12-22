import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import argentina_json from "./argentina.json";


const ARGENTINA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: -637,
            maxX: -280,
            minY: 18,
            maxY: 50
        },
        passingDirection: Direction.UP
    },
    name: "Autódromo Oscar Alfredo Gálvez - By Ximb",
    boxLine: {
        minX: -368,
        maxX: -280,
        minY: 48,
        maxY: 1148
    },
    pitlaneStart: {
        minX: -454,
        maxX: -342,
        minY: 1850,
        maxY: 1880
    },
    pitlaneEnd: {
        minX: -454,
        maxX: -366,
        minY: -190,
        maxY: -160
    },
    drsStart: [
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        },
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
        },
        {
            minX: 0,
            maxX: 0,
            minY: 0,
            maxY: 0,
        },
        
    ],
    checkpoints: [],
    lastPlace: {
        x: argentina_json.redSpawnPoints[argentina_json.redSpawnPoints.length - 1][0],
        y: argentina_json.redSpawnPoints[argentina_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.argentina,
    MainColor: [0x6CACE4, 0xffffff, 0x6CACE4],
    AvatarColor: 0xFFB81C,
    Angle: 90,
    Limit: 5,
    Votes: 0,
}

export const ARGENTINA: Circuit = {
    map: JSON.stringify(argentina_json),
    info: ARGENTINA_INFO
}
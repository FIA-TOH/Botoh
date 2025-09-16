import { bestTimes } from "../bestTimes";
import {Circuit, CircuitInfo, Direction} from "../Circuit";
import laguna_seca_json from "./laguna_seca.json";

const LAGUNA_SECA_INFO: CircuitInfo = {
    finishLine: {
        bounds: {
            minX: 100,
            maxX: 132,
            minY: 1675,
            maxY: 2080
        },
        passingDirection: Direction.RIGHT
    },
    sectorOne:{
        bounds: {
            minX: 100,
            maxX: 132,
            minY: 1675,
            maxY: 2080
        },
        passingDirection: Direction.RIGHT
    },
    sectorTwo:{
        bounds: {
            minX: 1605,
            maxX: 1632,
            minY: -425,
            maxY: -218
        },
        passingDirection: Direction.RIGHT
    },
    sectorThree:{
        bounds: {
            minX: -1446,
            maxX: -1414,
            minY: -615,
            maxY: -319
        },
        passingDirection: Direction.LEFT
    },
    name: "Laguna Seca by Rodri",
    boxLine: {
        minX: -900,
        maxX: 100,
        minY: 1724,
        maxY: 1790
    },
    pitlaneStart: {
        minX: -1172,
        maxX: -1140,
        minY: 1777,
        maxY: 1870
    },
    pitlaneEnd: {
        minX: 755,
        maxX: 787,
        minY: 1660,
        maxY: 1780
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
        x: laguna_seca_json.redSpawnPoints[laguna_seca_json.redSpawnPoints.length - 1][0],
        y: laguna_seca_json.redSpawnPoints[laguna_seca_json.redSpawnPoints.length - 1][1],
    },
    BestTime: bestTimes.laguna_seca,
    MainColor: [0xd6001d, 0xd6001d, 0xffffff],
    AvatarColor: 0xffffff,
    Angle: 60,
    Limit: 5,
    Votes: 0,
    pitSpeed: 0.955
}

export const LAGUNA_SECA: Circuit = {
    map: JSON.stringify(laguna_seca_json),
    info: LAGUNA_SECA_INFO
}
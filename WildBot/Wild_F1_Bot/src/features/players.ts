import {DEFAULT_LANGUAGE} from "./language";
import {TIRE_STARTING_SPEED, Tires} from "./tires";
import {playerList} from "./playerList";
import { handleAvatar } from "./handleAvatar";
import { gameMode, GameMode } from "./qualiMode";



export function createPlayerInfo(ip?: string) {
    return {
        ip: ip || "Not Available",
        totalTime: 0,
        currentLap: 0,
        lapChanged: false,
        lapTime: 0,
        speedEnabled: false,
        isInTheRoom: true,
        inPitlane: false,
        boxAlert: false,
        tires: Tires.SOFT,
        wear: 0,
        lapsOnCurrentTire: -1,
        showTires: true,
        pits: {
            pitsNumber: 0,
            pit: [],
            pitsAttemp: 0,
        },
        language: DEFAULT_LANGUAGE,
        bestTime: Number.MAX_VALUE,
        gripCounter: 0,
        maxSpeed: TIRE_STARTING_SPEED[Tires.SOFT],
        drs: false,
        lastCheckTime: 0,
        alertSent: {},
        slipstreamEndTime: undefined,
        kers: 100,
        penaltyCounter: 0,
        afk: false,
        everyoneLaps: false,
        voted: false,
        currentSector: 3,
        sectorChanged: false,
        sectorTime: [],
        sectorTimeCounter: 0,

    }

}

export function resetPlayers(room: RoomObject) {
    room.getPlayerList().forEach(p => {
        resetPlayer(p, room, p.id)
    })
}

export function resetPlayer(player: PlayerObject, room: RoomObject, id: number, startingRace?: boolean) {
    if (playerList[id] === undefined) {
        playerList[id] = createPlayerInfo()
    }
    if(startingRace){
        playerList[id].bestTime = Number.MAX_VALUE
    }
    if(gameMode !== GameMode.TRAINING){
    playerList[id].tires = Tires.SOFT
    }
    playerList[id].totalTime = 0
    playerList[id].currentLap = 0
    playerList[id].lapChanged = false
    playerList[id].lapTime = 0
    playerList[id].isInTheRoom = true
    playerList[id].inPitlane = false
    playerList[id].boxAlert = false
    playerList[id].showTires = true,
    playerList[id].wear = 0
    playerList[id].lapsOnCurrentTire = -1
    playerList[id].pits = {
        pitsNumber: 0,
        pit: [],
        pitsAttemp: 0,
    }
    playerList[id].gripCounter = 0
    playerList[id].maxSpeed = TIRE_STARTING_SPEED[Tires.SOFT]
    playerList[id].drs = false
    playerList[id].lastCheckTime = 0,
    playerList[id].alertSent = {}
    playerList[id].slipstreamEndTime = undefined,
    playerList[id].kers = 100,
    playerList[id].penaltyCounter = 0,
    playerList[id].voted = false,
    playerList[id].currentSector = 3;
    playerList[id].sectorChanged = false
    playerList[id].sectorTime = []
    playerList[id].sectorTimeCounter = 0

    handleAvatar("ChangeTyre", player, room)

}


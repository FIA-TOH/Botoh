import {sendErrorMessage, sendSuccessMessage} from "./chat";
import {MESSAGES} from "./messages";
import {Circuit} from "../circuits/Circuit";

import {MELBOURNE} from "../circuits/melbourne/melbourne";
import {BAKU} from "../circuits/baku/baku";
import {SPA} from "../circuits/spa/spa";
import {IMOLA} from "../circuits/imola/imola";
import {NURBURGRING} from "../circuits/nurburgring/nurburgring";
import {SHANGHAI} from "../circuits/shanghai/shanghai";
import {AUSTIN} from "../circuits/austin/austin";
import {MONZA} from "../circuits/monza/monza";
import {CANADA} from "../circuits/canada/canada";
import {SEPANG} from "../circuits/sepang/sepang";

// import {DAYTONA} from "../circuits/daytona/daytona";
import {BAHRAIN} from "../circuits/bahrain/bahrain";
// import {BARCELONA} from "../circuits/barcelona/barcelona";
// import {JEDDAH} from "../circuits/jeddah/jeddah";
// import {MONACO} from "../circuits/monaco/monaco";
// import {MACAU} from "../circuits/macau/macau";
// import {SUZUKA} from "../circuits/suzuka/suzuka";
// import {WALES} from "../circuits/wales/wales";
// import {AUSTRIA} from "../circuits/austria/austria";
// import {NETHERLANDS} from "../circuits/netherlands/netherlands";
// import {INTERLAGOS} from "../circuits/interlagos/interlagos";
// import {SILVERSTONE} from "../circuits/silverstone/silverstone";
// import {ABU_DHABI} from "../circuits/abu_dhabi/abu_dhabi";
// import {ALGARVE} from "../circuits/algarve/algarve";
// import {HUNGARY} from "../circuits/hungary/hungary";
// import {TARNOW} from "../circuits/tarnow/tarnow";
// import {VALENCIA} from "../circuits/valencia/valencia";
export const CIRCUITS: Circuit[] = [
    MELBOURNE, BAKU, SPA, IMOLA, NURBURGRING, SHANGHAI, AUSTIN, MONZA, CANADA, SEPANG, BAHRAIN
]


export let currentMapIndex = 0

function handleMapError(room: RoomObject) {
    const admins = room.getPlayerList().filter(p => p.admin)
    if (admins.length >= 1) {
        admins.forEach(p =>
            sendErrorMessage(room, MESSAGES.CHANGE_MAP_FAILURE(), p.id)
        )
        return
    }
    sendErrorMessage(room, MESSAGES.CHANGE_MAP_FAILURE())
}

export function handleChangeMap(index: number, room: RoomObject) {
    if (index < 0 || index >= CIRCUITS.length) {
        handleMapError(room)
        return
    }

    try {
        currentMapIndex = index
        room.setCustomStadium(CIRCUITS[currentMapIndex].map)
        sendSuccessMessage(room, MESSAGES.CHANGE_MAP_SUCCESS(CIRCUITS[currentMapIndex].info.name))
    } catch {
        handleMapError(room)
    }
}
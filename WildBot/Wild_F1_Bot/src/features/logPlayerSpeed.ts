import {getRunningPlayers, vectorSpeed} from "./utils";
import {playerList} from "./playerList";
import { handleAvatar } from "./handleAvatar";

export function logPlayerSpeed(playersAndDiscs: { p: PlayerObject, disc: DiscPropertiesObject }[], room: RoomObject) {
    const players = getRunningPlayers(playersAndDiscs).filter(pad => playerList[pad.p.id].speedEnabled)

    players.forEach(pad => {
        const speed = vectorSpeed(pad.disc.xspeed, pad.disc.yspeed)
        handleAvatar("Speed", pad.p, room, speed.toString())
    })
}
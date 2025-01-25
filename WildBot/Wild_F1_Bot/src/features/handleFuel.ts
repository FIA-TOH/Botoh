import { handleAvatar } from "./handleAvatar";
import { TIRE_AVATAR } from "./handleSpeed";
import { playerList } from "./playerList";
import { getRunningPlayers } from "./utils";

export function updateErs(playersAndDiscs: { p: PlayerObject, disc: DiscPropertiesObject }[], room: RoomObject) {  
    const players = getRunningPlayers(playersAndDiscs);

    players.forEach(pad => {
        const p = pad.p;
        const properties = pad.disc;
        const playerInfo = playerList[p.id];

        if (room.getScores()?.time > 0) {            
            if (properties.damping === 0.986) {
                handleAvatar("Ers", p, room)
            }
            else {
                if(playerInfo.kers < 100){
                    playerInfo.kers += 100/(2*60*60)
                    if(playerInfo.kers > 100) playerInfo.kers = 100;
                }
            }
        } 
    });
}
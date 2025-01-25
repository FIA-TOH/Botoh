import { updatePositionList } from "./handleLapChange";
import { CIRCUITS, currentMapIndex } from "./maps";
import { playerList } from "./playerList";
import { getRunningPlayers, inHitbox } from "./utils";


function serialize(number: number) {
    return parseFloat(number.toFixed(3))
}

function ifInSectorOneChangeZone(player: { p: PlayerObject, disc: DiscPropertiesObject }, room: RoomObject) {
    const scores = room.getScores();
    const circuit = CIRCUITS[currentMapIndex];

    if (scores && circuit?.info?.sectorOne?.bounds) {
        return scores.time > 0 && inHitbox(player, circuit.info.sectorOne.bounds);
    }
    
    
}

function ifInSectorTwoChangeZone(player: { p: PlayerObject, disc: DiscPropertiesObject }, room: RoomObject) {
    const scores = room.getScores();
    const circuit = CIRCUITS[currentMapIndex];

    if (scores && circuit?.info?.sectorTwo?.bounds) {
        return scores.time > 0 && inHitbox(player, circuit.info.sectorTwo.bounds);
    }
}

function ifInSectorThreeChangeZone(player: { p: PlayerObject, disc: DiscPropertiesObject }, room: RoomObject) {
    const scores = room.getScores();
    const circuit = CIRCUITS[currentMapIndex];

    if (scores && circuit?.info?.sectorThree?.bounds) {
        return scores.time > 0 && inHitbox(player, circuit.info.sectorThree.bounds);
    }
}


export function checkPlayerSector(playersAndDiscs: { p: PlayerObject, disc: DiscPropertiesObject }[], room: RoomObject){
    const players = getRunningPlayers(playersAndDiscs)

    players.forEach(pad=>{
        const p = pad.p

        if((!ifInSectorOneChangeZone(pad, room) || !ifInSectorTwoChangeZone(pad, room) || !ifInSectorThreeChangeZone(pad, room))&& playerList[p.id].lapChanged){
            playerList[p.id].sectorChanged = false   
        }

        if(!ifInSectorOneChangeZone(pad, room) && !ifInSectorTwoChangeZone(pad, room) && !ifInSectorThreeChangeZone(pad, room)){
            return;
            
        }

        if(playerList[p.id].lapChanged){
            return;
        }

        if (
            (ifInSectorOneChangeZone(pad, room) && playerList[p.id].currentSector !== 3) || 
            (ifInSectorTwoChangeZone(pad, room) && playerList[p.id].currentSector !== 1) || 
            (ifInSectorThreeChangeZone(pad, room) && playerList[p.id].currentSector !== 2)
        ) {
            return;
        }
        

        if (ifInSectorOneChangeZone(pad, room)) {
            playerList[p.id].sectorTime[2] = serialize(playerList[p.id].sectorTimeCounter);
            playerList[p.id].sectorTimeCounter = 0;
        } else if (ifInSectorTwoChangeZone(pad, room)) {
            updatePositionList(players, room);
            playerList[p.id].currentSector = 2;
            playerList[p.id].sectorTime[0] = serialize(playerList[p.id].sectorTimeCounter);
            room.sendAnnouncement(`Sector 1: ${playerList[p.id].sectorTime[0]}s`, p.id, 0x0000FF );
            playerList[p.id].sectorTimeCounter = 0;
            updatePositionList(players, room);
        } else if (ifInSectorThreeChangeZone(pad, room)) {
            updatePositionList(players, room);
            playerList[p.id].currentSector = 3;
            playerList[p.id].sectorTime[1] = serialize(playerList[p.id].sectorTimeCounter);
            room.sendAnnouncement(`Sector 2: ${playerList[p.id].sectorTime[1]}s`, p.id, 0x0000FF);
            playerList[p.id].sectorTimeCounter = 0;
            updatePositionList(players, room);
        }
    })

}
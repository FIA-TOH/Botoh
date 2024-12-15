import { tyresActivated } from "./handleCommands";
import { TIRE_AVATAR } from "./handleSpeed";
import { playerList } from "./playerList";

export interface Situacions {
    ChangeTyre: string;
    Ers: string;
    Speed: string;
    Rain: string;
    Flag: string;
}

export const situacions: Situacions = {
    ChangeTyre: "ChangeTyre",
    Ers: "Ers",
    Speed: "Speed",
    Rain: "Rain",
    Flag: "Flag"
};

export let currentSituacion:string = "Null" ;

export function handleAvatar(
    situacion: string,
    player: PlayerObject,
    room: RoomObject,
    arg?: string,
    emoji?: string[],
    durations?: number[]
): void {

    const p = playerList[player.id];
    if (!p) {
        console.log("Erro ao mudar o avatar");
        return;
    }
    

    const tireType = p.tires;
    if(situacion === situacions.Rain){
        if(currentSituacion !== situacions.Rain && durations && emoji){
            let currentEmojiIndex = 0;
            const intervalId = setInterval(() => {
                room.setPlayerAvatar(player.id, emoji[currentEmojiIndex]);
                currentEmojiIndex = (currentEmojiIndex + 1) % emoji.length;
            }, durations[currentEmojiIndex]);

            setTimeout(() => {
                clearInterval(intervalId);
                currentSituacion = "null"; 
                if (tireType && TIRE_AVATAR[tireType] && p.showTires && tyresActivated) {
                    room.setPlayerAvatar(player.id, TIRE_AVATAR[tireType]);
                } else {
                    room.setPlayerAvatar(player.id, "🏎️");
                }
            }, durations.reduce((a, b) => a + b, 0));
        }
    } else
    if (situacion === situacions.Flag && currentSituacion !== situacions.Rain) {
        if (currentSituacion !== situacions.Flag && durations?.length === 1 && emoji?.length === 1) {
            const [currentEmoji] = emoji;
            const [currentDuration] = durations;
                room.setPlayerAvatar(player.id, currentEmoji);
            
    
            setTimeout(() => {
    
                if (tireType && TIRE_AVATAR[tireType] && p.showTires && tyresActivated) {
                    room.setPlayerAvatar(player.id, TIRE_AVATAR[tireType]);
                } else {
                    room.setPlayerAvatar(player.id, "🏎️");
                }
            }, currentDuration);
        }
    }
    
     else
    if(situacion === situacions.Speed && arg && currentSituacion !== situacions.Rain && currentSituacion !== situacions.Flag){
        room.setPlayerAvatar(player.id, arg)
    } else
    if(situacion === situacions.Ers && currentSituacion !== situacions.Rain && currentSituacion !== situacions.Flag){
        if (p.kers > 0) {
            p.kers -= 100 / 7 / 60;
            if (p.kers < 0) p.kers = 0;
        }
        if(!p.speedEnabled){
            room.setPlayerAvatar(player.id, Math.floor(p.kers).toString());
            setTimeout(() => {
                const tireType = playerList[player.id]?.tires;
                if (tireType && TIRE_AVATAR[tireType] && playerList[player.id].showTires && tyresActivated) {
                    room.setPlayerAvatar(player.id, TIRE_AVATAR[tireType]);
                } else {
                    room.setPlayerAvatar(player.id, "🏎️");
                }
            }, 6000);
        }
    } else
    if (situacion === situacions.ChangeTyre && currentSituacion !== situacions.Rain && currentSituacion !== situacions.Flag) {
        if (tireType && TIRE_AVATAR[tireType] && p.showTires && tyresActivated) {
            room.setPlayerAvatar(player.id, TIRE_AVATAR[tireType]);
        }
    } else if(currentSituacion == situacions.Rain ||currentSituacion !== situacions.Flag){
        return;
    } else{
        room.setPlayerAvatar(player.id, "🏎️");
    }
}

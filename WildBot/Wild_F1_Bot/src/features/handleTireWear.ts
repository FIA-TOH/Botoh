import { sendAlertMessage, sendChatMessage, sendMessage } from "./chat";
import { MESSAGES } from "./messages";
import { playerList } from "./playerList";
import { Tires, TYRE_DURABILITY } from "./tires";
import {laps} from "../features/laps";
import { changeTires } from "./handleSpeed";
import { tyresActivated } from "./handleCommands";
import { qualiMode } from "./qualiMode";

export default function HandleTireWear(player: PlayerObject, room: RoomObject) {
    const p = playerList[player.id];

    if (!tyresActivated || qualiMode) {
        p.wear = 20;
        return;
    }

    const totalDurability = TYRE_DURABILITY(laps)[p.tires as Tires];
    const currentTime = room.getScores().time;

    if (!p.lastCheckTime) p.lastCheckTime = currentTime;

    const timeElapsed = currentTime - p.lastCheckTime;
    p.lastCheckTime = currentTime;

    const wearIncrementPerSecond = 100 / totalDurability;
    p.wear = Math.min(100, p.wear + wearIncrementPerSecond * timeElapsed);

    const remainingPercentage = 100 - p.wear;

    const alerts = [
        { threshold: 90, message: MESSAGES.WEAR_ON_CURRENT_TIRE(90), key: 90 },
        { threshold: 75, message: MESSAGES.WEAR_ON_CURRENT_TIRE(75), key: 75 },
        { threshold: 60, message: MESSAGES.WEAR_ON_CURRENT_TIRE(60), key: 60 },
        { threshold: 40, message: MESSAGES.WEAR_ON_CURRENT_TIRE(40), key: 40 },
        { threshold: 25, message: MESSAGES.WEAR_ON_CURRENT_TIRE(25), key: 25 },
        { threshold: 10, message: MESSAGES.WEAR_ON_CURRENT_TIRE(10), key: 10 },
        { threshold: 5, message: MESSAGES.WEAR_ON_CURRENT_TIRE(5), key: 5 },
        { threshold: 0, message: MESSAGES.WEAR_ON_CURRENT_TIRE(0), key: 0 },
    ];

    if (!p.alertSent) p.alertSent = {};

    if (remainingPercentage === 0 && p.tires != Tires.FLAT){
        changeTires({p: player, disc: room.getPlayerDiscProperties(player.id)}, Tires.FLAT, room);
    }

    if (remainingPercentage === 100) {
        p.alertSent = {}; 
    }

    if (remainingPercentage === 0 && !p.alertSent[0]) {
        sendAlertMessage(room, MESSAGES.WEAR_ON_CURRENT_TIRE(0), player.id);
        p.alertSent[0] = true;
        return;  
    }
    
    for (let alert of alerts) {
        if (remainingPercentage <= alert.threshold && !p.alertSent[alert.key]) {
            sendAlertMessage(room, alert.message, player.id);
            p.alertSent[alert.key] = true;
            break;  
        }
    }
}

export let vsc = false;
export let vscStartTime: number | undefined;
export let vscDuration: number | undefined;
export let vscAutoDeployed = false;
export let vscExtended = false;
export let vscTriggeredByPlayer: number | undefined;
import { isPlayerMovingAtSpeed } from "../afk/afk";
import { Teams } from "../changeGameState/teams";

export function changeVSC() {
  vsc = !vsc;
}

export function deployVSCAutomatically(room: any, playerId?: number) {
  if (vsc) return;
  
  vscDuration = 10 + Math.random() * 5;
  vscAutoDeployed = true;
  vscTriggeredByPlayer = playerId;
  
  const scores = room.getScores();
  if (scores) {
    vscStartTime = scores.time;
  }
  
  changeVSC();
  
  const { sendYellowMessage } = require("../chat/chat");
  const { MESSAGES } = require("../chat/messages");
  sendYellowMessage(room, MESSAGES.VSC_DEPLOYED());
}

export function checkVSCDuration(room: any) {
  if (!vsc || !vscAutoDeployed || vscStartTime === undefined || vscDuration === undefined) {
    return;
  }
  
  const scores = room.getScores();
  if (!scores) return;
  
  const elapsedTime = scores.time - vscStartTime;
  
  if (elapsedTime >= vscDuration) {
    if (vscTriggeredByPlayer !== undefined) {
      if (!isPlayerMovingAtSpeed(vscTriggeredByPlayer, room)) {
        room.setPlayerTeam(vscTriggeredByPlayer, Teams.SPECTATORS);
      }
    }
    
    changeVSC();
    
    const { sendGreenMessage } = require("../chat/chat");
    const { MESSAGES } = require("../chat/messages");
    sendGreenMessage(room, MESSAGES.GREEN_FLAG());
    sendGreenMessage(room, MESSAGES.GREEN_FLAG_TWO());
    
    vscAutoDeployed = false;
    vscStartTime = undefined;
    vscDuration = undefined;
    vscExtended = false;
    vscTriggeredByPlayer = undefined;
  }
}

export function extendVSCDuration() {
  if (!vsc || vscExtended) return;
  
  vscExtended = true;
  vscDuration = (vscDuration || 0) + 20;
}

export function resetVSCState() {
  vsc = false;
  vscAutoDeployed = false;
  vscStartTime = undefined;
  vscDuration = undefined;
  vscExtended = false;
  vscTriggeredByPlayer = undefined;
}

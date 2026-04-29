export let vsc = false;
export let vscStartTime: number | undefined;
export let vscDuration: number | undefined;
export let vscAutoDeployed = false;

export function changeVSC() {
  vsc = !vsc;
}

export function deployVSCAutomatically(room: any) {
  if (vsc) return;
  
  vscDuration = 8 + Math.random() * 8; // 8-16 seconds
  vscAutoDeployed = true;
  
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
    changeVSC();
    
    const { sendGreenMessage } = require("../chat/chat");
    const { MESSAGES } = require("../chat/messages");
    sendGreenMessage(room, MESSAGES.GREEN_FLAG());
    sendGreenMessage(room, MESSAGES.GREEN_FLAG_TWO());
    
    vscAutoDeployed = false;
    vscStartTime = undefined;
    vscDuration = undefined;
  }
}

export function resetVSCState() {
  vsc = false;
  vscAutoDeployed = false;
  vscStartTime = undefined;
  vscDuration = undefined;
}

export let vsc = false;
export let vscStartTime: number | undefined;
export let vscDuration: number | undefined;
export let vscAutoDeployed = false;

export function changeVSC() {
  vsc = !vsc;
}

// Deploy VSC automatically with random duration (8-16 seconds)
export function deployVSCAutomatically(room: any) {
  if (vsc) return; // Already active
  
  // Set random duration between 8-16 seconds
  vscDuration = 8 + Math.random() * 8; // 8-16 seconds
  vscAutoDeployed = true;
  
  // Get current game time
  const scores = room.getScores();
  if (scores) {
    vscStartTime = scores.time;
  }
  
  // Activate VSC
  changeVSC();
  
  // Send VSC deployment message
  const { sendYellowMessage } = require("../chat/chat");
  const { MESSAGES } = require("../chat/messages");
  sendYellowMessage(room, MESSAGES.VSC_DEPLOYED());
}

// Check if VSC should be deactivated and green flag deployed
export function checkVSCDuration(room: any) {
  if (!vsc || !vscAutoDeployed || vscStartTime === undefined || vscDuration === undefined) {
    return;
  }
  
  const scores = room.getScores();
  if (!scores) return;
  
  const elapsedTime = scores.time - vscStartTime;
  
  // Check if VSC duration has passed
  if (elapsedTime >= vscDuration) {
    // Deactivate VSC
    changeVSC();
    
    // Send green flag message
    const { sendGreenMessage } = require("../chat/chat");
    const { MESSAGES } = require("../chat/messages");
    sendGreenMessage(room, MESSAGES.GREEN_FLAG());
    sendGreenMessage(room, MESSAGES.GREEN_FLAG_TWO());
    
    // Reset auto-deployment state
    vscAutoDeployed = false;
    vscStartTime = undefined;
    vscDuration = undefined;
  }
}

// Reset VSC state (call when game stops)
export function resetVSCState() {
  vsc = false;
  vscAutoDeployed = false;
  vscStartTime = undefined;
  vscDuration = undefined;
}

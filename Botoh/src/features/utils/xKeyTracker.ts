import { playerList, XKeyState } from "../changePlayerState/playerList";

export function initializeXKeyState(playerId: number): void {
  if (!playerList[playerId]) {
    playerList[playerId] = {} as any;
  }
  
  playerList[playerId].xKeyState = {
    isPressed: false,
    pressTimes: [],
    releaseTimes: [],
    lastCheckTime: 0
  };
}

export function cleanupXKeyState(playerId: number): void {
  if (playerList[playerId]) {
    delete playerList[playerId].xKeyState;
  }
}

function getXKeyState(playerId: number): XKeyState | undefined {
  return playerList[playerId]?.xKeyState;
}

export function checkXKeyMultiplePress(
  playerId: number, 
  isCurrentlyPressed: boolean, 
  currentTime: number,
  requiredPresses: number = 2
): boolean {
  let state = getXKeyState(playerId);
  
  if (!state) {
    initializeXKeyState(playerId);
    state = getXKeyState(playerId);
  }
  
  if (!state) return false;
  

  if (currentTime - state.lastCheckTime > 2) {
    initializeXKeyState(playerId);
    state = getXKeyState(playerId);
    if (!state) return false;
    state.lastCheckTime = currentTime;
    return false;
  }

  state.lastCheckTime = currentTime;

  if (state.isPressed === isCurrentlyPressed) {
    return false;
  }

  state.isPressed = isCurrentlyPressed;


  if (isCurrentlyPressed) {
    state.pressTimes.push(currentTime);
    
    if (state.pressTimes.length > requiredPresses + 2) {
      state.pressTimes = state.pressTimes.slice(-requiredPresses - 1);
    }
    
    if (state.pressTimes.length >= requiredPresses) {
      const firstPressTime = state.pressTimes[state.pressTimes.length - requiredPresses];
      const lastPressTime = state.pressTimes[state.pressTimes.length - 1];
      
      const totalTime = lastPressTime - firstPressTime;
      const validSequence = totalTime < 1.5;
      
      if (validSequence) {
        initializeXKeyState(playerId);
        const newState = getXKeyState(playerId);
        if (newState) {
          newState.lastCheckTime = currentTime;
        }
        
        return true;
      }
    }
  }

  return false;
}

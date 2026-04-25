import { handleAvatar, Situacions } from "../../changePlayerState/handleAvatar";
import { playerList } from "../../changePlayerState/playerList";
import { Tires } from "../tires";
import { isXKeyPressed } from "../../utils/dampingValues";
import { generatePitResultFromReaction, PitResult } from "../pitStopFunctions";

export let isPitNewEnabled = false;

export function isPitNewSystemEnabled(): boolean {
  return isPitNewEnabled;
}

export function enableNewPitSystem(enabled: boolean) {
  isPitNewEnabled = enabled;
}

export function initializeNewPitState(playerId: number): void {
  const playerInfo = playerList[playerId];
  if (playerInfo && !playerInfo.newPitState) {
    playerInfo.newPitState = {
      isWaitingForPit: false,
      pKeyPressed: false,
      isPitNewEnabled: false,
    };
  }
}

export function startNewPitSequence(playerId: number, room: RoomObject, selectedTires?: Tires): void {
  if (!isPitNewEnabled) return;
  
  initializeNewPitState(playerId);
  
  const playerInfo = playerList[playerId];
  
  if (!playerInfo || !playerInfo.newPitState) return;
  
  playerInfo.newPitState.selectedTires = selectedTires;
  
  const delaySeconds = (Math.random() * 1.8 + 0.2);
  
  const scores = room.getScores();
  const currentTime = scores?.time || 0;
  
  playerInfo.newPitState.isWaitingForPit = true;
  playerInfo.newPitState.pitStartTime = currentTime;
  playerInfo.newPitState.pitReadyTime = currentTime + delaySeconds;
  playerInfo.newPitState.isPitNewEnabled = true;
}

export function handlePitKeyPress(playerId: number, properties: DiscPropertiesObject, room: RoomObject): { shouldStart: boolean; selectedTires?: Tires } {
  const playerInfo = playerList[playerId];
  if (!playerInfo?.newPitState || !playerInfo.newPitState.isWaitingForPit || !playerInfo.newPitState.isPitNewEnabled) {
    return { shouldStart: false };
  }
  
  if (isXKeyPressed(properties.damping)) {
    
    if (!playerInfo.newPitState.pitEmojiShowTime) {
      
      const penaltyPitResult: PitResult = {
        totalTime: 7.0,
        errorType: "light",
        tyres: [Math.floor(Math.random() * 4)],
        perTyreTimes: [1.4, 1.8, 1.7, 2.1]
      };
      
      playerList[playerId].pitFailures = penaltyPitResult;
      playerList[playerId].pitCountdown = 7.0;
      
      playerInfo.newPitState.pKeyPressed = true;
      playerInfo.newPitState.isWaitingForPit = false;
      
      handleAvatar(Situacions.None, { id: playerId } as PlayerObject, room);
      
      return { shouldStart: true, selectedTires: playerInfo.newPitState.selectedTires };
    }
    
    const reactionTime = room.getScores()?.time ? room.getScores().time - playerInfo.newPitState.pitEmojiShowTime : 0;
    playerInfo.newPitState.reactionTime = reactionTime;
    
    const pitResult = generatePitResultFromReaction(playerId);
    playerList[playerId].pitFailures = pitResult;
    
    playerInfo.newPitState.pKeyPressed = true;
    playerInfo.newPitState.isWaitingForPit = false;

    handleAvatar(Situacions.None, { id: playerId } as PlayerObject, room);
    
    return { shouldStart: true, selectedTires: playerInfo.newPitState.selectedTires };
  }
  
  return { shouldStart: false };
}

export function resetPitState(playerId: number): void {
  const playerInfo = playerList[playerId];
  if (playerInfo?.newPitState) {
    playerInfo.newPitState = {
      isWaitingForPit: false,
      pKeyPressed: false,
      isPitNewEnabled: playerInfo.newPitState.isPitNewEnabled,
    };
  }
}

export function isPlayerInNewPitMode(playerId: number): boolean {
  const playerInfo = playerList[playerId];
  return playerInfo?.newPitState?.isPitNewEnabled === true;
}

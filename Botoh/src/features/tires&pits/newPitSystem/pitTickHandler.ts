import { handlePitKeyPress } from "./newPitManager";
import { playerList } from "../../changePlayerState/playerList";
import { isPitNewSystemEnabled } from "./newPitManager";
import { handlePitStop } from "../handlePitStop";
import { handleAvatar, Situacions } from "../../changePlayerState/handleAvatar";
import { PitResult } from "../pitStopFunctions";

export function updateNewPitSystemForPlayer(
  p: PlayerObject,
  properties: DiscPropertiesObject,
  room: RoomObject,
  currentTime: number
) {
  if (!isPitNewSystemEnabled()) {
    return;
  }

  const playerInfo = playerList[p.id];
  if (!playerInfo?.newPitState) return;
  
  if(!playerInfo?.inPitlane) return;

  if (playerInfo.newPitState.isWaitingForPit && 
      !playerInfo.newPitState.pKeyPressed && 
      playerInfo.newPitState.pitReadyTime && 
      currentTime >= playerInfo.newPitState.pitReadyTime) {
    
    handleAvatar(Situacions.PitReady, { id: p.id } as PlayerObject, room);
    
    playerInfo.newPitState.pitEmojiShowTime = room.getScores().time;
    
    if (playerInfo.newPitState.pitStartTime && playerInfo.newPitState.pitReadyTime) {
      playerInfo.newPitState.emojiDelayTime = playerInfo.newPitState.pitReadyTime - playerInfo.newPitState.pitStartTime;

      playerInfo.newPitState.reactionTimeout = playerInfo.newPitState.pitEmojiShowTime + 3;
    }
    playerInfo.newPitState.pitReadyTime = undefined;
  }

  const pitResult = handlePitKeyPress(p.id, properties, room);
  
  if (pitResult.shouldStart && pitResult.selectedTires) {
    handlePitStop(room, p, pitResult.selectedTires);
  }
  
  if (playerInfo.newPitState.isWaitingForPit && 
      !playerInfo.newPitState.pKeyPressed && 
      playerInfo.newPitState.reactionTimeout && 
      currentTime >= playerInfo.newPitState.reactionTimeout) {

    
    const timeoutPitResult: PitResult = {
      totalTime: 15.0,
      errorType: "heavy",
      tyres: [Math.floor(Math.random() * 4)],
      perTyreTimes: [3.5, 4.0, 3.8, 3.7]
    };
    
    playerList[p.id].pitFailures = timeoutPitResult;
    playerList[p.id].pitCountdown = 15.0;
    
    playerInfo.newPitState.pKeyPressed = true;
    playerInfo.newPitState.isWaitingForPit = false;
    
    handleAvatar(Situacions.None, { id: p.id } as PlayerObject, room);
    
    if (playerInfo.newPitState.selectedTires) {
      handlePitStop(room, p, playerInfo.newPitState.selectedTires);
    }
  }
}

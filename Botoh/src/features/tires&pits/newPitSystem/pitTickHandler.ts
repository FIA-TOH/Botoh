import { handlePitKeyPress } from "./newPitManager";
import { playerList } from "../../changePlayerState/playerList";
import { isPitNewSystemEnabled } from "./newPitManager";
import { handlePitStop } from "../handlePitStop";
import { handleAvatar, restoreTyreOrCar, Situacions } from "../../changePlayerState/handleAvatar";
import { MAX_REACTION_PIT_TIME, PitResult } from "../pitStopFunctions";
import { sendAlertMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { resetPitState } from "./newPitManager";

const MOVEMENT_CANCEL_GRACE_SECONDS = 0.5;

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

  if (playerInfo.newPitState.isWaitingForPit) {
    const disc = room.getPlayerDiscProperties(p.id);
    if (!disc) return;

    const pitStartTime = playerInfo.newPitState.pitStartTime ?? currentTime;
    const canValidateMovement =
      currentTime - pitStartTime >= MOVEMENT_CANCEL_GRACE_SECONDS;
    
    const isMoving = Math.hypot(disc.xspeed, disc.yspeed) > 0.5;
    
    if (canValidateMovement && isMoving) {
      resetPitState(p.id);
      
      restoreTyreOrCar(p.id, room);
      
      sendAlertMessage(room, MESSAGES.CANCELED_CHANGE_TYRES(), p.id);
      
      return;
    }
  }

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
      totalTime: MAX_REACTION_PIT_TIME,
      errorType: "heavy",
      tyres: [Math.floor(Math.random() * 4)],
      perTyreTimes: [1.5, 1.5, 1.5, 1.5]
    };
    
    playerList[p.id].pitFailures = timeoutPitResult;
    playerList[p.id].pitCountdown = MAX_REACTION_PIT_TIME;
    
    playerInfo.newPitState.pKeyPressed = true;
    playerInfo.newPitState.isWaitingForPit = false;
    
    handleAvatar(Situacions.None, { id: p.id } as PlayerObject, room);
    
    if (playerInfo.newPitState.selectedTires) {
      handlePitStop(room, p, playerInfo.newPitState.selectedTires);
    }
  }
}

import {
  GeneralGameMode,
  generalGameMode,
} from "../../changeGameState/changeGameModes";
import { Teams } from "../../changeGameState/teams";
import { handleAvatar, Situacions } from "../../changePlayerState/handleAvatar";
import { playerList } from "../../changePlayerState/playerList";
import {
  sendErrorMessage,
  sendAlertMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { rejoinManager } from "../../changePlayerState/rejoinManager";
import { idToAuth } from "../../changePlayerState/playerList";

export function handleRejoinCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (generalGameMode !== GeneralGameMode.GENERAL_RACE) {
    sendErrorMessage(room, MESSAGES.NOT_STARTED(), byPlayer.id);
    return;
  }

  if (!room.getScores()) {
    sendErrorMessage(room, MESSAGES.NOT_STARTED(), byPlayer.id);
    return;
  }

  const playerAuth = idToAuth[byPlayer.id] || byPlayer.auth;

  const rejoinData = rejoinManager.getPlayerData(playerAuth);
  if (!rejoinData) {
    sendErrorMessage(room, MESSAGES.YOU_WERENT_RACING_BEFORE(), byPlayer.id);
    return;
  }

  if (!playerList[byPlayer.id]?.canRejoin) {
    sendErrorMessage(room, MESSAGES.THE_JOIN_TIME_IS_OVER(), byPlayer.id);
    return;
  }

  room.setPlayerTeam(byPlayer.id, Teams.RUNNERS);

  setTimeout(() => {
    const currentPlayerInfo = playerList[byPlayer.id];
    const savedPlayerInfo = rejoinData.playerInfo;
    const savedPosition = rejoinData.position;
    
    const currentTime = room.getScores()?.time || 0;
    const timeOutside = currentTime - rejoinData.leftTime;
    
    const preservedProps = {
      ip: currentPlayerInfo.ip,
      afk: currentPlayerInfo.afk,
      afkAlert: currentPlayerInfo.afkAlert,
      cameraFollowing: currentPlayerInfo.cameraFollowing,
      canRejoin: false 
    };
    
    Object.assign(currentPlayerInfo, savedPlayerInfo);
    Object.assign(currentPlayerInfo, preservedProps);
    
    if (timeOutside > 0) {
      currentPlayerInfo.totalTime += timeOutside;
      currentPlayerInfo.lapTime += timeOutside;
      
      if (currentPlayerInfo.sectorTime && currentPlayerInfo.sectorTime.length > 0) {
        const currentSectorIndex = currentPlayerInfo.currentSector - 1;
        if (currentSectorIndex >= 0 && currentSectorIndex < currentPlayerInfo.sectorTime.length) {
          currentPlayerInfo.sectorTime[currentSectorIndex] += timeOutside;
        }
      }
      
      currentPlayerInfo.sectorTimeCounter += timeOutside;
    }
    
    room.setPlayerDiscProperties(byPlayer.id, {
      x: savedPosition.x,
      y: savedPosition.y,
      xspeed: 0,
      yspeed: 0
    });

    handleAvatar(Situacions.ChangeTyre, byPlayer, room);
    
    rejoinManager.clearPlayerData(playerAuth);
  }, 100);

  sendAlertMessage(room, MESSAGES.CAME_BACK_RACE_ONE(), byPlayer.id);
}


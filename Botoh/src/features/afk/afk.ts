import { afkKickTime, afkAlertTime } from "../../../roomconfig.json";
import {
  GameMode,
  gameMode,
  GeneralGameMode,
  generalGameMode,
} from "../changeGameState/changeGameModes";
import { gameState } from "../changeGameState/gameState";
import { Teams } from "../changeGameState/teams";
import { playerList } from "../changePlayerState/playerList";
import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { deployVSCAutomatically } from "../safetyCar/vsc";
import { handleSCCommand } from "../commands/flagsAndVSC/handleSCCommand";
import { presentationLap } from "../commands/gameState/handlePresentationLapCommand";
import { chooseOneDebris } from "../debris/chooseOneDebris";
import { debrisEnabled } from "../debris/enableDebris";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { vsc } from "../safetyCar/vsc";
import { isRealSafetyEnabled } from "../commands/flagsAndVSC/handleSafetyCommand";
import { isSCActive } from "../commands/flagsAndVSC/handleSCCommand";

interface PlayerActivity {
  lastActivityTime: number;
  lastWarningTime: number;
  warningSent: boolean;
  vscActivated: boolean;
  wasAfkWhenLeft: boolean;
}

const playerActivities: { [key: number]: PlayerActivity } = {};
let safetyCarActivatedForAfkLeave = false;

function getCurrentGameTime(room: RoomObject): number {
  return room.getScores()?.time || 0;
}

function shouldPauseAfkDetection(playerId: number): boolean {
  const playerProps = playerList[playerId];
  if (!playerProps) return true;

  if (playerProps.inPitlane) return true;
  if (vsc || isSCActive()) return true;
  if (presentationLap) return true;
  if (gameState === "paused") return true; // Pause AFK detection when game is paused
  
  return false;
}

function getAfkTimeout(): number {
  return isRealSafetyEnabled() ? 2 : afkKickTime;
}

function getWarningTimeout(): number {
  return isRealSafetyEnabled() ? 0 : afkKickTime - 5;
}

export function updatePlayerActivity(player: PlayerObject, room?: RoomObject) {
  const playerId = player.id;
  const currentTime = room ? getCurrentGameTime(room) : 0;
  
  if (!playerActivities[playerId]) {
    playerActivities[playerId] = {
      lastActivityTime: currentTime,
      lastWarningTime: 0,
      warningSent: false,
      vscActivated: false,
      wasAfkWhenLeft: false,
    };
  } else {
    if (currentTime > playerActivities[playerId].lastActivityTime) {
      playerActivities[playerId].lastActivityTime = currentTime;
      playerActivities[playerId].warningSent = false;
      playerActivities[playerId].lastWarningTime = 0;
      playerActivities[playerId].vscActivated = false;
    }
  }
  
  const playerProps = playerList[playerId];
  if (playerProps) {
    playerProps.afkAlert = false;
  }
}

export function resetAllAfkCounters(room: RoomObject) {
  const currentTime = getCurrentGameTime(room);
  const players = room.getPlayerList();
  
  players.forEach(player => {
    const playerId = player.id;
    const playerProps = playerList[playerId];
    
    if (playerProps && player.team === Teams.RUNNERS) {
      if (!playerActivities[playerId]) {
        playerActivities[playerId] = {
          lastActivityTime: currentTime,
          lastWarningTime: 0,
          warningSent: false,
          vscActivated: false,
          wasAfkWhenLeft: false,
        };
      }
      playerActivities[playerId].lastActivityTime = currentTime;
      playerActivities[playerId].warningSent = false;
      playerActivities[playerId].lastWarningTime = 0;
      playerProps.afkAlert = false;
    }
  });
}

export function handlePlayerLeave(player: PlayerObject, room: RoomObject) {
  const playerId = player.id;
  
  if (!isRealSafetyEnabled()) {
    delete playerActivities[playerId];
    return;
  }
  
  if (safetyCarActivatedForAfkLeave) {
    delete playerActivities[playerId];
    return;
  }
  
  const activity = playerActivities[playerId];
  
  if (activity) {
    const currentGameTime = getCurrentGameTime(room);
    const afkDuration = currentGameTime - activity.lastActivityTime;
    
    if (afkDuration >= 5 && !presentationLap) {
      handleSCCommand(undefined, ["on"], room);
      safetyCarActivatedForAfkLeave = true;
      
      if (
        ACTUAL_CIRCUIT.info.sectorOne &&
        ACTUAL_CIRCUIT.info.sectorTwo &&
        ACTUAL_CIRCUIT.info.sectorThree
      ) {
        sendAlertMessage(
          room,
          MESSAGES.WHO_IS_AFK_SECTORS(
            player.name,
            playerList[playerId]?.currentSector || 1
          )
        );
      } else {
        sendAlertMessage(room, MESSAGES.WHO_IS_AFK(player.name));
      }
      
      if (ACTUAL_CIRCUIT.info.haveDebris && debrisEnabled) {
        chooseOneDebris(room, playerId);
      }
    }
  }
  
  delete playerActivities[playerId];
}

export function resetSafetyCarActivationForRace() {
  safetyCarActivatedForAfkLeave = false;
}

export function afkKick(room: RoomObject) {
  const players = room.getPlayerList();
  const currentGameTime = getCurrentGameTime(room);
  const afkTimeout = getAfkTimeout();
  const warningTimeout = getWarningTimeout();

  if (
    !room.getScores() ||
    room.getScores().time <= 0 ||
    gameState !== "running" ||
    gameMode === GameMode.WAITING ||
    gameMode === GameMode.TRAINING ||
    generalGameMode === GeneralGameMode.GENERAL_QUALY
  ) {
    return;
  }

  for (const player of players) {
    const playerId = player.id;
    const playerProps = playerList[playerId];
    
    if (!playerProps || player.team !== Teams.RUNNERS) {
      continue;
    }

    if (shouldPauseAfkDetection(playerId)) {
      continue;
    }

    if (!playerActivities[playerId]) {
      playerActivities[playerId] = {
        lastActivityTime: currentGameTime,
        lastWarningTime: 0,
        warningSent: false,
        vscActivated: false,
        wasAfkWhenLeft: false,
      };
    }

    const activity = playerActivities[playerId];
    const afkDuration = currentGameTime - activity.lastActivityTime;

    if (isRealSafetyEnabled() && afkDuration >= 2 && !activity.vscActivated) {
      if (!vsc && !presentationLap) {
        deployVSCAutomatically(room);
        
        if (
          ACTUAL_CIRCUIT.info.sectorOne &&
          ACTUAL_CIRCUIT.info.sectorTwo &&
          ACTUAL_CIRCUIT.info.sectorThree
        ) {
          sendAlertMessage(
            room,
            MESSAGES.WHO_IS_AFK_SECTORS(
              player.name,
              playerProps.currentSector
            )
          );
        } else {
          sendAlertMessage(room, MESSAGES.WHO_IS_AFK(player.name));
        }
        
        if (ACTUAL_CIRCUIT.info.haveDebris && debrisEnabled) {
          chooseOneDebris(room, playerId);
        }
        
        activity.vscActivated = true;
      }
    }

    if (!isRealSafetyEnabled()) {
      if (afkDuration >= warningTimeout && !activity.warningSent) {
        sendAlertMessage(room, MESSAGES.AFK_MESSAGE(), playerId);
        activity.warningSent = true;
        activity.lastWarningTime = currentGameTime;
      }
      
      if (afkDuration >= afkTimeout) {
        room.kickPlayer(playerId, "AFK", false);
      }
    }
  }
}

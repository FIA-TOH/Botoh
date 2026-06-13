import { afkKickTime } from "../../../roomconfig.json";
import {
  GameMode,
  gameMode,
  GeneralGameMode,
  generalGameMode,
} from "../changeGameState/changeGameModes";
import { gameState } from "../changeGameState/gameState";
import { Teams } from "../changeGameState/teams";
import { playerList } from "../changePlayerState/playerList";
import { getRunningPlayers, vectorSpeed } from "../utils";
import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { deployVSCAutomatically } from "../safetyCar/vsc";
import { handleSCCommand } from "../commands/flagsAndVSC/handleSCCommand";
import { presentationLap } from "../commands/gameState/handlePresentationLapCommand";
import { chooseOneDebris } from "../debris/chooseOneDebris";
import { debrisEnabled } from "../debris/enableDebris";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { vsc, vscTriggeredByPlayer } from "../safetyCar/vsc";
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

const MIN_SPEED_FOR_ACTIVITY = 20;
const MIN_SPEED_FOR_ACTIVITY_FOR_COME_BACK = 5;

export function clearPlayerAfkActivity(playerId: number) {
  delete playerActivities[playerId];

  const playerProps = playerList[playerId];
  if (playerProps) {
    playerProps.afkAlert = false;
  }
}

export function clearAllAfkActivities() {
  Object.keys(playerActivities).forEach((playerId) => {
    clearPlayerAfkActivity(Number(playerId));
  });

  Object.keys(playerList).forEach((playerId) => {
    const numericPlayerId = Number(playerId);
    if (!Number.isNaN(numericPlayerId)) {
      clearPlayerAfkActivity(numericPlayerId);
    }
  });
}

function isAfkSafetyLogicAllowed(): boolean {
  return (
    gameMode !== GameMode.WAITING &&
    gameMode !== GameMode.TRAINING &&
    generalGameMode !== GeneralGameMode.GENERAL_QUALY
  );
}

function getCurrentGameTime(room: RoomObject): number {
  return room.getScores()?.time || 0;
}

function shouldPauseAfkDetection(playerId: number): boolean {
  const playerProps = playerList[playerId];
  if (!playerProps) return true;

  if (playerProps.inPitlane) return true;
  if (vsc || isSCActive()) return true;
  if (presentationLap) return true;
  if (gameState === "paused") return true;
  
  return false;
}

function getAfkTimeout(): number {
  return isRealSafetyEnabled() ? 2 : afkKickTime;
}

function getWarningTimeout(): number {
  return isRealSafetyEnabled() ? 0 : afkKickTime - 5;
}

function isPlayerMovingAtMinimumSpeed(
  playerId: number,
  room: RoomObject,
  minimumSpeed: number
): boolean {
  if (!room) return false;
  
  const playersAndDiscs = room.getPlayerList().map(player => ({
    p: player,
    disc: room.getPlayerDiscProperties(player.id)
  }));
  
  const runningPlayer = getRunningPlayers(playersAndDiscs).find(
    pad => pad.p.id === playerId
  );
  
  if (!runningPlayer) return false;
  
  const speed = vectorSpeed(runningPlayer.disc.xspeed, runningPlayer.disc.yspeed);
  return speed >= minimumSpeed;
}

export function isPlayerMovingAtSpeed(playerId: number, room: RoomObject): boolean {
  return isPlayerMovingAtMinimumSpeed(playerId, room, MIN_SPEED_FOR_ACTIVITY);
}

export function isPlayerMovingAtComeBackSpeed(playerId: number, room: RoomObject): boolean {
  return isPlayerMovingAtMinimumSpeed(
    playerId,
    room,
    MIN_SPEED_FOR_ACTIVITY_FOR_COME_BACK
  );
}

export function updatePlayerActivity(player: PlayerObject, room?: RoomObject) {
  if (!isAfkSafetyLogicAllowed()) {
    clearPlayerAfkActivity(player.id);
    return;
  }

  if (player.team !== Teams.RUNNERS) {
    clearPlayerAfkActivity(player.id);
    return;
  }

  const playerId = player.id;
  const currentTime = room ? getCurrentGameTime(room) : 0;
  
  if (room && isPlayerMovingAtSpeed(playerId, room)) {
    const playerProps = playerList[playerId];
    if (playerProps) {
      playerProps.afkAlert = false;
    }
    return;
  }
  
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
      playerActivities[playerId].vscActivated = false;
      playerProps.afkAlert = false;
    }
  });
}

export function handlePlayerLeave(player: PlayerObject, room: RoomObject) {
  const playerId = player.id;

  if (!isAfkSafetyLogicAllowed()) {
    clearPlayerAfkActivity(playerId);
    return;
  }
  
  if (!isRealSafetyEnabled()) {
    clearPlayerAfkActivity(playerId);
    return;
  }
  
  if (vsc && vscTriggeredByPlayer === playerId) {
    const { clearVSCTriggerPlayer } = require("../safetyCar/vsc");
    clearVSCTriggerPlayer(playerId);
    resetAllAfkCounters(room);
    clearPlayerAfkActivity(playerId);
    return;
  }
  
  if (safetyCarActivatedForAfkLeave) {
    clearPlayerAfkActivity(playerId);
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
  
  clearPlayerAfkActivity(playerId);
}

export function resetSafetyCarActivationForRace() {
  safetyCarActivatedForAfkLeave = false;
}

export function afkKick(room: RoomObject) {
  const players = room.getPlayerList();
  const runningPlayerIds = new Set(
    players
      .filter((player) => player.team === Teams.RUNNERS)
      .map((player) => player.id)
  );

  Object.keys(playerActivities).forEach((playerId) => {
    const numericPlayerId = Number(playerId);
    if (!runningPlayerIds.has(numericPlayerId)) {
      clearPlayerAfkActivity(numericPlayerId);
    }
  });

  const currentGameTime = getCurrentGameTime(room);
  const afkTimeout = getAfkTimeout();
  const warningTimeout = getWarningTimeout();

  if (
    !room.getScores() ||
    room.getScores().time <= 0 ||
    gameState !== "running" ||
    !isAfkSafetyLogicAllowed()
  ) {
    return;
  }

  if (vsc || isSCActive()) {
    resetAllAfkCounters(room);
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

    const isMoving = isRealSafetyEnabled()
      ? isPlayerMovingAtComeBackSpeed(playerId, room)
      : isPlayerMovingAtSpeed(playerId, room);

    if (isMoving) {
      activity.lastActivityTime = currentGameTime;
      activity.warningSent = false;
      activity.lastWarningTime = 0;
      activity.vscActivated = false;
      continue;
    }

    if (isRealSafetyEnabled() && afkDuration >= 2 && !activity.vscActivated) {
      if (!vsc && !presentationLap) {
        deployVSCAutomatically(room, playerId);
        resetAllAfkCounters(room);
        
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

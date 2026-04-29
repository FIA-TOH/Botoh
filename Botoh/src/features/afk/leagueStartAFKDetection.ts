import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";

interface PlayerPosition {
  x: number;
  y: number;
}

interface PlayerMovementTracker {
  initialPosition: PlayerPosition;
  hasMoved: boolean;
}

let movementTrackers: { [playerId: number]: PlayerMovementTracker } = {};
let detectionStartTime: number | undefined;
let isDetectionActive = false;

export function initializeLeagueStartAFKDetection(room: RoomObject) {
  if (!LEAGUE_MODE) {
    return;
  }

  resetDetection();

  const players = room.getPlayerList();
  players.forEach((player: PlayerObject) => {
    if (player.team === 1) {
      const disc = room.getPlayerDiscProperties(player.id);
      if (disc) {
        movementTrackers[player.id] = {
          initialPosition: { x: disc.x, y: disc.y },
          hasMoved: false
        };
      }
    }
  });

  isDetectionActive = true;
  const scores = room.getScores();
  if (scores) {
    detectionStartTime = scores.time;
  }
}

export function updateLeagueStartAFKDetection(room: RoomObject) {
  if (!isDetectionActive || detectionStartTime === undefined) {
    return;
  }

  const scores = room.getScores();
  if (!scores) return;

  const elapsedTime = scores.time - detectionStartTime;
  if (elapsedTime >= 0.5) {
    checkForStationaryPlayers(room);
    resetDetection();
    return;
  }

  const players = room.getPlayerList();
  players.forEach((player: PlayerObject) => {
    if (player.team === 1 && movementTrackers[player.id]) {
      const disc = room.getPlayerDiscProperties(player.id);
      if (disc) {
        trackPlayerMovement(player.id, disc.x, disc.y);
      }
    }
  });
}

export function trackPlayerMovement(playerId: number, currentX: number, currentY: number) {
  if (!isDetectionActive || !movementTrackers[playerId]) {
    return;
  }

  const tracker = movementTrackers[playerId];
  const initialPos = tracker.initialPosition;

  const movementThreshold = 1; 
  const movementThresholdSq = movementThreshold * movementThreshold;
  

  const distanceSq = 
    Math.pow(currentX - initialPos.x, 2) + 
    Math.pow(currentY - initialPos.y, 2);

  if (distanceSq > movementThresholdSq) {
    tracker.hasMoved = true;
  }
}

function checkForStationaryPlayers(room: RoomObject) {
  const stationaryPlayers: PlayerObject[] = [];

  Object.keys(movementTrackers).forEach(playerIdStr => {
    const playerId = parseInt(playerIdStr);
    const tracker = movementTrackers[playerId];
    
    if (!tracker.hasMoved) {
      const player = room.getPlayerList().find((p: PlayerObject) => p.id === playerId);
      if (player) {
        stationaryPlayers.push(player);
      }
    }
  });

  if (stationaryPlayers.length > 0) {
    pauseGameAndAnnounceStationaryPlayers(room, stationaryPlayers);
  }
}

function pauseGameAndAnnounceStationaryPlayers(room: RoomObject, stationaryPlayers: PlayerObject[]) {
  room.pauseGame(true);

  const playerNames = stationaryPlayers.map(p => p.name).join(", ");
  
  sendAlertMessage(room, MESSAGES.LEAGUE_START_STATIONARY_PLAYERS(playerNames));
}

function resetDetection() {
  isDetectionActive = false;
  movementTrackers = {};
  detectionStartTime = undefined;
}

export function updatePlayerPositionForAFKDetection(playerId: number, x: number, y: number) {
  trackPlayerMovement(playerId, x, y);
}

export function cleanupLeagueStartAFKDetection() {
  resetDetection();
}

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
  // Only run in league mode
  if (!LEAGUE_MODE) {
    return;
  }

  // Reset any existing detection
  resetDetection();

  // Store initial positions of all active players
  const players = room.getPlayerList();
  players.forEach((player: PlayerObject) => {
    if (player.team === 1) { // Only track runners (team 1)
      const disc = room.getPlayerDiscProperties(player.id);
      if (disc) {
        movementTrackers[player.id] = {
          initialPosition: { x: disc.x, y: disc.y },
          hasMoved: false
        };
      }
    }
  });

  // Start detection window (0.5 seconds)
  isDetectionActive = true;
  const scores = room.getScores();
  if (scores) {
    detectionStartTime = scores.time;
  }
}

// Call this function on each game tick to check for movement
export function updateLeagueStartAFKDetection(room: RoomObject) {
  if (!isDetectionActive || detectionStartTime === undefined) {
    return;
  }

  const scores = room.getScores();
  if (!scores) return;

  // Check if 0.5 seconds have passed
  const elapsedTime = scores.time - detectionStartTime;
  if (elapsedTime >= 0.5) {
    checkForStationaryPlayers(room);
    resetDetection();
    return;
  }

  // Update player positions during detection window
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

  // Check if player has moved more than a small threshold (to account for tiny movements)
  const movementThreshold = 1; // 1 unit movement threshold
  const distance = Math.sqrt(
    Math.pow(currentX - initialPos.x, 2) + 
    Math.pow(currentY - initialPos.y, 2)
  );

  if (distance > movementThreshold) {
    tracker.hasMoved = true;
  }
}

function checkForStationaryPlayers(room: RoomObject) {
  const stationaryPlayers: PlayerObject[] = [];

  // Find players who haven't moved
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

  // If we found stationary players, pause game and announce
  if (stationaryPlayers.length > 0) {
    pauseGameAndAnnounceStationaryPlayers(room, stationaryPlayers);
  }
}

function pauseGameAndAnnounceStationaryPlayers(room: RoomObject, stationaryPlayers: PlayerObject[]) {
  // Pause the game
  room.pauseGame(true);

  // Create player names string for announcement
  const playerNames = stationaryPlayers.map(p => p.name).join(", ");
  
  // Send localized alert message
  sendAlertMessage(room, MESSAGES.LEAGUE_START_STATIONARY_PLAYERS(playerNames));
}

function resetDetection() {
  isDetectionActive = false;
  movementTrackers = {};
  detectionStartTime = undefined;
}

// Export function to be called from game tick or position tracking
export function updatePlayerPositionForAFKDetection(playerId: number, x: number, y: number) {
  trackPlayerMovement(playerId, x, y);
}

// Clean up function to call when game stops or ends
export function cleanupLeagueStartAFKDetection() {
  resetDetection();
}

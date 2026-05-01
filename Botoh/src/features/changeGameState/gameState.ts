import { updatePlayerActivity } from "../afk/afk";
import { playerList } from "../changePlayerState/playerList";

export let gameState: string | null;
export let isGamePaused: boolean = false;

export function handleGameStateChange(
  newGameState: string | null,
  room: RoomObject
) {
  const players = room.getPlayerList();
  players.forEach((p) => {
    updatePlayerActivity(p);
  });
  if (newGameState === "paused") {
    isGamePaused = true;
  
  } else if (newGameState === "running") {
    isGamePaused = false;
    const now = performance.now();
    Object.values(playerList).forEach(playerData => {
      if (playerData) {
        playerData.lastLapTimeUpdate = now;
     
      }
    });
  }
  
  gameState = newGameState;
}

export function getGameState() {
  return gameState;
}

export function getIsGamePaused() {
  return isGamePaused;
}

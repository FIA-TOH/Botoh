import { updatePlayerActivity } from "../afk/afk";

export let gameState: string | null;

export function handleGameStateChange(
  newGameState: string | null,
  room: RoomObject
) {
  const players = room.getPlayerList();
  players.forEach((p) => {
    updatePlayerActivity(p);
  });
  gameState = newGameState;
}

export function getGameState() {
  return gameState;
}

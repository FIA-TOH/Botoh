export let gameState: string | null;

export function handleGameStateChange(newGameState: string | null) {
    gameState = newGameState
}

export function getGameState(){
    return gameState;
}
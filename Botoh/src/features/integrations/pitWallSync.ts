export type PitWallGameState = "running" | "paused" | null;

function getBackendSocket() {
  return (global as any).backendSocket;
}

export function emitPitWallMapChange(mapName: string) {
  const socket = getBackendSocket();

  if (!socket?.emit) return;

  socket.emit("room:mapChanged", {
    mapName,
    timestamp: Date.now(),
  });
}

export function emitPitWallGameStateChange(gameState: PitWallGameState) {
  const socket = getBackendSocket();

  if (!socket?.emit) return;

  socket.emit("room:gameStateChanged", {
    gameState,
    timestamp: Date.now(),
  });
}

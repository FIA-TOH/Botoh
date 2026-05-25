export type PitWallGameState = "running" | "paused" | null;

function getBackendSocket() {
  return (global as any).backendSocket;
}

export interface PitWallRoomOpenedPayload {
  roomName: string;
  roomLink: string;
  leagueMode: boolean;
  envName: string;
  maxPlayers: number;
  public: boolean;
}

export function emitPitWallRoomOpened(payload: PitWallRoomOpenedPayload) {
  const socket = getBackendSocket();

  if (!socket?.emit) return;

  socket.emit("room:opened", {
    ...payload,
    timestamp: Date.now(),
  });
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
  // Preserve the authoritative room event for heartbeat resynchronization.
  (global as any).pitWallGameState = gameState;

  const socket = getBackendSocket();

  if (!socket?.emit) return;

  socket.emit("room:gameStateChanged", {
    gameState,
    timestamp: Date.now(),
  });
}

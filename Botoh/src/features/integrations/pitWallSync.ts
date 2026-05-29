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

let lastRoomOpenedPayload: PitWallRoomOpenedPayload | null = null;
let lastMapName: string | null = null;

export function emitPitWallRoomOpened(payload: PitWallRoomOpenedPayload) {
  lastRoomOpenedPayload = payload;
  const socket = getBackendSocket();

  if (!socket?.emit) return;

  socket.emit("room:opened", {
    ...payload,
    timestamp: Date.now(),
  });
}

export function emitPitWallMapChange(mapName: string) {
  lastMapName = mapName;
  const socket = getBackendSocket();

  if (!socket?.emit) return;

  socket.emit("room:mapChanged", {
    mapName,
    timestamp: Date.now(),
  });
}

export function flushPitWallRoomSnapshot() {
  const socket = getBackendSocket();

  if (!socket?.emit) return;

  if (lastRoomOpenedPayload) {
    socket.emit("room:opened", {
      ...lastRoomOpenedPayload,
      timestamp: Date.now(),
    });
  }

  if (lastMapName) {
    socket.emit("room:mapChanged", {
      mapName: lastMapName,
      timestamp: Date.now(),
    });
  }
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

/**
 * Tipos para o sistema de Room/Haxball
 */

export interface RoomState {
  currentMap: string | null;
  playerCount: number;
  gameState: 'running' | 'paused' | null;
  startTime: Date | null;
  lastUpdate: Date;
  roomName?: string;
  roomLink?: string;
  leagueMode?: boolean;
  envName?: string;
  maxPlayers?: number;
  public?: boolean;
  isOnline?: boolean;
  openedAt?: Date;
}

export interface MapInfo {
  name: string;
  author?: string;
  width: number;
  height: number;
  vertexCount: number;
  segmentCount: number;
}

export interface RoomStats {
  playerCount: number;
  gameState: string;
  currentMap: string | null;
  uptime: number | null;
  totalGames: number;
  averageGameTime: number;
}

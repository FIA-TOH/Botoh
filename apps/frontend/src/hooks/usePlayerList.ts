'use client';

import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { Driver, RaceSession } from '@/mocks/raceData';

export interface PlayerPositionData {
  id: number;
  name: string;
  team: number;
  admin: boolean;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  avatar?: string;
  country?: string;
  conn: string;
  auth?: string;
}

export interface PlayerData extends PlayerPositionData, Omit<Driver, 'position' | 'team' | 'name'> {
  racePosition: number | null;
  isLogged: boolean;
  isFirstDriver: boolean;
  scuderiaColor: number | null;
  isOut: boolean;
}

export interface PlayerPositionsUpdate {
  timestamp: number;
  players: PlayerPositionData[];
  playerCount: number;
}

export interface PlayerListUpdate {
  timestamp: number;
  players: PlayerData[];
  standings: PlayerData[];
  playerCount: number;
  raceSession: RaceSession;
}

export function usePlayerList() {
  const [playerList, setPlayerList] = useState<PlayerListUpdate | null>(null);
  const [playerPositions, setPlayerPositions] = useState<PlayerPositionsUpdate | null>(null);
  const { socket, isConnected, error } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for player list updates
    const handlePlayerListUpdate = (data: PlayerListUpdate) => {
      setPlayerList(data);
    };
    const handlePlayerPositionsUpdate = (data: PlayerPositionsUpdate) => {
      setPlayerPositions(data);
    };

    socket.on('playerList:update', handlePlayerListUpdate);
    socket.on('playerPositions:update', handlePlayerPositionsUpdate);

    return () => {
      socket.off('playerList:update', handlePlayerListUpdate);
      socket.off('playerPositions:update', handlePlayerPositionsUpdate);
    };
  }, [socket, isConnected]);

  return { playerList, playerPositions, isConnected, error };
}

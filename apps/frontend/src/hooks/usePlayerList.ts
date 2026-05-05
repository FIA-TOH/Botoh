'use client';

import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

export interface PlayerData {
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

export interface PlayerListUpdate {
  timestamp: number;
  players: PlayerData[];
  playerCount: number;
}

export function usePlayerList() {
  const [playerList, setPlayerList] = useState<PlayerListUpdate | null>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for player list updates
    const handlePlayerListUpdate = (data: PlayerListUpdate) => {
      setPlayerList(data);
    };

    socket.on('playerList:update', handlePlayerListUpdate);

    return () => {
      socket.off('playerList:update', handlePlayerListUpdate);
    };
  }, [socket, isConnected]);

  return { playerList, isConnected };
}

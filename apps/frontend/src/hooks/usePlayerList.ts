'use client';

import { useState, useEffect, useRef } from 'react';
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

interface UsePlayerListOptions {
  positionUpdateFps?: number;
  subscribePositions?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export function usePlayerList(options: UsePlayerListOptions = {}) {
  const {
    positionUpdateFps,
    subscribePositions = true,
    reconnectAttempts,
    reconnectDelay,
  } = options;
  const [playerList, setPlayerList] = useState<PlayerListUpdate | null>(null);
  const [playerPositions, setPlayerPositions] = useState<PlayerPositionsUpdate | null>(null);
  const { socket, isConnected, error } = useSocket({
    reconnectAttempts,
    reconnectDelay,
  });
  const lastPositionUpdateRef = useRef(0);
  const pendingPositionUpdateRef = useRef<PlayerPositionsUpdate | null>(null);
  const positionUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for player list updates
    const handlePlayerListUpdate = (data: PlayerListUpdate) => {
      setPlayerList(data);
    };
    const handlePlayerPositionsUpdate = (data: PlayerPositionsUpdate) => {
      if (positionUpdateFps && positionUpdateFps > 0) {
        const minInterval = 1000 / positionUpdateFps;
        const now = Date.now();
        const elapsed = now - lastPositionUpdateRef.current;

        if (elapsed >= minInterval) {
          lastPositionUpdateRef.current = now;
          setPlayerPositions(data);
          return;
        }

        pendingPositionUpdateRef.current = data;

        if (!positionUpdateTimeoutRef.current) {
          positionUpdateTimeoutRef.current = setTimeout(() => {
            positionUpdateTimeoutRef.current = null;
            lastPositionUpdateRef.current = Date.now();

            if (pendingPositionUpdateRef.current) {
              setPlayerPositions(pendingPositionUpdateRef.current);
              pendingPositionUpdateRef.current = null;
            }
          }, minInterval - elapsed);
        }
        return;
      }

      setPlayerPositions(data);
    };

    socket.on('playerList:update', handlePlayerListUpdate);
    if (subscribePositions) {
      socket.on('playerPositions:update', handlePlayerPositionsUpdate);
    }

    return () => {
      socket.off('playerList:update', handlePlayerListUpdate);
      if (subscribePositions) {
        socket.off('playerPositions:update', handlePlayerPositionsUpdate);
      }

      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
        positionUpdateTimeoutRef.current = null;
      }
    };
  }, [socket, isConnected, positionUpdateFps, subscribePositions]);

  return { playerList, playerPositions, isConnected, error };
}

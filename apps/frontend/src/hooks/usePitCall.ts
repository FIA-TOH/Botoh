'use client';

import { useSocket } from './useSocket';
import { Tires } from '@/types/game';

export function usePitCall() {
  const { socket, isConnected } = useSocket();

  const sendPitCall = (playerName: string) => {
    if (!socket || !isConnected || !playerName) return;

    socket.emit('pit:call', {
      playerName,
    });
  };

  const preparePitTyre = (playerName: string, tyre: Tires | null) => {
    if (!socket || !isConnected || !playerName) return;

    socket.emit('pit:prepare-tyre', {
      playerName,
      tyre,
    });
  };

  return {
    sendPitCall,
    preparePitTyre,
    isConnected,
  };
}

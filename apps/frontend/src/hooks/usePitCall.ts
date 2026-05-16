'use client';

import { useSocket } from './useSocket';

export function usePitCall() {
  const { socket, isConnected } = useSocket();

  const sendPitCall = (playerName: string) => {
    if (!socket || !isConnected || !playerName) return;

    socket.emit('pit:call', {
      playerName,
    });
  };

  return {
    sendPitCall,
    isConnected,
  };
}

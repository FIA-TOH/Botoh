'use client';

import { useSocket } from './useSocket';
import { Tires } from '@/types/game';
import type { PitWallActionResult } from './useChat';

export function usePitCall() {
  const { socket, isConnected } = useSocket();

  const sendPitCall = (
    playerName: string,
    playerId?: number,
    playerAuth?: string,
  ): Promise<PitWallActionResult> => {
    if (!socket || !isConnected || !playerName) {
      return Promise.resolve({ success: false, code: 'socket_unavailable' });
    }

    return new Promise((resolve) => {
      socket.timeout(5000).emit('pit:call', {
        playerName,
        playerId,
        playerAuth,
      }, (error: Error | null, response?: PitWallActionResult) => {
        if (error) {
          resolve({ success: false, code: 'bot_timeout' });
          return;
        }

        resolve(response ?? { success: true });
      });
    });
  };

  const preparePitTyre = (
    playerName: string,
    tyre: Tires | null,
    playerId?: number,
    playerAuth?: string,
  ): Promise<PitWallActionResult> => {
    if (!socket || !isConnected || !playerName) {
      return Promise.resolve({ success: false, code: 'socket_unavailable' });
    }

    return new Promise((resolve) => {
      socket.timeout(5000).emit('pit:prepare-tyre', {
        playerName,
        playerId,
        playerAuth,
        tyre,
      }, (error: Error | null, response?: PitWallActionResult) => {
        if (error) {
          resolve({ success: false, code: 'bot_timeout' });
          return;
        }

        resolve(response ?? { success: true });
      });
    });
  };

  return {
    sendPitCall,
    preparePitTyre,
    isConnected,
  };
}

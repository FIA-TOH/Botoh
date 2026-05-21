'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

export interface ChatMessage {
  player: string;
  message: string;
  timestamp: number;
  color: number | null;
  source: 'player' | 'system' | 'frontend';
}

export type ChatTarget =
  | { type: 'all' }
  | { type: 'team'; teamName: string }
  | { type: 'player'; playerName: string };

interface ChatMessageEnvelope {
  type: 'chat:message';
  data: ChatMessage;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleChatMessage = (payload: ChatMessageEnvelope) => {
      if (!payload?.data) return;

      setMessages((currentMessages) => [
        ...currentMessages,
        payload.data,
      ].slice(-100));
    };

    socket.on('chat:message', handleChatMessage);

    return () => {
      socket.off('chat:message', handleChatMessage);
    };
  }, [socket, isConnected]);

  const sendMessage = (
    message: string,
    player: string,
    target: ChatTarget,
  ) => {
    const trimmedMessage = message.trim();
    if (!socket || !isConnected || !trimmedMessage || trimmedMessage.startsWith('!')) {
      return;
    }

    socket.emit('chat:send', {
      player,
      message: trimmedMessage,
      target,
    });
  };

  return {
    messages,
    sendMessage,
    isConnected,
  };
}

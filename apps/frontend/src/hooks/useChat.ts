'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

export interface ChatMessage {
  player: string;
  message: string;
  timestamp: number;
  color: number | null;
  source: 'player' | 'system' | 'frontend';
  channel?: ChatTarget['type'];
  sender?: ChatParticipant;
  target?: ChatTarget;
  recipients?: ChatParticipant[];
}

export type ChatTarget =
  | { type: 'all' }
  | { type: 'team'; teamId?: string | null; teamName?: string | null; playerIds?: number[]; playerNames?: string[]; usernames?: string[] }
  | { type: 'player'; playerId?: number | null; playerName?: string | null; username?: string | null };

export interface ChatParticipant {
  playerId?: number;
  playerName?: string | null;
  username?: string | null;
  teamId?: string | null;
  teamName?: string | null;
}

export interface ChatVisibilityContext {
  token?: string | null;
  username?: string | null;
  aliases?: Array<string | null | undefined>;
  teamId?: string | null;
  teamName?: string | null;
}

export interface PitWallActionResult {
  success: boolean;
  code?: string;
  message?: string;
}

interface ChatMessageEnvelope {
  type: 'chat:message';
  data: ChatMessage;
}

function normalizeComparableValue(value?: string | number | null) {
  return String(value ?? '').trim().toLowerCase();
}

function hasMatchingValue(values: Array<string | number | null | undefined>, candidates: Set<string>) {
  return values.some((value) => {
    const normalizedValue = normalizeComparableValue(value);
    return Boolean(normalizedValue) && candidates.has(normalizedValue);
  });
}

function isMessageVisible(message: ChatMessage, visibility: ChatVisibilityContext) {
  const userAliases = new Set(
    [visibility.username, ...(visibility.aliases ?? [])]
      .map(normalizeComparableValue)
      .filter(Boolean),
  );
  const userTeams = new Set(
    [visibility.teamId, visibility.teamName]
      .map(normalizeComparableValue)
      .filter(Boolean),
  );

  const channel = message.channel ?? message.target?.type ?? 'all';
  const sentByCurrentUser = hasMatchingValue(
    [message.player, message.sender?.username, message.sender?.playerName],
    userAliases,
  );

  if (message.source === 'player' || message.source === 'system' || channel === 'all') {
    return true;
  }

  if (channel === 'team') {
    const target = message.target?.type === 'team' ? message.target : null;
    const teamMatches = hasMatchingValue(
      [
        target?.teamId,
        target?.teamName,
        ...((message.recipients ?? []).flatMap((recipient) => [recipient.teamId, recipient.teamName])),
      ],
      userTeams,
    );

    return sentByCurrentUser && teamMatches;
  }

  if (channel === 'player') {
    const target = message.target?.type === 'player' ? message.target : null;
    const addressedToCurrentUser = hasMatchingValue(
      [
        target?.username,
        target?.playerName,
        ...((message.recipients ?? []).flatMap((recipient) => [recipient.username, recipient.playerName])),
      ],
      userAliases,
    );

    return sentByCurrentUser || addressedToCurrentUser;
  }

  return false;
}

export function useChat(visibility: ChatVisibilityContext = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { socket, isConnected } = useSocket();
  const visibilityKey = JSON.stringify({
    token: visibility.token ?? null,
    username: visibility.username ?? null,
    aliases: visibility.aliases ?? [],
    teamId: visibility.teamId ?? null,
    teamName: visibility.teamName ?? null,
  });

  useEffect(() => {
    if (!socket || !isConnected) return;
    const currentVisibility = JSON.parse(visibilityKey) as ChatVisibilityContext;

    socket.emit('chat:join', {
      token: currentVisibility.token,
      aliases: currentVisibility.aliases ?? [],
      teamId: currentVisibility.teamId ?? null,
      teamName: currentVisibility.teamName ?? null,
    });

    const handleChatMessage = (payload: ChatMessageEnvelope) => {
      if (!payload?.data) return;

      if (!isMessageVisible(payload.data, currentVisibility)) return;

      setMessages((currentMessages) => [
        ...currentMessages,
        payload.data,
      ].slice(-100));
    };

    socket.on('chat:message', handleChatMessage);

    return () => {
      socket.off('chat:message', handleChatMessage);
    };
  }, [socket, isConnected, visibilityKey]);

  const sendMessage = (
    message: string,
    player: string,
    target: ChatTarget,
  ): Promise<PitWallActionResult> => {
    const trimmedMessage = message.trim();
    if (!socket || !isConnected || !trimmedMessage || trimmedMessage.startsWith('!')) {
      return Promise.resolve({ success: false, code: 'socket_unavailable' });
    }

    return new Promise((resolve) => {
      socket.timeout(5000).emit('chat:send', {
        player,
        message: trimmedMessage,
        target,
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
    messages,
    sendMessage,
    isConnected,
  };
}

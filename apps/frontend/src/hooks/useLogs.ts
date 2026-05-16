'use client';

import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

export interface LogMessage {
  message: string;
  timestamp: number;
  color: number | null;
}

interface LogMessageEnvelope {
  type: 'log:message';
  data: LogMessage;
}

export function useLogs() {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleLogMessage = (payload: LogMessageEnvelope) => {
      if (!payload?.data) return;

      setLogs((currentLogs) => [
        ...currentLogs,
        payload.data,
      ].slice(-200));
    };

    socket.on('log:message', handleLogMessage);

    return () => {
      socket.off('log:message', handleLogMessage);
    };
  }, [socket, isConnected]);

  return {
    logs,
    isConnected,
  };
}

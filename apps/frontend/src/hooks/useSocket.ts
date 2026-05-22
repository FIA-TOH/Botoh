import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '../config/environment';

interface UseSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    autoConnect = true,
    reconnectAttempts = config.reconnectAttempts,
    reconnectDelay = config.reconnectDelay,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    const socket = io(config.pitwallWsUrl, {
      autoConnect,
      reconnection: true,
      reconnectionAttempts: reconnectAttempts,
      reconnectionDelay: reconnectDelay,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to backend server');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('Disconnected from backend server:', reason);
    });

    socket.on('connect_error', (error) => {
      setError(error.message);
      console.error('Connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_failed', () => {
      setError('Failed to reconnect to server');
      console.error('Failed to reconnect');
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [autoConnect, reconnectAttempts, reconnectDelay]);

  const connect = () => {
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const emit = (event: string, data: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};

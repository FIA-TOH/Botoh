'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '@/config/environment';
import { useAuth } from './useAuth';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  userId: string;
  senderUserId: string | null;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  readAt: string | null;
}

function shouldHideAfterRead(notification: AppNotification) {
  return notification.metadata?.action === 'driver_contract_released';
}

export function useNotifications() {
  const { token, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadNotifications = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        headers: authHeaders,
      });
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [authHeaders, token]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!token) return;

    let wasUnread = false;
    setNotifications((current) =>
      current.flatMap((notification) => {
        if (notification.id !== notificationId) return [notification];

        wasUnread = !notification.isRead;
        const readNotification = {
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? new Date().toISOString(),
        };

        return shouldHideAfterRead(notification) ? [] : [readNotification];
      }),
    );
    setUnreadCount((count) => Math.max(0, count - (wasUnread ? 1 : 0)));

    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: authHeaders,
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      loadNotifications();
    }
  }, [authHeaders, loadNotifications, token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    setNotifications((current) =>
      current
        .map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? new Date().toISOString(),
        }))
        .filter((notification) => !shouldHideAfterRead(notification)),
    );
    setUnreadCount(0);

    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: authHeaders,
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      loadNotifications();
    }
  }, [authHeaders, loadNotifications, token]);

  const sendNotification = useCallback(async (input: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
  }) => {
    if (!token) return { success: false };

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      return response.json();
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false };
    }
  }, [authHeaders, token]);

  const respondToDriverProposal = useCallback(async (
    proposalId: string,
    decision: 'accept' | 'decline',
  ) => {
    if (!token) return { success: false };

    try {
      const response = await fetch(`/api/garage/driver-proposals/${proposalId}/respond`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decision }),
      });
      const data = await response.json();
      await loadNotifications();
      return data;
    } catch (error) {
      console.error('Failed to respond to driver proposal:', error);
      return { success: false };
    }
  }, [authHeaders, loadNotifications, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadNotifications();
  }, [isAuthenticated, loadNotifications, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket: Socket = io(config.wsUrl, {
      reconnection: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('notifications:join', { token });
    });

    socket.on('notifications:new', (notification: AppNotification) => {
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ].slice(0, 50));
      setUnreadCount((count) => count + (notification.isRead ? 0 : 1));
    });

    socket.on('notifications:unreadCount', (data: { unreadCount?: number }) => {
      setUnreadCount(data.unreadCount ?? 0);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token]);

  return {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification,
    respondToDriverProposal,
  };
}

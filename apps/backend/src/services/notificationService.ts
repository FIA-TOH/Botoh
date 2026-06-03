import { Server as SocketIOServer } from 'socket.io';
import { query, queryMany, queryOne } from '../config/database';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
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

export interface CreateNotificationInput {
  userId: string;
  senderUserId?: string | null;
  title: string;
  message: string;
  type?: NotificationType;
  metadata?: Record<string, any>;
}

class NotificationService {
  private io: SocketIOServer | null = null;

  setSocketServer(io: SocketIOServer) {
    this.io = io;
  }

  async listForUser(userId: string): Promise<Notification[]> {
    return queryMany<Notification>(
      `SELECT
        id,
        user_id AS "userId",
        sender_user_id AS "senderUserId",
        title,
        message,
        type,
        CASE
          WHEN metadata->>'action' = 'driver_contract_proposal'
           AND EXISTS (
             SELECT 1
             FROM driver_contract_proposals proposal
             WHERE proposal.id = (metadata->>'proposalId')::uuid
               AND proposal.status = 'pending'
           )
          THEN false
          ELSE is_read
        END AS "isRead",
        metadata,
        created_at AS "createdAt",
        read_at AS "readAt"
      FROM notifications
      WHERE user_id = $1
        AND COALESCE(metadata->>'action', '') <> 'driver_contract_proposal_answered'
        AND NOT (
          COALESCE(metadata->>'action', '') = 'driver_contract_released'
          AND is_read = true
        )
      ORDER BY created_at DESC
      LIMIT 50`,
      [userId],
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM notifications
       WHERE user_id = $1
         AND (
           is_read = false
           OR (
             metadata->>'action' = 'driver_contract_proposal'
             AND EXISTS (
               SELECT 1
               FROM driver_contract_proposals proposal
               WHERE proposal.id = (metadata->>'proposalId')::uuid
                 AND proposal.status = 'pending'
             )
           )
         )`,
      [userId],
    );

    return Number(result?.count ?? 0);
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const notification = await queryOne<Notification>(
      `INSERT INTO notifications (user_id, sender_user_id, title, message, type, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
        id,
        user_id AS "userId",
        sender_user_id AS "senderUserId",
        title,
        message,
        type,
        is_read AS "isRead",
        metadata,
        created_at AS "createdAt",
        read_at AS "readAt"`,
      [
        input.userId,
        input.senderUserId ?? null,
        input.title,
        input.message,
        input.type ?? 'info',
        JSON.stringify(input.metadata ?? {}),
      ],
    );

    if (!notification) {
      throw new Error('Failed to create notification');
    }

    this.io?.to(this.getUserRoom(input.userId)).emit('notifications:new', notification);
    this.emitUnreadCount(input.userId).catch((error) => {
      console.error('Failed to emit unread notification count:', error);
    });

    return notification;
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification | null> {
    const currentNotification = await queryOne<Notification & { proposalStatus?: string | null }>(
      `SELECT
        notifications.id,
        notifications.user_id AS "userId",
        notifications.sender_user_id AS "senderUserId",
        notifications.title,
        notifications.message,
        notifications.type,
        notifications.is_read AS "isRead",
        notifications.metadata,
        notifications.created_at AS "createdAt",
        notifications.read_at AS "readAt",
        driver_contract_proposals.status AS "proposalStatus"
       FROM notifications
       LEFT JOIN driver_contract_proposals
         ON driver_contract_proposals.id = (notifications.metadata->>'proposalId')::uuid
        AND notifications.metadata->>'action' = 'driver_contract_proposal'
       WHERE notifications.id = $1
         AND notifications.user_id = $2`,
      [notificationId, userId],
    );

    if (!currentNotification) return null;

    if (
      currentNotification.metadata?.action === 'driver_contract_proposal'
      && (currentNotification.proposalStatus ?? 'pending') === 'pending'
    ) {
      await query(
        `UPDATE notifications
         SET is_read = false, read_at = NULL
         WHERE id = $1 AND user_id = $2`,
        [notificationId, userId],
      );
      currentNotification.isRead = false;
      currentNotification.readAt = null;
      const { proposalStatus: _proposalStatus, ...notification } = currentNotification;
      await this.emitUnreadCount(userId);
      return notification;
    }

    const notification = await queryOne<Notification>(
      `UPDATE notifications
       SET is_read = true, read_at = COALESCE(read_at, NOW())
       WHERE id = $1 AND user_id = $2
       RETURNING
        id,
        user_id AS "userId",
        sender_user_id AS "senderUserId",
        title,
        message,
        type,
        is_read AS "isRead",
        metadata,
        created_at AS "createdAt",
        read_at AS "readAt"`,
      [notificationId, userId],
    );

    if (notification?.metadata?.action === 'driver_contract_released') {
      await query(
        'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
        [notificationId, userId],
      );
    }

    await this.emitUnreadCount(userId);
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await query(
      `UPDATE notifications
       SET is_read = true, read_at = COALESCE(read_at, NOW())
       WHERE user_id = $1
         AND is_read = false
         AND NOT (
           metadata->>'action' = 'driver_contract_proposal'
           AND EXISTS (
             SELECT 1
             FROM driver_contract_proposals proposal
             WHERE proposal.id = (metadata->>'proposalId')::uuid
               AND proposal.status = 'pending'
           )
         )`,
      [userId],
    );

    await query(
      `DELETE FROM notifications
       WHERE user_id = $1
         AND is_read = true
         AND metadata->>'action' = 'driver_contract_released'`,
      [userId],
    );

    await this.emitUnreadCount(userId);
  }

  async emitUnreadCount(userId: string): Promise<void> {
    const unreadCount = await this.getUnreadCount(userId);
    this.io?.to(this.getUserRoom(userId)).emit('notifications:unreadCount', { unreadCount });
  }

  getUserRoom(userId: string): string {
    return `user:${userId}`;
  }
}

export default new NotificationService();

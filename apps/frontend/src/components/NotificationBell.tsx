'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AppSnackbar, useAppSnackbar } from '@/components/AppSnackbar';
import { requiresNotificationAction, useNotifications } from '@/hooks/useNotifications';
import { useTranslations } from '@/i18n';

function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
    </svg>
  );
}

function notificationClasses(type: string, isRead: boolean) {
  if (isRead) return { item: 'bg-transparent', dot: 'bg-gray-400' };

  if (type === 'success') return { item: 'bg-emerald-600/25', dot: 'bg-emerald-400' };
  if (type === 'warning') return { item: 'bg-amber-500/25', dot: 'bg-amber-300' };
  if (type === 'error') return { item: 'bg-[#AF0034]/25', dot: 'bg-[#FF232B]' };
  return { item: 'bg-blue-600/25', dot: 'bg-blue-300' };
}

export function NotificationBell() {
  const { t, language } = useTranslations();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    respondToDriverProposal,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [respondingProposalId, setRespondingProposalId] = useState<string | null>(null);
  const { snackbar, showSnackbar, closeSnackbar } = useAppSnackbar();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat(language, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative flex h-10 w-10 items-center justify-center rounded border-2 border-white bg-[#AF0034] text-white shadow-lg transition hover:bg-[#d4003f] sm:h-11 sm:w-11"
        aria-label={t.notifications.open}
        title={t.notifications.open}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-white px-1.5 py-0.5 text-xs font-bold text-[#AF0034]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded border border-white/20 bg-[#101015] text-left text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-bold uppercase">{t.notifications.title}</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-gray-300 hover:text-white"
              >
                {t.notifications.markAllRead}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <p className="px-4 py-6 text-center text-sm text-gray-300">{t.common.loading}</p>
            )}

            {!isLoading && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-300">{t.notifications.empty}</p>
            )}

            {!isLoading && notifications.map((notification) => {
              const classes = notificationClasses(notification.type, notification.isRead);
              const isResponding = respondingProposalId === notification.metadata?.proposalId;
              const needsAction = requiresNotificationAction(notification);

              return (
              <div
                key={notification.id}
                className={`border-b border-white/10 px-4 py-3 transition hover:bg-white/10 ${classes.item}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!notification.isRead && !needsAction) markAsRead(notification.id);
                  }}
                  className={`block w-full text-left ${needsAction ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-start gap-3">
                  {!notification.isRead && (
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${classes.dot}`} aria-label={t.notifications.unread} />
                  )}
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold">{notification.title}</p>
                      <p className="mt-1 break-words text-sm text-gray-300">{notification.message}</p>
                      <p className="mt-2 text-xs text-gray-500">{formatDate(notification.createdAt)}</p>
                    </div>
                  </div>
                </button>

                {needsAction && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isResponding}
                      onClick={async () => {
                        setRespondingProposalId(notification.metadata.proposalId);
                        try {
                          const result = await respondToDriverProposal(notification.metadata.proposalId, 'decline');
                          if (result.success) {
                            markAsRead(notification.id);
                            showSnackbar(t.notifications.proposalDeclined, 'success');
                          } else {
                            showSnackbar(result.message ?? t.notifications.actionFailed, 'error');
                          }
                        } finally {
                          setRespondingProposalId(null);
                        }
                      }}
                      className="bg-gray-700 px-3 py-2 text-xs font-bold uppercase hover:bg-gray-600 disabled:cursor-wait disabled:opacity-70"
                    >
                      {t.notifications.decline}
                    </button>
                    <button
                      type="button"
                      disabled={isResponding}
                      onClick={async () => {
                        setRespondingProposalId(notification.metadata.proposalId);
                        try {
                          const result = await respondToDriverProposal(notification.metadata.proposalId, 'accept');
                          if (result.success) {
                            markAsRead(notification.id);
                            showSnackbar(t.notifications.proposalAccepted, 'success');
                          } else {
                            showSnackbar(result.message ?? t.notifications.actionFailed, 'error');
                          }
                        } finally {
                          setRespondingProposalId(null);
                        }
                      }}
                      className="bg-[#FF232B] px-3 py-2 text-xs font-bold uppercase hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
                    >
                      {isResponding ? t.common.loading : t.notifications.accept}
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      <AppSnackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.isOpen}
        onClose={closeSnackbar}
      />
    </div>
  );
}

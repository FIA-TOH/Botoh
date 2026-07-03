'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/i18n';
import { FtohButton } from './FtohButton';
import { NotificationBell } from './NotificationBell';

interface FtohHeaderProps {
  onLogout?: () => void;
  onAdminClick?: () => void;
  onPublicHostAdminClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backText?: string | null;
  align?: 'left' | 'right' | 'center';
}

export function FtohHeader({
  onLogout,
  onAdminClick,
  onPublicHostAdminClick,
  showBackButton = false,
  onBackClick,
  backText,
  align = 'left',
}: FtohHeaderProps) {
  const { user } = useAuth();
  const { t } = useTranslations();
  const resolvedBackText = backText === null ? null : (backText ?? t.common.back);

  const content = (
    <div className="flex max-w-full flex-wrap items-center justify-end gap-2 sm:gap-4">
      {user?.role === 'admin' && onAdminClick && (
        <FtohButton onClick={onAdminClick} className="!w-auto px-3 py-2 text-xs sm:px-6 sm:py-3 sm:text-base">
          {t.common.admin}
        </FtohButton>
      )}

      {user?.role === 'admin' && onPublicHostAdminClick && (
        <FtohButton onClick={onPublicHostAdminClick} className="!w-auto px-3 py-2 text-xs sm:px-6 sm:py-3 sm:text-base">
          {t.common.publicHostAdmin}
        </FtohButton>
      )}

      <div className="min-w-0 max-w-[8rem] text-right sm:min-w-[120px] sm:max-w-none">
        <p className="hidden text-sm text-gray-400 sm:block">{t.common.loggedAs}</p>
        <p className="truncate text-sm font-semibold sm:text-base">{user?.username}</p>
      </div>

      <NotificationBell />

      {onLogout && (
        <FtohButton onClick={onLogout} className="!w-auto px-3 py-2 text-xs sm:px-6 sm:py-3 sm:text-base">
          {t.common.logout}
        </FtohButton>
      )}
    </div>
  );

  if (!showBackButton) {
    const alignmentClass = align === 'right'
      ? 'justify-end'
      : align === 'center'
        ? 'justify-center'
        : 'justify-start';

    return (
      <div className={`flex ${alignmentClass} items-center`}>
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <FtohButton onClick={onBackClick} className="!w-auto px-3 py-2 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {resolvedBackText && <span>{resolvedBackText}</span>}
          </div>
        </FtohButton>
      </div>

      {content}
    </div>
  );
}

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/i18n';
import { FtohButton } from './FtohButton';
import { NotificationBell } from './NotificationBell';

interface FtohHeaderProps {
  onLogout?: () => void;
  onAdminClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backText?: string;
  align?: 'left' | 'right' | 'center';
}

export function FtohHeader({
  onLogout,
  onAdminClick,
  showBackButton = false,
  onBackClick,
  backText,
  align = 'left',
}: FtohHeaderProps) {
  const { user } = useAuth();
  const { t } = useTranslations();
  const resolvedBackText = backText ?? t.common.back;

  const content = (
    <div className="flex items-center gap-4">
      {user?.role === 'admin' && onAdminClick && (
        <FtohButton onClick={onAdminClick} className="w-auto px-6">
          {t.common.admin}
        </FtohButton>
      )}

      <div className="text-right min-w-[120px]">
        <p className="text-sm text-gray-400">{t.common.loggedAs}</p>
        <p className="font-semibold">{user?.username}</p>
      </div>

      <NotificationBell />

      {onLogout && (
        <FtohButton onClick={onLogout} className="w-auto px-6">
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
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <FtohButton onClick={onBackClick} className="w-auto px-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {resolvedBackText}
          </div>
        </FtohButton>
      </div>

      {content}
    </div>
  );
}

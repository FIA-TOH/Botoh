'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FtohButton } from './FtohButton';

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
  backText = 'Voltar',
  align = 'left'
}: FtohHeaderProps) {
  const { user } = useAuth();

  // Content to render (user info and actions)
  const content = (
    <div className="flex items-center gap-4">
      {/* Admin button (only show for admin users) */}
      {user?.role === 'admin' && onAdminClick && (
        <FtohButton onClick={onAdminClick} className="w-auto px-6">
          Administração
        </FtohButton>
      )}
      
      {/* User info */}
      <div className="text-right min-w-[120px]">
        <p className="text-sm text-gray-400">Logado como:</p>
        <p className="font-semibold">{user?.username}</p>
      </div>
      
      {/* Logout button */}
      {onLogout && (
        <FtohButton onClick={onLogout} className="w-auto px-6">
          Logout
        </FtohButton>
      )}
    </div>
  );

  // If no back button, just return the content with alignment
  if (!showBackButton) {
    const alignmentClass = align === 'right' ? 'justify-end' : 
                          align === 'center' ? 'justify-center' : 'justify-start';
    
    return (
      <div className={`flex ${alignmentClass} items-center`}>
        {content}
      </div>
    );
  }

  // If back button is shown, use justify-between layout
  return (
    <div className="flex justify-between items-center">
      {/* Left side - Back button */}
      <div className="flex items-center gap-4">
        <FtohButton onClick={onBackClick} className="w-auto px-6">
          <div className="flex items-center gap-2">
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            {backText}
          </div>
        </FtohButton>
      </div>

      {/* Right side - User info and actions */}
      {content}
    </div>
  );
}

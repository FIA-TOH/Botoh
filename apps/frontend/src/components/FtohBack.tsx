'use client';

import React from 'react';
import { FtohButton } from './FtohButton';

interface FtohBackProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function FtohBack({ onClick, className = '', children }: FtohBackProps) {
  return (
    <FtohButton 
      onClick={onClick}
      className={`w-auto px-6 ${className}`}
    >
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
        {children || 'Voltar'}
      </div>
    </FtohButton>
  );
}

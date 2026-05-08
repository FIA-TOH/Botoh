'use client';

import React from 'react';

interface FtohButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function FtohButton({ 
  children, 
  loading = false, 
  loadingText = 'Carregando...', 
  className = '', 
  disabled,
  ...props 
}: FtohButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`w-full py-3 px-4 hover:bg-red-700 disabled:bg-red-500 disabled:cursor-not-allowed text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center ${className}`}
      style={{ backgroundColor: '#FF232B' }}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

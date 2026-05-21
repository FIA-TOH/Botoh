'use client';

import React from 'react';

interface FtohInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: 'red' | 'white';
}

export function FtohInput({ label, className = '', variant = 'red', ...props }: FtohInputProps) {
  const isWhite = variant === 'white';
  
  return (
    <div className={`w-full ${label ? 'space-y-2' : ''}`}>
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 focus:outline-none focus:ring-2 transition-all ${isWhite ? 'placeholder:text-gray-500' : ''} ${className}`}
        style={{ 
          backgroundColor: '#1E1E1E',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: isWhite ? '#FFFFFF' : '#FF232B',
          borderRadius: '0',
          color: isWhite ? '#FFFFFF' : '#FFFFFF',
        }}
        {...props}
        onFocus={(e) => {
          e.currentTarget.style.borderWidth = '1.5px';
          if (isWhite) {
            e.currentTarget.style.borderColor = '#CCCCCC';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderWidth = '2px';
          e.currentTarget.style.borderColor = isWhite ? '#FFFFFF' : '#FF232B';
        }}
      />
    </div>
  );
}

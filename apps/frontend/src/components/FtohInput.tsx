'use client';

import React from 'react';

interface FtohInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function FtohInput({ label, className = '', ...props }: FtohInputProps) {
  return (
    <div className={label ? 'space-y-2' : ''}>
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border-4 text-white placeholder-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${className}`}
        style={{ 
          backgroundColor: 'transparent',
          borderColor: '#FF232B'
        }}
        {...props}
        onFocus={(e) => e.currentTarget.style.borderWidth = '1.5px'}
        onBlur={(e) => e.currentTarget.style.borderWidth = '4px'}
      />
    </div>
  );
}

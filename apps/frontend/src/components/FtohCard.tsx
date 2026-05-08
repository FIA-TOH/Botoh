'use client';

import React from 'react';

interface FtohCardProps {
  title: string;
  children: React.ReactNode;
}

export function FtohCard({ title, children }: FtohCardProps) {
  return (
    <div className="max-w-md w-full relative z-10 pointer-events-auto">
      {/* Title Container */}
      <div className="text-center mb-4 py-2" style={{ backgroundColor: '#FF232B' }}>
        <h2 className="text-[64px] font-bold text-white">
          {title}
        </h2>
      </div>

      {/* Form Container */}
      <div className="space-y-6 p-6" style={{ 
        backgroundColor: 'rgba(255, 255, 238, 0.67)', 
        outline: '16px solid #FF232B', 
        opacity: 1 
      }}>
        {children}
      </div>
    </div>
  );
}

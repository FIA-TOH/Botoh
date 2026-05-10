'use client';

import React from 'react';

interface FtohCardProps {
  title: string;
  children?: React.ReactNode;
  onClick?: () => void;
  hoverImage?: boolean;
  clickSound?: string;
}

export function FtohCard({ title, children, onClick, hoverImage = false, clickSound }: FtohCardProps) {
  
  const handleClick = async () => {
    if (onClick && clickSound) {
      // Play click sound
      const audio = new Audio(clickSound);
      audio.play();
      
      // Wait for sound to finish before navigating
      await new Promise(resolve => {
        audio.addEventListener('ended', resolve);
        // Fallback after 2 seconds
        setTimeout(resolve, 2000);
      });
      
      // Execute original onClick after sound
      onClick();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`max-w-md w-full relative z-10 pointer-events-auto ${onClick && !hoverImage ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      {/* Title Container */}
      <div className="text-center mb-4 py-2" style={{ backgroundColor: '#FF232B' }}>
        <h2 className="text-[64px] font-bold text-white">
          {title}
        </h2>
      </div>

      {/* Form Container */}
      <div className={`${hoverImage ? '' : 'p-6'}`} style={{ 
        backgroundColor: 'rgba(255, 255, 238, 0.67)', 
        outline: '16px solid #FF232B', 
        opacity: 1 
      }}>
        {hoverImage ? (
          <div className="overflow-hidden">
            <div className={`${onClick ? 'hover:scale-110 transition-transform duration-300' : ''}`}>
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

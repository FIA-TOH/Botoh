'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FtohButton } from '@/components/FtohButton';
import { FtohCard } from '@/components/FtohCard';
import { FtohHeader } from '@/components/FtohHeader';

function ProtectedHome() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  // Debug: Check user role
  console.log('User data:', user);
  console.log('User role:', user?.role);
  console.log('Is admin?', user?.role === 'admin');

  const handleGarageClick = () => {
    // Garagem button - show loading then do nothing
    setLoadingButton('garage');
    setTimeout(() => {
      setLoadingButton(null);
      console.log('Garagem clicked - no action');
    }, 1000); // Show loading for 1 second
  };

  const handlePitWallClick = () => {
    // Navigate to pit wall page
    setLoadingButton('pit-wall');
    router.push('/pit-wall');
  };

  const handleAdminClick = () => {
    // Navigate to admin page
    setLoadingButton('admin');
    router.push('/admin');
  };

  const handleLogout = () => {
    logout();
  };

  return React.createElement('main', { 
    className: "h-screen bg-cover bg-center bg-no-repeat text-white relative overflow-hidden", 
    style: { backgroundImage: 'url(/img/bg/loginbg.png)' }
  },
    // Black overlay with 29% opacity
    React.createElement('div', { 
      className: "absolute inset-0 bg-black pointer-events-none", 
      style: { opacity: 0.29 } 
    }),
    
    // Red block rotated -45 degrees and centered on screen with 67% opacity
    React.createElement('div', { 
      className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none", 
      style: { 
        backgroundColor: '#AF0034', 
        opacity: 0.67,
        width: '100%',
        height: '100%',
        transform: 'translate(-50%, -50%) rotate(-45deg)'
      } 
    }),
    
    React.createElement('div', { className: "absolute inset-0 flex flex-col relative z-10" },
      // Header with user info and logout
      React.createElement('div', { className: "p-8" },
        React.createElement(FtohHeader, {
          onLogout: handleLogout,
          onAdminClick: handleAdminClick,
          align: 'right'
        })
      ),
      
      // Main cards section - centered vertically and horizontally
      React.createElement('div', { className: "flex-1 flex justify-center items-center gap-8 flex-wrap px-8" },
        // Garagem Card
        React.createElement(FtohCard, { 
          title: 'GARAGEM',
          onClick: handleGarageClick,
          hoverImage: true,
          clickSound: '/sounds/garagein.mp3'
        }, [
          React.createElement('img', { 
            key: 'garage-img',
            src: '/img/img/garage.png',
            alt: 'Garagem',
            className: "w-full h-auto object-contain"
          })
        ]),
        
        // Pit Wall Card (Pit Wall)
        React.createElement(FtohCard, { 
          title: 'PIT WALL',
          onClick: handlePitWallClick,
          hoverImage: true,
          clickSound: '/sounds/pitwallin.mp3'
        }, [
          React.createElement('img', { 
            key: 'pitwall-img',
            src: '/img/img/pitwall.png',
            alt: 'Pit Wall',
            className: "w-full h-auto object-contain"
          })
        ])
      )
    )
  );
}


export default function Home() {
  const { isLoading, isAuthenticated } = useAuth();
  const [loadingEndTime, setLoadingEndTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (isLoading && loadingEndTime === null) {
      // Loading started - set the minimum end time (now + 700ms)
      setLoadingEndTime(Date.now() + 700);
    } else if (!isLoading && loadingEndTime !== null) {
      // Loading finished - check if we need to wait more
      const remaining = loadingEndTime - Date.now();
      if (remaining <= 0) {
        // Minimum time already passed, clear the end time
        setLoadingEndTime(null);
      } else {
        // Still need to wait, set timeout to clear
        const timer = setTimeout(() => {
          setLoadingEndTime(null);
        }, remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, loadingEndTime]);

  // Show loading when isLoading is true or when we haven't reached the minimum end time
  const showLoading = isLoading || loadingEndTime !== null;

  if (showLoading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative overflow-hidden" style={{ backgroundImage: 'url(/img/bg/loginbg.png)' }}>
        {/* Black overlay with 29% opacity */}
        <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: 0.29 }}></div>
        
        {/* Red block animation from login style to current style */}
        <div 
          className={`absolute pointer-events-none transition-all duration-700 ease-in-out ${
            loadingEndTime !== null 
              ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
              : 'top-0 right-0'
          }`} 
          style={{ 
            backgroundColor: '#AF0034', 
            opacity: 0.67,
            width: loadingEndTime !== null ? '100%' : '50%',
            height: '100%',
            transform: loadingEndTime !== null 
              ? 'translate(-50%, -50%) rotate(-45deg)' 
              : 'none'
          }} 
        ></div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <ProtectedHome />;
}

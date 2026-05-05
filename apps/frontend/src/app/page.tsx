'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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

  const handleRaceControlClick = () => {
    // Navigate to race control page
    setLoadingButton('race-control');
    router.push('/race-control');
  };

  const handleAdminClick = () => {
    // Navigate to admin page
    setLoadingButton('admin');
    router.push('/admin');
  };

  const handleLogout = () => {
    logout();
  };

  return React.createElement('main', { className: "min-h-screen bg-gray-900 text-white p-8" },
    React.createElement('div', { className: "max-w-4xl mx-auto" },
      // Header with user info and logout
      React.createElement('div', { className: "flex justify-between items-center mb-12" },
        React.createElement('div', null,
          React.createElement('h1', { className: "text-4xl font-bold" }, 'FTOH Haxball Bot'),
          React.createElement('p', { className: "text-gray-300" }, 'Formula ToH Racing System')
        ),
        React.createElement('div', { className: "flex items-center gap-4" },
          React.createElement('div', { className: "text-right" },
            React.createElement('p', { className: "text-sm text-gray-400" }, 'Logged in as'),
            React.createElement('p', { className: "font-semibold" }, user?.username)
          ),
          React.createElement('button', {
            onClick: handleLogout,
            className: "px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          }, 'Logout')
        )
      ),
      
      // Main buttons section
      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-8 mt-16" },
        // Garagem button
        React.createElement('div', { className: "flex flex-col items-center" },
          React.createElement('button', {
            onClick: handleGarageClick,
            disabled: loadingButton !== null,
            className: `w-48 h-48 rounded-lg transition-colors flex flex-col items-center justify-center gap-4 ${
              loadingButton === 'garage' 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`
          },
            loadingButton === 'garage' ? (
              React.createElement('div', { className: "flex flex-col items-center gap-4" },
                React.createElement('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-white" }),
                React.createElement('span', { className: "text-xl font-semibold" }, 'Carregando...')
              )
            ) : [
              React.createElement('svg', {
                key: 'icon',
                className: "w-16 h-16",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24"
              },
                React.createElement('path', {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                })
              ),
              React.createElement('span', { key: 'text', className: "text-xl font-semibold" }, 'Garagem')
            ]
          ),
          React.createElement('p', { className: "text-gray-400 text-center mt-4" }, 'Sua garagem de carros')
        ),
        
        // Race Control button
        React.createElement('div', { className: "flex flex-col items-center" },
          React.createElement('button', {
            onClick: handleRaceControlClick,
            disabled: loadingButton !== null,
            className: `w-48 h-48 rounded-lg transition-colors flex flex-col items-center justify-center gap-4 ${
              loadingButton === 'race-control' 
                ? 'bg-blue-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`
          },
            loadingButton === 'race-control' ? (
              React.createElement('div', { className: "flex flex-col items-center gap-4" },
                React.createElement('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-white" }),
                React.createElement('span', { className: "text-xl font-semibold" }, 'Carregando...')
              )
            ) : [
              React.createElement('svg', {
                key: 'icon',
                className: "w-16 h-16",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24"
              },
                React.createElement('path', {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                })
              ),
              React.createElement('span', { key: 'text', className: "text-xl font-semibold" }, 'Race Control')
            ]
          ),
          React.createElement('p', { className: "text-gray-400 text-center mt-4" }, 'Gerenciar corridas e chat')
        ),
        
        // Admin button (only show for admin users)
        user?.role === 'admin' && React.createElement('div', { className: "flex flex-col items-center" },
          React.createElement('button', {
            onClick: handleAdminClick,
            disabled: loadingButton !== null,
            className: `w-48 h-48 rounded-lg transition-colors flex flex-col items-center justify-center gap-4 ${
              loadingButton === 'admin' 
                ? 'bg-purple-500 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`
          },
            loadingButton === 'admin' ? (
              React.createElement('div', { className: "flex flex-col items-center gap-4" },
                React.createElement('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-white" }),
                React.createElement('span', { className: "text-xl font-semibold" }, 'Carregando...')
              )
            ) : [
              React.createElement('svg', {
                key: 'icon',
                className: "w-16 h-16",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24"
              },
                React.createElement('path', {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                }),
                React.createElement('path', {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: "2",
                  d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                })
              ),
              React.createElement('span', { key: 'text', className: "text-xl font-semibold" }, 'Administração')
            ]
          ),
          React.createElement('p', { className: "text-gray-400 text-center mt-4" }, 'Painel administrativo')
        )
      )
    )
  );
}


export default function Home() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
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

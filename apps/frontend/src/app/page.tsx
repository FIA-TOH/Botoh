'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FtohButton } from '@/components/FtohButton';
import { FtohCard } from '@/components/FtohCard';
import { FtohHeader } from '@/components/FtohHeader';
import { useTranslations } from '@/i18n';

function ProtectedHome() {
  const { user, logout } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  // Debug: Check user role
  console.log('User data:', user);
  console.log('User role:', user?.role);
  console.log('Is admin?', user?.role === 'admin');

  const handleGarageClick = () => {
    setLoadingButton('garage');
    router.push('/garage');
  };

  const handlePitWallClick = () => {
    setLoadingButton('pit-wall');
    router.push('/pit-wall');
  };

  const handleAdminClick = () => {
    setLoadingButton('admin');
    router.push('/admin');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <main
      className="h-screen bg-cover bg-center bg-no-repeat text-white relative overflow-hidden"
      style={{ backgroundImage: 'url(/img/bg/loginbg.png)' }}
    >
      {/* Black overlay with 29% opacity */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: 0.29 }}
      />

      {/* Red block rotated -45 degrees and centered on screen with 67% opacity */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          backgroundColor: '#AF0034',
          opacity: 0.67,
          width: '100%',
          height: '100%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
        }}
      />

      <div className="absolute inset-0 flex flex-col relative z-10">
        {/* Header with user info and logout */}
        <div className="p-8">
          <FtohHeader
            onLogout={handleLogout}
            onAdminClick={handleAdminClick}
            align="right"
          />
        </div>

        {/* Main cards section */}
        <div className="flex-1 flex justify-center items-center gap-8 flex-wrap px-8">
          {/* Garagem Card */}
          <FtohCard
            title={t.common.garage}
            onClick={handleGarageClick}
            hoverImage
            clickSound="/sounds/garagein.mp3"
          >
            <img
              src="/img/img/garage.png"
              alt={t.common.garage}
              className="w-full h-auto object-contain"
            />
          </FtohCard>

          {/* Pit Wall Card */}
          <FtohCard
            title={t.common.pitWall}
            onClick={handlePitWallClick}
            hoverImage
            clickSound="/sounds/pitwallin.mp3"
          >
            <img
              src="/img/img/pitwall.png"
              alt={t.common.pitWall}
              className="w-full h-auto object-contain"
            />
          </FtohCard>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  const { isLoading, isAuthenticated } = useAuth();
  const { t } = useTranslations();

  const [loadingEndTime, setLoadingEndTime] = React.useState<number | null>(
    null
  );

  React.useEffect(() => {
    if (isLoading && loadingEndTime === null) {
      setLoadingEndTime(Date.now() + 700);
    } else if (!isLoading && loadingEndTime !== null) {
      const remaining = loadingEndTime - Date.now();

      if (remaining <= 0) {
        setLoadingEndTime(null);
      } else {
        const timer = setTimeout(() => {
          setLoadingEndTime(null);
        }, remaining);

        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, loadingEndTime]);

  const showLoading = isLoading || loadingEndTime !== null;

  if (showLoading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative overflow-hidden"
        style={{ backgroundImage: 'url(/img/bg/loginbg.png)' }}
      >
        {/* Black overlay */}
        <div
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: 0.29 }}
        />

        {/* Red block animation */}
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
            transform:
              loadingEndTime !== null
                ? 'translate(-50%, -50%) rotate(-45deg)'
                : 'none',
          }}
        />

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />

          <p className="text-gray-300">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <ProtectedHome />;
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FtohCard } from '@/components/FtohCard';
import { FtohHeader } from '@/components/FtohHeader';
import { useTranslations } from '@/i18n';

function ProtectedHome() {
  const { logout } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  const handleGarageClick = () => {
    setLoadingButton('garage');
    router.push('/garage');
  };

  const handlePitWallClick = () => {
    setLoadingButton('pit-wall');
    router.push('/pit-wall');
  };

  const handleMarketClick = () => {
    setLoadingButton('market');
    router.push('/market');
  };

  const handleAdminClick = () => {
    setLoadingButton('admin');
    router.push('/admin');
  };

  const handlePublicHostAdminClick = () => {
    setLoadingButton('host-publico-admin');
    router.push('/host-publico-admin');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-cover bg-center bg-fixed bg-no-repeat text-white lg:h-screen lg:overflow-hidden"
      style={{ backgroundImage: 'url(/img/bg/loginbg.png)' }}
    >
      {/* Black overlay with 29% opacity */}
      <div
        className="fixed inset-0 bg-black pointer-events-none"
        style={{ opacity: 0.29 }}
      />

      {/* Red block rotated -45 degrees and centered on screen with 67% opacity */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform lg:block"
        style={{
          backgroundColor: '#AF0034',
          opacity: 0.67,
          width: '180vw',
          height: '130vh',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header with user info and logout */}
        <div className="relative z-20 px-6 py-6 sm:px-8 lg:absolute lg:left-0 lg:right-0 lg:top-0 lg:p-8">
          <FtohHeader
            onLogout={handleLogout}
            onAdminClick={handleAdminClick}
            onPublicHostAdminClick={handlePublicHostAdminClick}
            align="right"
          />
        </div>

        {/* Main cards section */}
        <div className="flex min-h-[calc(100vh-6rem)] w-full flex-col items-center justify-center gap-8 px-8 pb-10 pt-2 sm:px-12 md:px-16 lg:min-h-screen lg:flex-row lg:flex-nowrap lg:gap-[42px] lg:px-12 lg:py-8">
          {/* Garagem Card */}
          <FtohCard
            title={t.common.garage}
            onClick={handleGarageClick}
            hoverImage
            clickSound="/sounds/garagein.mp3"
            className="w-full !max-w-[20rem] sm:!max-w-[23rem] md:!max-w-[26rem] lg:min-w-0 lg:!max-w-[28rem] lg:flex-[1_1_0]"
          >
            <img
              src="/img/img/garage.png"
              alt={t.common.garage}
              className="h-full w-full object-cover"
            />
          </FtohCard>

          {/* Pit Wall Card */}
          <FtohCard
            title={t.common.pitWall}
            onClick={handlePitWallClick}
            hoverImage
            clickSound="/sounds/pitwallin.mp3"
            className="w-full !max-w-[20rem] sm:!max-w-[23rem] md:!max-w-[26rem] lg:min-w-0 lg:!max-w-[28rem] lg:flex-[1_1_0]"
          >
            <img
              src="/img/img/pitwall.png"
              alt={t.common.pitWall}
              className="h-full w-full object-cover"
            />
          </FtohCard>

          {/* Mercado Card */}
          <FtohCard
            title={t.common.market}
            onClick={handleMarketClick}
            hoverImage
            clickSound="/sounds/sell2.mp3"
            className="w-full !max-w-[20rem] sm:!max-w-[23rem] md:!max-w-[26rem] lg:min-w-0 lg:!max-w-[28rem] lg:flex-[1_1_0]"
          >
            <img
              src="/img/img/market.png"
              alt={t.common.market}
              className="h-full w-full object-cover"
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
          className={`pointer-events-none absolute hidden transition-all duration-700 ease-in-out lg:block ${
            loadingEndTime !== null
              ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              : 'top-0 right-0'
          }`}
          style={{
            backgroundColor: '#AF0034',
            opacity: 0.67,
            width: loadingEndTime !== null ? '180vw' : '50%',
            height: loadingEndTime !== null ? '130vh' : '100%',
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

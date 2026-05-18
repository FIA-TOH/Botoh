'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/i18n';
import { DriverCircle } from '@/components/pit-wall/DriverCircle';

export default function GaragePage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [missingTeamLogos, setMissingTeamLogos] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});

  const eligibleMemberships = (user?.teamMemberships ?? []).filter(
    (membership) =>
      membership.roles.includes('team_principal')
      || membership.roles.includes('team_assistant'),
  );
  const selectedTeamId = searchParams.get('teamId');
  const selectedMembership =
    eligibleMemberships.find((membership) => membership.teamId === selectedTeamId)
    ?? null;
  const selectedLogoSrc = selectedMembership
    ? `/img/scuderia/logos/${encodeURIComponent(
      selectedMembership.teamName.trim().toLowerCase(),
    )}.png`
    : null;
  const selectedLogoKey = selectedMembership?.teamId ?? '';
  const selectedLogoIsMissing = selectedLogoKey
    ? missingTeamLogos[selectedLogoKey]
    : false;
  const weatherMonitoringLevel = 2;
  const pitCrewLevel = 1;
  const maxFacilityLevel = 5;

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (!selectedMembership) {
    return (
      <main
        className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white"
        style={{ backgroundImage: 'url(/img/bg/garagewpp.png)' }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <button
          type="button"
          aria-label={t.common.back}
          onClick={goBack}
          className="absolute left-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF232B] text-white shadow-lg transition-transform hover:scale-105"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-xl text-center">
            <h1 className="mb-6 text-3xl font-bold uppercase">{t.garage.chooseScuderia}</h1>

            <div className="flex flex-wrap justify-center gap-4">
              {eligibleMemberships.map((membership) => {
                const logoSrc = `/img/scuderia/logos/${encodeURIComponent(
                  membership.teamName.trim().toLowerCase(),
                )}.png`;
                const hasMissingLogo = missingTeamLogos[membership.teamId];
                const hasLoadedLogo = loadedTeamLogos[membership.teamId];

                return (
                  <button
                    key={membership.teamId}
                    type="button"
                    onClick={() => router.push(`/garage?teamId=${membership.teamId}`)}
                    className="flex min-h-28 min-w-56 items-center justify-center border-8 border-[#FF0000] bg-[#1E1E1E] px-6 py-5 text-xl font-semibold transition-colors hover:border-white"
                  >
                    {!hasLoadedLogo && (
                      <span
                        aria-label={t.common.loading}
                        className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white"
                      />
                    )}

                    {hasMissingLogo ? (
                      membership.teamName
                    ) : (
                      <img
                        src={logoSrc}
                        alt={membership.teamName}
                        className={`h-20 max-w-52 object-contain ${hasLoadedLogo ? '' : 'absolute invisible'}`}
                        onLoad={() =>
                          setLoadedTeamLogos((current) => ({
                            ...current,
                            [membership.teamId]: true,
                          }))
                        }
                        onError={() =>
                          {
                            setMissingTeamLogos((current) => ({
                              ...current,
                              [membership.teamId]: true,
                            }));
                            setLoadedTeamLogos((current) => ({
                              ...current,
                              [membership.teamId]: true,
                            }));
                          }
                        }
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {eligibleMemberships.length === 0 && (
              <p className="bg-black/70 px-6 py-5 text-lg">
                {t.garage.noScuderiaAvailable}
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white"
      style={{ backgroundImage: 'url(/img/bg/garagewpp.png)' }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <button
        type="button"
        aria-label={t.common.back}
        onClick={goBack}
        className="absolute left-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF232B] text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative z-10 min-h-screen px-6 pb-8 pt-20 lg:px-16">
        <div className="mx-auto grid max-w-[1440px] gap-8">
          <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
            <section className="flex min-h-full flex-col border-8 border-[#FF0000] bg-[#1E1E1E] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold uppercase">{selectedMembership.teamName}</h1>
                <p>{t.garage.cash}: $35.400.000</p>
                <p>{t.garage.netPerRace}: $2.000.000</p>
                <p>{t.garage.expensesPerRace}: $2.000.000</p>
                <p className="mt-1 text-sm">{t.garage.weatherCenter}: 400.000</p>
                <p className="text-sm">{t.garage.pitCrew}: 200.000</p>
                <p className="text-sm">{t.garage.salaries}: 700.000</p>
                <p>{t.garage.profitPerRace}: $4.000.000</p>
                <p className="text-sm">{t.garage.sponsors}: $3.000.000</p>
              </div>

              {!selectedLogoIsMissing && selectedLogoSrc && (
                <img
                  src={selectedLogoSrc}
                  alt=""
                  className="h-16 w-16 object-contain"
                  onError={() =>
                    setMissingTeamLogos((current) => ({
                      ...current,
                      [selectedLogoKey]: true,
                    }))
                  }
                />
              )}
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto border-4 border-white/90 p-4 text-sm">
              <p>
                <span className="text-[#FF0000]">- 10.000.000</span>{' '}
                29/04/2026 15:46 - {t.garage.weatherCenterUpgrade}
              </p>
              <p className="mt-2">
                <span className="text-[#3DD56D]">+ 4.000.000</span>{' '}
                29/04/2026 15:46 - {t.garage.sponsorGain}
              </p>
            </div>
            </section>

            <div className="grid gap-8">
              <div className="grid gap-8 xl:grid-cols-3">
              <div className="grid gap-8">
                <section className="flex min-h-[180px] flex-col items-center justify-center border-8 border-[#FF0000] bg-[#1E1E1E] p-4 text-center">
                  <h2 className="text-2xl font-bold uppercase">{t.garage.engine}</h2>
                  <p className="mt-8 text-xl">{t.garage.comingSoon}</p>
                </section>

                <section className="flex min-h-[180px] flex-col items-center justify-center border-8 border-[#FF0000] bg-[#1E1E1E] p-4 text-center">
                  <h2 className="text-2xl font-bold uppercase">{t.garage.chassis}</h2>
                  <p className="mt-8 text-xl">{t.garage.comingSoon}</p>
                </section>
              </div>

              <section className="flex min-h-[392px] flex-col border-8 border-[#FF0000] bg-[#1E1E1E] p-4">
                <h2 className="flex min-h-14 items-center justify-center text-center text-lg font-bold uppercase">
                  {t.garage.weatherMonitoring}
                </h2>
                <div className="mt-2 min-h-[132px] border-4 border-[#FF0000]" />
                <div className="mt-4 text-center">
                  <p>{t.garage.centerLevel}</p>
                  <div className="mt-2 flex justify-center gap-2">
                    <span className="h-8 w-4 bg-sky-500" />
                    <span className="h-8 w-4 bg-sky-500" />
                    <span className="h-8 w-4 border-2 border-sky-500" />
                    <span className="h-8 w-4 border-2 border-sky-500" />
                    <span className="h-8 w-4 border-2 border-sky-500" />
                  </div>
                  <p className="mt-4">{t.garage.costPerRace}</p>
                  <p className="text-xl">$400.000</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-4 pt-4">
                  <button
                    disabled={weatherMonitoringLevel >= maxFacilityLevel}
                    className="min-w-[120px] flex-1 bg-[#FF0000] px-3 py-3 font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                  >
                    {t.garage.upgrade}
                  </button>
                  <button
                    disabled={weatherMonitoringLevel <= 1}
                    className="min-w-[120px] flex-1 bg-[#FF0000] px-3 py-3 font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                  >
                    {t.garage.sell}
                  </button>
                </div>
              </section>

              <section className="flex min-h-[392px] flex-col border-8 border-[#FF0000] bg-[#1E1E1E] p-4">
                <h2 className="flex min-h-14 items-center justify-center text-center text-2xl font-bold uppercase">
                  {t.garage.pitCrew}
                </h2>
                <div className="mt-2 min-h-[132px] border-4 border-[#FF0000]" />
                <div className="mt-4 text-center">
                  <p>{t.garage.teamLevel}</p>
                  <div className="mt-2 flex justify-center gap-2">
                    <span className="h-8 w-4 bg-amber-400" />
                    <span className="h-8 w-4 border-2 border-amber-400" />
                    <span className="h-8 w-4 border-2 border-amber-400" />
                    <span className="h-8 w-4 border-2 border-amber-400" />
                    <span className="h-8 w-4 border-2 border-amber-400" />
                  </div>
                  <p className="mt-4">{t.garage.costPerRace}</p>
                  <p className="text-xl">$200.000</p>
                </div>
                <div className="mt-auto flex flex-wrap gap-4 pt-4">
                  <button
                    disabled={pitCrewLevel >= maxFacilityLevel}
                    className="min-w-[120px] flex-1 bg-[#FF0000] px-3 py-3 font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                  >
                    {t.garage.upgrade}
                  </button>
                  <button
                    disabled={pitCrewLevel <= 1}
                    className="min-w-[120px] flex-1 bg-[#FF0000] px-3 py-3 font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                  >
                    {t.garage.sell}
                  </button>
                </div>
              </section>
              </div>

              <section className="min-h-[260px] border-8 border-[#FF0000] bg-[#1E1E1E] p-4">
                <div className="flex items-center gap-4">
                  {!selectedLogoIsMissing && selectedLogoSrc && (
                    <img
                      src={selectedLogoSrc}
                      alt=""
                      className="h-16 w-16 object-contain"
                      onError={() =>
                        setMissingTeamLogos((current) => ({
                          ...current,
                          [selectedLogoKey]: true,
                        }))
                      }
                    />
                  )}
                  <h2 className="text-4xl font-bold uppercase">SF-545</h2>
                </div>
              </section>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
            <section className="h-fit border-8 border-[#FF0000] bg-[#1E1E1E] p-6">
              <h2 className="text-2xl font-bold uppercase">{t.garage.drivers}</h2>

              <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { name: 'Joninho', number: 43, color: '#647FEA', occupied: true },
                  { name: 'Joninho', number: 43, color: '#647FEA', occupied: true },
                  { name: t.garage.freeSeat, number: '??', color: '#242424', occupied: false },
                  { name: t.garage.freeSeat, number: '??', color: '#242424', occupied: false },
                ].map((driver, index) => (
                  <div key={`${driver.name}-${index}`} className="flex h-full flex-col items-center text-center">
                    <p className="mb-3 font-bold uppercase">{driver.name}</p>
                    <DriverCircle number={driver.number} color={driver.color} />
                    {driver.occupied ? (
                      <>
                        <p className="mt-3 text-sm">{t.garage.contractEndsIn}: 8 {t.garage.races}</p>
                        <p className="text-sm">{t.garage.salary}: 4.500.000</p>
                        <button className="mt-auto bg-[#FF0000] px-4 py-3 font-bold uppercase">
                          {t.garage.release}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="mt-3 text-sm">---</p>
                        <p className="text-sm">---</p>
                        <button className="mt-auto bg-[#FF0000] px-4 py-3 font-bold uppercase">
                          {t.garage.hire}
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="border-8 border-[#FF0000] bg-[#1E1E1E] p-6">
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-4 text-center font-bold uppercase">{t.garage.titleSponsor}</h3>
                    <img
                      src="https://www.freepnglogos.com/uploads/apple-logo-png/apple-logo-png-index-content-uploads-10.png"
                      alt="HP"
                      className="mx-auto h-28 w-28 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="mb-4 text-center font-bold uppercase">{t.garage.mainPartner}</h3>
                    <div className="flex justify-center gap-6">
                      <img src="https://www.freepnglogos.com/uploads/apple-logo-png/apple-logo-png-index-content-uploads-10.png" alt="HP" className="h-20 w-20 object-contain" />
                      <img src="https://www.freepnglogos.com/uploads/apple-logo-png/apple-logo-png-index-content-uploads-10.png" alt="HP" className="h-20 w-20 object-contain" />
                    </div>
                  </div>
                </div>

                {[
                  { title: t.garage.officialPartner, count: 4 },
                  { title: t.garage.minorSponsor, count: 8 },
                  { title: t.garage.personalSponsor, count: 4 },
                ].map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-4 text-center font-bold uppercase">{group.title}</h3>
                    <div className="flex flex-wrap justify-center gap-5">
                      {Array.from({ length: group.count }).map((_, index) => (
                        <img
                          key={`${group.title}-${index}`}
                          src="https://www.freepnglogos.com/uploads/apple-logo-png/apple-logo-png-index-content-uploads-10.png"
                          alt="HP"
                          className="h-14 w-14 object-contain"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

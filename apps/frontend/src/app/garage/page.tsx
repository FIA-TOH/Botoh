'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/i18n';
import { AppSnackbar, useAppSnackbar } from '@/components/AppSnackbar';
import { DriverCircle } from '@/components/pit-wall/DriverCircle';
import { apiUrl } from '@/config/api';

interface TeamGarageData {
  id: string;
  cashTotal: number;
  climateCostPerRace: number;
  pitCrewCostPerRace: number;
  salaryCostPerRace: number;
  sponsorIncomePerRace: number;
  climateMonitoringLevel: number;
  pitCrewLevel: number;
  carName: string;
  financialHistory: { id: string; amount: number; entryType: 'income' | 'expense'; reason: string; occurredAt: string }[];
  drivers: {
    id: string;
    userId: string | null;
    displayName: string;
    driverNumber: number | null;
    contractEndsAfterRaces: number;
    salaryPerRace: number;
    slotNumber: number;
    category: 'starter' | 'reserve';
  }[];
  sponsors: {
    id: string;
    sponsorId: string;
    name: string;
    logoUrl: string | null;
    category: string;
    slotNumber: number;
    contractRacesRemaining: number;
    initialReward: number;
    rewardPerRace: number;
    seasonMissions: { id: string; title: string; reward: number; racesToComplete: number }[];
    raceMissions: { id: string; title: string; reward: number }[];
  }[];
  facilityEconomy?: {
    maxLevel: number;
    sponsorTerminationPenaltyMultiplier: number;
    facilities: Record<'climate' | 'pitCrew', {
      buildCost: number;
      upgradeCostByTargetLevel: Record<string, number>;
      sellValueByCurrentLevel: Record<string, number>;
    }>;
  };
}

export default function GaragePage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { t } = useTranslations();
  const { snackbar, showSnackbar, closeSnackbar } = useAppSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [missingTeamLogos, setMissingTeamLogos] = useState<Record<string, boolean>>({});
  const [loadedTeamLogos, setLoadedTeamLogos] = useState<Record<string, boolean>>({});
  const [teamGarage, setTeamGarage] = useState<TeamGarageData | null>(null);
  const [garageLoading, setGarageLoading] = useState(false);
  const [garageLoadFailed, setGarageLoadFailed] = useState(false);
  const [selectedTeamLoadingId, setSelectedTeamLoadingId] = useState<string | null>(null);
  const [facilityActionLoading, setFacilityActionLoading] = useState<string | null>(null);
  const [driverProposalLoading, setDriverProposalLoading] = useState(false);
  const [driverReleaseLoading, setDriverReleaseLoading] = useState(false);
  const [sponsorReleaseLoading, setSponsorReleaseLoading] = useState(false);
  const [hireModalCategory, setHireModalCategory] = useState<'starter' | 'reserve' | null>(null);
  const [hireForm, setHireForm] = useState({
    username: '',
    contractRaces: '8',
    salaryPerRace: '4500000',
  });
  const [releaseModalDriver, setReleaseModalDriver] = useState<TeamGarageData['drivers'][number] | null>(null);
  const [selectedSponsor, setSelectedSponsor] = useState<TeamGarageData['sponsors'][number] | null>(null);
  const [confirmSponsorRelease, setConfirmSponsorRelease] = useState(false);
  const financialHistoryRef = useRef<HTMLDivElement | null>(null);

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
  const selectedCarSrc = selectedMembership
    ? `/img/scuderia/cars/${normalizeAssetName(selectedMembership.teamName)}.png`
    : '/img/scuderia/cars/default.png';
  const selectedLogoKey = selectedMembership?.teamId ?? '';
  const selectedLogoIsMissing = selectedLogoKey
    ? missingTeamLogos[selectedLogoKey]
    : false;
  const weatherMonitoringLevel = teamGarage?.climateMonitoringLevel ?? 1;
  const pitCrewLevel = teamGarage?.pitCrewLevel ?? 1;
  const maxFacilityLevel = teamGarage?.facilityEconomy?.maxLevel ?? 5;
  const sponsorProfitPerRace = Number(teamGarage?.sponsorIncomePerRace ?? 0);
  const salaryCostPerRace = Number(teamGarage?.salaryCostPerRace ?? 0);
  const pitCrewCostPerRace = Number(teamGarage?.pitCrewCostPerRace ?? pitCrewLevel * 50);
  const climateCostPerRace = Number(teamGarage?.climateCostPerRace ?? weatherMonitoringLevel * 50);
  const expensesPerRace = salaryCostPerRace + pitCrewCostPerRace + climateCostPerRace;
  const netPerRace = sponsorProfitPerRace - expensesPerRace;
  const cashTotal = Number(teamGarage?.cashTotal ?? 0);
  const climateUpgradeCost = getFacilityUpgradeCost('climate', weatherMonitoringLevel);
  const climateSellValue = getFacilitySellValue('climate', weatherMonitoringLevel);
  const pitCrewUpgradeCost = getFacilityUpgradeCost('pitCrew', pitCrewLevel);
  const pitCrewSellValue = getFacilitySellValue('pitCrew', pitCrewLevel);
  const facilitySounds = {
    pitCrewUpgrade: Array.from({ length: 4 }, (_, index) => `/sounds/pitupgrade${index + 1}.mp3`),
    climateUpgrade: Array.from({ length: 6 }, (_, index) => `/sounds/weatherupgrade${index + 1}.mp3`),
    sell: Array.from({ length: 3 }, (_, index) => `/sounds/sell${index + 1}.mp3`),
  };
  const groupedSponsors = useMemo(() => {
    const groups: Record<string, TeamGarageData['sponsors']> = {
      title_sponsor: [],
      main_partner: [],
      official_partner: [],
      minor_sponsor: [],
      personal_sponsor: [],
    };
    for (const sponsor of teamGarage?.sponsors ?? []) {
      groups[sponsor.category]?.push(sponsor);
    }
    return groups;
  }, [teamGarage?.sponsors]);
  const driversByCategory = useMemo(() => ({
    starter: (teamGarage?.drivers ?? []).filter((driver) => driver.category === 'starter'),
    reserve: (teamGarage?.drivers ?? []).filter((driver) => driver.category === 'reserve'),
  }), [teamGarage?.drivers]);

  async function loadTeamGarage(teamId: string, options: { reset?: boolean } = {}) {
    if (options.reset) {
      setTeamGarage(null);
    }

    setGarageLoading(true);
    setGarageLoadFailed(false);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(apiUrl(`/api/garage/teams/${teamId}`), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await response.json();
      if (data.success) {
        setTeamGarage(data.garage);
      } else {
        setGarageLoadFailed(true);
        showSnackbar(data.message ?? t.garage.loadFailed, 'error');
      }
    } catch (error) {
      setGarageLoadFailed(true);
      showSnackbar(t.garage.loadFailed, 'error');
    } finally {
      setGarageLoading(false);
    }
  }

  useEffect(() => {
    if (selectedMembership) {
      setGarageLoadFailed(false);
      loadTeamGarage(selectedMembership.teamId, {
        reset: teamGarage?.id !== selectedMembership.teamId,
      });
      return;
    }
  }, [selectedMembership?.teamId]);

  useEffect(() => {
    const historyElement = financialHistoryRef.current;
    if (!historyElement) return;

    requestAnimationFrame(() => {
      historyElement.scrollTop = historyElement.scrollHeight;
    });
  }, [teamGarage?.financialHistory]);

  async function updateFacility(facility: 'climate' | 'pitCrew', action: 'upgrade' | 'sell') {
    if (!selectedMembership) return;
    const actionKey = `${facility}-${action}`;
    setFacilityActionLoading(actionKey);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(apiUrl(`/api/garage/teams/${selectedMembership.teamId}/facility`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ facility, action }),
      });
      const data = await response.json();
      if (!data.success) {
        showSnackbar(data.message ?? t.garage.facilityActionFailed, 'error');
        return;
      }
      playFacilityActionSound(facility, action);
      showSnackbar(t.garage.facilityActionCompleted, 'success');
      await loadTeamGarage(selectedMembership.teamId);
    } catch (error) {
      showSnackbar(t.garage.facilityActionFailed, 'error');
    } finally {
      setFacilityActionLoading(null);
    }
  }

  async function sendDriverProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMembership || !hireModalCategory) return;

    setDriverProposalLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(apiUrl(`/api/garage/teams/${selectedMembership.teamId}/driver-proposals`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: hireForm.username,
          contractRaces: Number(hireForm.contractRaces),
          salaryPerRace: Number(hireForm.salaryPerRace),
          category: hireModalCategory,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        showSnackbar(data.message ?? t.garage.driverActionFailed, 'error');
        return;
      }

      showSnackbar(t.garage.driverProposalSent, 'success');
      setHireModalCategory(null);
      setHireForm({ username: '', contractRaces: '8', salaryPerRace: '4500000' });
      await loadTeamGarage(selectedMembership.teamId);
    } catch (error) {
      showSnackbar(t.garage.driverActionFailed, 'error');
    } finally {
      setDriverProposalLoading(false);
    }
  }

  async function releaseDriver(driverId: string) {
    if (!selectedMembership) return;

    setDriverReleaseLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(apiUrl(`/api/garage/teams/${selectedMembership.teamId}/drivers/${driverId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!data.success) {
        showSnackbar(data.message ?? t.garage.driverActionFailed, 'error');
        return;
      }

      setReleaseModalDriver(null);
      showSnackbar(t.garage.driverReleased, 'success');
      await loadTeamGarage(selectedMembership.teamId);
    } catch (error) {
      showSnackbar(t.garage.driverActionFailed, 'error');
    } finally {
      setDriverReleaseLoading(false);
    }
  }

  async function releaseSponsor(teamSponsorId: string) {
    if (!selectedMembership) return;

    setSponsorReleaseLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(apiUrl(`/api/garage/teams/${selectedMembership.teamId}/sponsors/${teamSponsorId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!data.success) {
        showSnackbar(data.message ?? t.garage.sponsorActionFailed, 'error');
        return;
      }

      setSelectedSponsor(null);
      setConfirmSponsorRelease(false);
      showSnackbar(t.garage.sponsorReleased, 'success');
      await loadTeamGarage(selectedMembership.teamId);
    } catch (error) {
      showSnackbar(t.garage.sponsorActionFailed, 'error');
    } finally {
      setSponsorReleaseLoading(false);
    }
  }

  function openHireModal(category: 'starter' | 'reserve') {
    setHireModalCategory(category);
  }

  function playRandomSound(sounds: string[]) {
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    if (!sound) return;

    const audio = new Audio(sound);
    audio.play().catch(() => undefined);
  }

  function playFacilityActionSound(facility: 'climate' | 'pitCrew', action: 'upgrade' | 'sell') {
    if (action === 'sell') {
      playRandomSound(facilitySounds.sell);
      return;
    }

    playRandomSound(
      facility === 'climate'
        ? facilitySounds.climateUpgrade
        : facilitySounds.pitCrewUpgrade,
    );
  }

  function money(value: number) {
    return `$${value.toLocaleString('pt-BR')}`;
  }

  function moneyClassName(value: number) {
    if (value < 0) return 'text-[#FF232B]';
    if (value > 0) return 'text-green-400';
    return 'text-white';
  }

  function FinanceLine({
    label,
    value,
    className = '',
    colored = true,
  }: {
    label: string;
    value: number;
    className?: string;
    colored?: boolean;
  }) {
    return (
      <p className={className}>
        {label}: <span className={colored ? moneyClassName(value) : 'text-white'}>{money(value)}</span>
      </p>
    );
  }

  function sponsorReleaseCost(sponsor: TeamGarageData['sponsors'][number]) {
    const multiplier = teamGarage?.facilityEconomy?.sponsorTerminationPenaltyMultiplier ?? 1.5;
    return Number(sponsor.initialReward) * multiplier;
  }

  function sponsorCategoryLabel(category: string) {
    const labels: Record<string, string> = {
      title_sponsor: t.garage.titleSponsor,
      main_partner: t.garage.mainPartner,
      official_partner: t.garage.officialPartner,
      minor_sponsor: t.garage.minorSponsor,
      personal_sponsor: t.garage.personalSponsor,
    };
    return labels[category] ?? category;
  }

  function normalizeAssetName(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function getFacilityUpgradeCost(facility: 'climate' | 'pitCrew', currentLevel: number) {
    const config = teamGarage?.facilityEconomy?.facilities[facility];
    const targetLevel = currentLevel + 1;
    return Number(
      targetLevel <= 1
        ? config?.buildCost ?? 500
        : config?.upgradeCostByTargetLevel[String(targetLevel)] ?? 500,
    );
  }

  function getFacilitySellValue(facility: 'climate' | 'pitCrew', currentLevel: number) {
    const config = teamGarage?.facilityEconomy?.facilities[facility];
    return Number(config?.sellValueByCurrentLevel[String(currentLevel)] ?? 350);
  }

  function formatHistoryDate(date: string) {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() - 3);
    return adjustedDate.toLocaleString('pt-BR');
  }

  function buildDriverSlots(category: 'starter' | 'reserve') {
    const drivers = driversByCategory[category];
    return Array.from({ length: 2 }, (_, index) => drivers[index] ?? null);
  }

  function getReleasePenalty(driver: TeamGarageData['drivers'][number]) {
    return Number(driver.salaryPerRace) * Number(driver.contractEndsAfterRaces) * 2;
  }

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  };

  if (authLoading) {
    return (
      <main
        className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white"
        style={{ backgroundImage: 'url(/img/bg/garagewpp.png)' }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="flex flex-col items-center gap-4 border-8 border-[#FF0000] bg-[#1E1E1E] px-10 py-8 text-center">
            {!garageLoadFailed && (
              <span
                aria-label={t.common.loading}
                className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"
              />
            )}
            <p className="text-xl font-bold uppercase">
              {garageLoadFailed ? t.garage.loadFailed : t.common.loading}
            </p>
          </div>
        </div>
      </main>
    );
  }

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
                    disabled={selectedTeamLoadingId !== null}
                    onClick={() => {
                      setSelectedTeamLoadingId(membership.teamId);
                      router.push(`/garage?teamId=${membership.teamId}`);
                    }}
                    className="flex min-h-28 min-w-56 items-center justify-center border-8 border-[#FF0000] bg-[#1E1E1E] px-6 py-5 text-xl font-semibold transition-colors hover:border-white disabled:cursor-wait disabled:opacity-70"
                  >
                    {selectedTeamLoadingId === membership.teamId ? (
                      <span>{t.common.loading}</span>
                    ) : !hasLoadedLogo && (
                      <span
                        aria-label={t.common.loading}
                        className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white"
                      />
                    )}

                    {selectedTeamLoadingId === membership.teamId ? null : hasMissingLogo ? (
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

  if (!teamGarage) {
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
          <div className="flex flex-col items-center gap-4 border-8 border-[#FF0000] bg-[#1E1E1E] px-10 py-8 text-center">
            {!garageLoadFailed && (
              <span
                aria-label={t.common.loading}
                className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"
              />
            )}
            <p className="text-xl font-bold uppercase">
              {garageLoadFailed ? t.garage.loadFailed : t.common.loading}
            </p>
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
                <FinanceLine label={t.garage.cash} value={cashTotal} />
                <FinanceLine label={t.garage.netPerRace} value={netPerRace} />
                <FinanceLine label={t.garage.expensesPerRace} value={expensesPerRace} colored={false} />
                <FinanceLine label={t.admin.climateCostPerRace} value={climateCostPerRace} className="mt-1 text-sm" colored={false} />
                <FinanceLine label={t.admin.pitCrewCostPerRace} value={pitCrewCostPerRace} className="text-sm" colored={false} />
                <FinanceLine label={t.garage.salaries} value={salaryCostPerRace} className="text-sm" colored={false} />
                <FinanceLine label={t.garage.profitPerRace} value={sponsorProfitPerRace} colored={false} />
                <FinanceLine label={t.garage.sponsors} value={sponsorProfitPerRace} className="text-sm" colored={false} />
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

            <div ref={financialHistoryRef} className="mt-4 h-[450px] overflow-y-auto border-4 border-white/90 p-4 text-sm">
              {!garageLoading && (teamGarage?.financialHistory ?? []).length === 0 && <p>---</p>}
              {[...(teamGarage?.financialHistory ?? [])].reverse().map((entry) => (
                <p key={entry.id} className={entry.entryType === 'income' ? 'mt-2 text-[#3DD56D]' : 'mt-2 text-[#FF0000]'}>
                  {entry.entryType === 'income' ? '+' : '-'} {money(Number(entry.amount))} {formatHistoryDate(entry.occurredAt)} - {entry.reason}
                </p>
              ))}
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
                {weatherMonitoringLevel <= 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <p className="max-w-[280px] text-xl">{t.garage.noWeatherFacility}</p>
                    <p className="mt-6 max-w-[280px] text-xl">
                      {t.garage.buildWeatherQuestion} <strong>{money(climateUpgradeCost)}</strong>?
                    </p>
                    <button
                      disabled={cashTotal < climateUpgradeCost || facilityActionLoading !== null}
                      onClick={() => updateFacility('climate', 'upgrade')}
                      className="mt-8 w-full bg-[#FF0000] px-3 py-4 text-2xl font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                    >
                      {facilityActionLoading === 'climate-upgrade' ? t.common.loading : t.garage.build}
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="mt-2 min-h-[132px] border-4 border-[#FF0000] bg-cover bg-center"
                      style={{ backgroundImage: `url(/img/img/weather/weather-${weatherMonitoringLevel}.jpg)` }}
                    />
                    <div className="mt-4 text-center">
                      <p>{t.garage.centerLevel}</p>
                      <div className="mt-2 flex justify-center gap-2">
                        {Array.from({ length: maxFacilityLevel }).map((_, index) => (
                          <span key={index} className={`h-8 w-4 ${index < weatherMonitoringLevel ? 'bg-sky-500' : 'border-2 border-sky-500'}`} />
                        ))}
                      </div>
                      <p className="mt-4">{t.garage.costPerRace}</p>
                      <p className="text-xl">{money(climateCostPerRace)}</p>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-4 pt-4">
                      <button
                        disabled={weatherMonitoringLevel >= maxFacilityLevel || cashTotal < climateUpgradeCost || facilityActionLoading !== null}
                        onClick={() => updateFacility('climate', 'upgrade')}
                        className="group min-w-[120px] flex-1 bg-[#FF0000] px-3 py-3 font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                      >
                        {facilityActionLoading === 'climate-upgrade' ? (
                          t.common.loading
                        ) : (
                          <>
                            <span className="group-hover:hidden">{t.garage.upgrade}</span>
                            <span className="hidden group-hover:inline">{money(climateUpgradeCost)}</span>
                          </>
                        )}
                      </button>
                      <button
                        disabled={weatherMonitoringLevel <= 0 || facilityActionLoading !== null}
                        onClick={() => updateFacility('climate', 'sell')}
                        className="group min-w-[120px] flex-1 bg-[#FF0000] px-3 py-3 font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                      >
                        {facilityActionLoading === 'climate-sell' ? (
                          t.common.loading
                        ) : (
                          <>
                            <span className="group-hover:hidden">{t.garage.sell}</span>
                            <span className="hidden group-hover:inline">{money(climateSellValue)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </section>

              <section className="flex min-h-[392px] flex-col border-8 border-[#FF0000] bg-[#1E1E1E] p-4">
                <h2 className="flex min-h-14 items-center justify-center text-center text-2xl font-bold uppercase">
                  {t.garage.pitCrew}
                </h2>
                {pitCrewLevel <= 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <p className="max-w-[280px] text-xl">{t.garage.noPitCrewFacility}</p>
                    <p className="mt-6 max-w-[280px] text-xl">
                      {t.garage.buildPitCrewQuestion} <strong>{money(pitCrewUpgradeCost)}</strong>?
                    </p>
                    <button
                      disabled={cashTotal < pitCrewUpgradeCost || facilityActionLoading !== null}
                      onClick={() => updateFacility('pitCrew', 'upgrade')}
                      className="mt-8 w-full bg-[#FF0000] px-3 py-4 text-2xl font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                    >
                      {facilityActionLoading === 'pitCrew-upgrade' ? t.common.loading : t.garage.build}
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="mt-2 min-h-[132px] border-4 border-[#FF0000] bg-cover bg-center"
                      style={{ backgroundImage: `url(/img/img/pitcrew/pitcrew-${pitCrewLevel}.jpg)` }}
                    />
                    <div className="mt-4 text-center">
                      <p>{t.garage.teamLevel}</p>
                      <div className="mt-2 flex justify-center gap-2">
                        {Array.from({ length: maxFacilityLevel }).map((_, index) => (
                          <span key={index} className={`h-8 w-4 ${index < pitCrewLevel ? 'bg-amber-400' : 'border-2 border-amber-400'}`} />
                        ))}
                      </div>
                      <p className="mt-4">{t.garage.costPerRace}</p>
                      <p className="text-xl">{money(pitCrewCostPerRace)}</p>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-4 pt-4">
                      <button
                        disabled={pitCrewLevel >= maxFacilityLevel || cashTotal < pitCrewUpgradeCost || facilityActionLoading !== null}
                        onClick={() => updateFacility('pitCrew', 'upgrade')}
                        className="group min-w-[120px] flex-1 bg-[#FF0000] px-3 py-3 font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                      >
                        {facilityActionLoading === 'pitCrew-upgrade' ? (
                          t.common.loading
                        ) : (
                          <>
                            <span className="group-hover:hidden">{t.garage.upgrade}</span>
                            <span className="hidden group-hover:inline">{money(pitCrewUpgradeCost)}</span>
                          </>
                        )}
                      </button>
                      <button
                        disabled={pitCrewLevel <= 0 || facilityActionLoading !== null}
                        onClick={() => updateFacility('pitCrew', 'sell')}
                        className="group min-w-[120px] flex-1 bg-[#FF0000] px-3 py-3 font-bold uppercase disabled:cursor-not-allowed disabled:bg-[#B0003A]"
                      >
                        {facilityActionLoading === 'pitCrew-sell' ? (
                          t.common.loading
                        ) : (
                          <>
                            <span className="group-hover:hidden">{t.garage.sell}</span>
                            <span className="hidden group-hover:inline">{money(pitCrewSellValue)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </section>
              </div>

              <section className="relative h-[250px] overflow-hidden border-8 border-[#FF0000] bg-[#1E1E1E]">
                <div className="absolute  flex items-center justify-center h-full">
                  <img
                    key={selectedCarSrc}
                    src={selectedCarSrc}
                    alt=""
                    className="block p-10 object-contain"
                    onError={(event) => {
                      if (event.currentTarget.src.endsWith('/img/scuderia/cars/default.png')) return;
                      event.currentTarget.src = '/img/scuderia/cars/default.png';
                    }}
                  />
                </div>
                <div className="relative z-10 flex items-center gap-4">
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
                  <h2 className="text-4xl font-bold uppercase">{teamGarage?.carName ?? '---'}</h2>
                </div>
              </section>
            </div>
          </div>

          <AppSnackbar
            message={snackbar.message}
            type={snackbar.type}
            isOpen={snackbar.isOpen}
            onClose={closeSnackbar}
          />

          <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
            <section className="h-fit border-8 border-[#FF0000] bg-[#1E1E1E] p-6">
              <h2 className="text-2xl font-bold uppercase">{t.garage.drivers}</h2>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {([
                  ...buildDriverSlots('starter').map((driver) => ({ category: 'starter' as const, driver })),
                  ...buildDriverSlots('reserve').map((driver) => ({ category: 'reserve' as const, driver })),
                ]).map(({ category, driver }, index) => {
                  const categoryLabel = category === 'starter' ? t.garage.starter : t.garage.reserve;
                  return (
                    <div
                      key={driver?.id ?? `${category}-${index}`}
                      className="flex min-h-[360px] flex-col items-center text-center"
                    >
                      <div className="flex min-h-16 flex-col items-center justify-start">
                        <p className="line-clamp-2 min-h-6 font-bold uppercase">
                          {driver?.displayName ?? t.garage.freeSeat}
                        </p>
                        <p className="mt-1 text-sm uppercase text-gray-300">{categoryLabel}</p>
                      </div>

                      <div className="flex h-[150px] shrink-0 items-center justify-center">
                        <DriverCircle
                          number={driver?.driverNumber ?? '??'}
                          color={driver ? selectedMembership.teamColor : '#242424'}
                          size={category === 'starter' ? 'lg' : 'md'}
                        />
                      </div>

                      <div className="flex flex-col items-center justify-start text-sm">
                        {driver ? (
                          <>
                            <p>
                              {t.garage.contractEndsIn}: {driver.contractEndsAfterRaces} {t.garage.races}
                            </p>
                            <p>{t.garage.salary}: {money(Number(driver.salaryPerRace))}</p>
                            <p>
                              {t.garage.releaseCost}: {money(getReleasePenalty(driver))}
                            </p>
                          </>
                        ) : (
                          <p>{t.common.noDriver}</p>
                        )}
                      </div>

                      {driver ? (
                        <button
                          type="button"
                          onClick={() => setReleaseModalDriver(driver)}
                          className="mt-auto bg-[#FF0000] px-4 py-3 font-bold uppercase"
                        >
                          {t.garage.release}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openHireModal(category)}
                          className="mt-auto bg-[#FF0000] px-4 py-3 font-bold uppercase"
                        >
                          {t.garage.hire}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="border-8 border-[#FF0000] bg-[#1E1E1E] p-6">
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="mb-4 text-center font-bold uppercase">{t.garage.titleSponsor}</h3>
                    {groupedSponsors.title_sponsor[0] && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSponsor(groupedSponsors.title_sponsor[0]);
                          setConfirmSponsorRelease(false);
                        }}
                        className="mx-auto flex h-28 w-28 items-center justify-center"
                      >
                        {groupedSponsors.title_sponsor[0].logoUrl ? (
                          <img
                            src={groupedSponsors.title_sponsor[0].logoUrl}
                            alt={groupedSponsors.title_sponsor[0].name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-center text-sm font-bold uppercase">
                            {groupedSponsors.title_sponsor[0].name}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-4 text-center font-bold uppercase">{t.garage.mainPartner}</h3>
                    <div className="flex justify-center gap-6">
                      {groupedSponsors.main_partner.map((sponsor) => (
                        <button
                          key={sponsor.id}
                          type="button"
                          onClick={() => {
                            setSelectedSponsor(sponsor);
                            setConfirmSponsorRelease(false);
                          }}
                          className="flex h-20 w-20 items-center justify-center"
                        >
                          {sponsor.logoUrl ? (
                            <img src={sponsor.logoUrl} alt={sponsor.name} className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-center text-xs font-bold uppercase">{sponsor.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {[
                  { title: t.garage.officialPartner, sponsors: groupedSponsors.official_partner },
                  { title: t.garage.minorSponsor, sponsors: groupedSponsors.minor_sponsor },
                  { title: t.garage.personalSponsor, sponsors: groupedSponsors.personal_sponsor },
                ].map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-4 text-center font-bold uppercase">{group.title}</h3>
                    <div className="flex flex-wrap justify-center gap-5">
                      {group.sponsors.map((sponsor) => (
                        <button
                          key={sponsor.id}
                          type="button"
                          onClick={() => {
                            setSelectedSponsor(sponsor);
                            setConfirmSponsorRelease(false);
                          }}
                          className="flex h-14 w-14 items-center justify-center"
                        >
                          {sponsor.logoUrl ? (
                            <img src={sponsor.logoUrl} alt={sponsor.name} className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-center text-[10px] font-bold uppercase">{sponsor.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {hireModalCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={sendDriverProposal}
            className="w-full max-w-md border-4 border-[#FF0000] bg-[#1E1E1E] p-6 text-white shadow-2xl"
          >
            <h2 className="text-2xl font-bold uppercase">{t.garage.contractProposal}</h2>
            <p className="mt-2 text-sm text-gray-300">
              {t.garage.driverCategory}: {hireModalCategory === 'starter' ? t.garage.starter : t.garage.reserve}
            </p>

            <label className="mt-5 block text-sm font-semibold" htmlFor="driver-username">
              {t.garage.driverUsername}
            </label>
            <input
              id="driver-username"
              required
              value={hireForm.username}
              onChange={(event) => setHireForm((current) => ({ ...current, username: event.target.value }))}
              className="mt-2 w-full border-2 border-[#FF0000] bg-black px-4 py-3 text-white outline-none"
            />

            <label className="mt-4 block text-sm font-semibold" htmlFor="contract-races">
              {t.garage.contractDuration}
            </label>
            <input
              id="contract-races"
              required
              min="1"
              type="number"
              value={hireForm.contractRaces}
              onChange={(event) => setHireForm((current) => ({ ...current, contractRaces: event.target.value }))}
              className="mt-2 w-full border-2 border-[#FF0000] bg-black px-4 py-3 text-white outline-none"
            />

            <label className="mt-4 block text-sm font-semibold" htmlFor="salary-per-race">
              {t.garage.salaryPerRace}
            </label>
            <input
              id="salary-per-race"
              required
              min="0"
              type="number"
              value={hireForm.salaryPerRace}
              onChange={(event) => setHireForm((current) => ({ ...current, salaryPerRace: event.target.value }))}
              className="mt-2 w-full border-2 border-[#FF0000] bg-black px-4 py-3 text-white outline-none"
            />

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                disabled={driverProposalLoading}
                onClick={() => setHireModalCategory(null)}
                className="bg-gray-700 px-4 py-3 font-bold uppercase hover:bg-gray-600 disabled:cursor-wait disabled:opacity-70"
              >
                {t.garage.cancel}
              </button>
              <button
                type="submit"
                disabled={driverProposalLoading}
                className="bg-[#FF0000] px-4 py-3 font-bold uppercase hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
              >
                {driverProposalLoading ? t.common.loading : t.garage.sendProposal}
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="relative w-full max-w-4xl border-4 border-[#FF0000] bg-[#1E1E1E] px-8 pb-6 pt-10 text-white shadow-2xl">
            <button
              type="button"
              aria-label={t.garage.cancel}
              onClick={() => {
                setSelectedSponsor(null);
                setConfirmSponsorRelease(false);
              }}
              className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center border-2 border-[#FF0000] bg-[#1E1E1E] text-xl font-bold leading-none hover:text-[#FF232B]"
            >
              X
            </button>
            <div className="grid gap-6 md:grid-cols-[190px_1fr]">
              <div>
                <h2 className="text-3xl font-bold uppercase">{selectedSponsor.name}</h2>
                <p className="mt-1 text-xl font-bold uppercase">{sponsorCategoryLabel(selectedSponsor.category)}</p>
                <div className="mt-6 flex h-44 w-44 items-center justify-center">
                  {selectedSponsor.logoUrl ? (
                    <img src={selectedSponsor.logoUrl} alt={selectedSponsor.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-center text-2xl font-bold uppercase">{selectedSponsor.name}</span>
                  )}
                </div>
                <div className="mt-7 space-y-1 text-lg">
                  <p><strong>{t.garage.duration}:</strong> {selectedSponsor.contractRacesRemaining} {t.garage.races}</p>
                  <p><strong>{t.garage.initialReward}:</strong> {money(Number(selectedSponsor.initialReward))}</p>
                  <p><strong>{t.garage.rewardPerRace}:</strong> {money(Number(selectedSponsor.rewardPerRace))}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <section className="border-2 border-white/80 p-4">
                  <h3 className="text-xl font-bold uppercase">{t.garage.seasonMissions}</h3>
                  <div className="mt-2 max-h-32 overflow-y-auto pr-2">
                    {selectedSponsor.seasonMissions.length > 0 ? (
                      selectedSponsor.seasonMissions.map((mission) => (
                        <p key={mission.id} className="text-base">
                          {mission.title}: {money(Number(mission.reward))} - {mission.racesToComplete} {t.garage.races}
                        </p>
                      ))
                    ) : (
                      <p className="text-base text-gray-300">{t.garage.noMissions}</p>
                    )}
                  </div>
                </section>

                <section className="border-2 border-white/80 p-4">
                  <h3 className="text-xl font-bold uppercase">{t.garage.raceMissions}</h3>
                  <div className="mt-2 max-h-32 overflow-y-auto pr-2">
                    {selectedSponsor.raceMissions.length > 0 ? (
                      selectedSponsor.raceMissions.map((mission) => (
                        <p key={mission.id} className="text-base">
                          {mission.title}: {money(Number(mission.reward))}
                        </p>
                      ))
                    ) : (
                      <p className="text-base text-gray-300">{t.garage.noMissions}</p>
                    )}
                  </div>
                </section>

                {confirmSponsorRelease && (
                  <div className="border border-[#FF0000] bg-black/40 p-4">
                    <p className="font-semibold">{t.garage.confirmSponsorReleaseMessage}</p>
                    <p className="mt-2 text-lg font-bold text-[#FF232B]">
                      {t.garage.releaseCost}: {money(sponsorReleaseCost(selectedSponsor))}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  {confirmSponsorRelease && (
                    <button
                      type="button"
                      disabled={sponsorReleaseLoading}
                      onClick={() => setConfirmSponsorRelease(false)}
                      className="bg-gray-700 px-4 py-2 text-sm font-bold uppercase hover:bg-gray-600 disabled:cursor-wait disabled:opacity-70"
                    >
                      {t.common.back}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={sponsorReleaseLoading}
                    onClick={() => {
                      if (!confirmSponsorRelease) {
                        setConfirmSponsorRelease(true);
                        return;
                      }
                      releaseSponsor(selectedSponsor.id);
                    }}
                    className="min-w-40 bg-[#FF0000] px-8 py-2 text-base font-bold uppercase hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    {sponsorReleaseLoading ? t.common.loading : t.garage.release}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {releaseModalDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md border-4 border-[#FF0000] bg-[#1E1E1E] p-6 text-white shadow-2xl">
            <h2 className="text-2xl font-bold uppercase">{t.garage.confirmRelease}</h2>
            <p className="mt-4 text-gray-300">
              {t.garage.confirmReleaseMessage}
            </p>
            <div className="mt-5 rounded bg-black/40 p-4">
              <p className="font-bold uppercase">{releaseModalDriver.displayName}</p>
              <p className="mt-2 text-sm">
                {t.garage.contractEndsIn}: {releaseModalDriver.contractEndsAfterRaces} {t.garage.races}
              </p>
              <p className="text-sm">
                {t.garage.salary}: {money(Number(releaseModalDriver.salaryPerRace))}
              </p>
              <p className="mt-2 text-lg font-bold text-[#FF232B]">
                {t.garage.releaseCost}: {money(getReleasePenalty(releaseModalDriver))}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                disabled={driverReleaseLoading}
                onClick={() => setReleaseModalDriver(null)}
                className="bg-gray-700 px-4 py-3 font-bold uppercase hover:bg-gray-600 disabled:cursor-wait disabled:opacity-70"
              >
                {t.garage.cancel}
              </button>
              <button
                type="button"
                disabled={driverReleaseLoading}
                onClick={() => releaseDriver(releaseModalDriver.id)}
                className="bg-[#FF0000] px-4 py-3 font-bold uppercase hover:bg-red-700 disabled:cursor-wait disabled:opacity-70"
              >
                {driverReleaseLoading ? t.common.loading : t.garage.release}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

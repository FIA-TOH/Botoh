'use client';

import { Dispatch, FormEvent, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/config/api';
import { AppSnackbar, useAppSnackbar } from '@/components/AppSnackbar';
import { FtohHeader } from '@/components/FtohHeader';
import { DriverCircle } from '@/components/pit-wall/DriverCircle';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/i18n';

interface MarketScuderia {
  id: string;
  name: string;
  tag: string;
  color: string;
  logoUrl: string | null;
  starterCount: number;
  reserveCount: number;
  starterVacancies: number;
  reserveVacancies: number;
}

interface MarketPilot {
  id: string;
  username: string;
  driverNumber: number | null;
  overall: number;
  commercialScore: number;
  marketScore: number;
  minimumSalary: number;
  attributes: {
    velocidade: number;
    consistencia: number;
    tecnica: number;
    experiencia: number;
    chuva: number;
    estrategia: number;
    potencial: number;
    popularidade: number;
    patrocinadorScore: number;
  };
  hasPersonalSponsor: boolean;
  sponsor: { id: string; name: string; logoUrl: string | null } | null;
  hasStarterContract: boolean;
  starterTeamColor: string | null;
  hasReserveContract: boolean;
}

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function getLocalScuderiaLogoPath(teamName: string) {
  return `/img/scuderia/logos/${encodeURIComponent(teamName.trim().toLowerCase())}.png`;
}

function TooltipValue({
  children,
  tooltip,
  className = '',
}: {
  children: ReactNode;
  tooltip: string;
  className?: string;
}) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    placement: 'above' | 'below';
  } | null>(null);

  function showTooltip() {
    const element = triggerRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const placement = rect.top < 140 ? 'below' : 'above';
    const left = Math.min(Math.max(rect.left + rect.width / 2, 160), window.innerWidth - 160);
    const top = placement === 'below' ? rect.bottom + 8 : rect.top - 8;

    setPosition({ left, top, placement });
  }

  return (
    <span
      ref={triggerRef}
      className={`inline-flex cursor-help ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={() => setPosition(null)}
      onFocus={showTooltip}
      onBlur={() => setPosition(null)}
      tabIndex={0}
    >
      {children}
      {position && (
        <span
          className={`pointer-events-none fixed z-[9999] w-72 -translate-x-1/2 whitespace-pre-line border-2 border-[#FF232B] bg-black px-3 py-2 text-left text-xs font-semibold leading-relaxed text-white shadow-2xl ${
            position.placement === 'above' ? '-translate-y-full' : ''
          }`}
          style={{ left: position.left, top: position.top }}
        >
          {tooltip}
        </span>
      )}
    </span>
  );
}

export default function MarketPage() {
  const { isLoading, isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslations();
  const { snackbar, showSnackbar, closeSnackbar } = useAppSnackbar();
  const router = useRouter();
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasDriverWallet, setHasDriverWallet] = useState(false);
  const [isScuderiasOpen, setIsScuderiasOpen] = useState(true);
  const [isPilotsOpen, setIsPilotsOpen] = useState(false);
  const [scuderias, setScuderias] = useState<MarketScuderia[]>([]);
  const [pilots, setPilots] = useState<MarketPilot[]>([]);
  const [page, setPage] = useState(1);
  const [pilotPage, setPilotPage] = useState(1);
  const [negotiatingPilot, setNegotiatingPilot] = useState<MarketPilot | null>(null);
  const [negotiationLoading, setNegotiationLoading] = useState(false);
  const [negotiationForm, setNegotiationForm] = useState({
    teamId: '',
    contractRaces: '8',
    salaryPerRace: '',
    category: 'starter' as 'starter' | 'reserve',
  });
  const pageSize = 6;

  const managedTeams = useMemo(
    () => (user?.teamMemberships ?? []).filter(
      (membership) =>
        membership.roles.includes('team_principal') || membership.roles.includes('team_assistant'),
    ),
    [user?.teamMemberships],
  );
  const canManageDrivers = managedTeams.length > 0;

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadMarket() {
      setLoadingMarket(true);
      setLoadError(null);

      try {
        const response = await fetch(apiUrl('/api/market/scuderias'), {
          headers: getAuthHeaders(),
          cache: 'no-store',
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.message || t.market.loadFailed);

        setHasDriverWallet(Boolean(data.hasDriverWallet));
        setScuderias(data.scuderias ?? []);
        setPilots(data.pilots ?? []);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : t.market.loadFailed);
      } finally {
        setLoadingMarket(false);
      }
    }

    loadMarket();
  }, [isAuthenticated, t.market.loadFailed]);

  const sortedScuderias = useMemo(
    () => [...scuderias].sort((left, right) => {
      const leftGroup = left.starterVacancies > 0 ? 0 : left.reserveVacancies > 0 ? 1 : 2;
      const rightGroup = right.starterVacancies > 0 ? 0 : right.reserveVacancies > 0 ? 1 : 2;
      if (leftGroup !== rightGroup) return leftGroup - rightGroup;
      return left.name.localeCompare(right.name);
    }),
    [scuderias],
  );
  const totalPages = Math.max(1, Math.ceil(sortedScuderias.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleScuderias = sortedScuderias.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const sortedPilots = useMemo(
    () => [...pilots].sort((left, right) => {
      if (left.hasStarterContract !== right.hasStarterContract) {
        return left.hasStarterContract ? 1 : -1;
      }

      return right.marketScore - left.marketScore;
    }),
    [pilots],
  );
  const pilotTotalPages = Math.max(1, Math.ceil(sortedPilots.length / pageSize));
  const currentPilotPage = Math.min(pilotPage, pilotTotalPages);
  const visiblePilots = sortedPilots.slice((currentPilotPage - 1) * pageSize, currentPilotPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [scuderias.length]);
  useEffect(() => {
    setPilotPage(1);
  }, [pilots.length]);

  if (isLoading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: 'url(/img/bg/loginbg.png)' }}
      >
        {t.common.loading}
      </main>
    );
  }

  if (!isAuthenticated) return null;

  const pagination = (
    pageNumber: number,
    totalPageCount: number,
    setPageNumber: Dispatch<SetStateAction<number>>,
  ) => (
    <div className="flex items-center justify-between gap-4 border-4 border-[#FF232B] bg-gray-700 p-3">
      <button
        type="button"
        className="bg-[#FF232B] px-4 py-2 font-bold disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
        disabled={pageNumber <= 1}
        onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
      >
        {t.market.previousPage}
      </button>
      <span className="font-semibold">
        {t.market.page} {pageNumber} {t.market.pageOf} {totalPageCount}
      </span>
      <button
        type="button"
        className="bg-[#FF232B] px-4 py-2 font-bold disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
        disabled={pageNumber >= totalPageCount}
        onClick={() => setPageNumber((current) => Math.min(totalPageCount, current + 1))}
      >
        {t.market.nextPage}
      </button>
    </div>
  );
  const money = (value: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

  const negotiationMinimumSalary = negotiatingPilot
    ? negotiationForm.category === 'reserve'
      ? Math.round(negotiatingPilot.minimumSalary * 0.25)
      : negotiatingPilot.minimumSalary
    : 0;
  const salaryValue = Number(negotiationForm.salaryPerRace);
  const canSubmitNegotiation = Boolean(
    negotiatingPilot
    && negotiationForm.teamId
    && Number(negotiationForm.contractRaces) > 0
    && salaryValue >= negotiationMinimumSalary,
  );

  function openNegotiation(pilot: MarketPilot) {
    setNegotiatingPilot(pilot);
    setNegotiationForm({
      teamId: managedTeams[0]?.teamId ?? '',
      contractRaces: '8',
      salaryPerRace: String(pilot.minimumSalary),
      category: 'starter',
    });
  }

  function updateNegotiationCategory(category: 'starter' | 'reserve') {
    setNegotiationForm((current) => ({
      ...current,
      category,
      salaryPerRace: negotiatingPilot
        ? String(category === 'reserve' ? Math.round(negotiatingPilot.minimumSalary * 0.25) : negotiatingPilot.minimumSalary)
        : current.salaryPerRace,
    }));
  }

  function getMinimumSalaryTooltip(pilot: MarketPilot) {
    return [
      `${t.market.minimumSalary}: ${money(pilot.minimumSalary)}`,
      `${t.market.definedBy}: ${t.market.marketScore} ${pilot.marketScore.toFixed(2)}`,
    ].join('\n');
  }

  function getMarketScoreTooltip(pilot: MarketPilot) {
    return [
      `${t.market.marketScore}: ${pilot.marketScore.toFixed(2)}`,
      `${t.market.formula}: ${t.market.overall} * 0.75 + ${t.market.commercialScore} * 0.25`,
      `${t.market.overall}: ${pilot.overall.toFixed(2)}`,
      `${t.market.commercialScore}: ${pilot.commercialScore.toFixed(2)}`,
    ].join('\n');
  }

  function getOverallTooltip(pilot: MarketPilot) {
    return [
      `${t.market.overall}: ${pilot.overall.toFixed(2)}`,
      `${t.market.formula}: (${t.market.speed} + ${t.market.consistency} + ${t.market.technique} + ${t.market.experience} + ${t.market.rainSkill} + ${t.market.strategy}) / 30 * 100`,
      `${t.market.speed}: ${pilot.attributes.velocidade}`,
      `${t.market.consistency}: ${pilot.attributes.consistencia}`,
      `${t.market.technique}: ${pilot.attributes.tecnica}`,
      `${t.market.experience}: ${pilot.attributes.experiencia}`,
      `${t.market.rainSkill}: ${pilot.attributes.chuva}`,
      `${t.market.strategy}: ${pilot.attributes.estrategia}`,
    ].join('\n');
  }

  function getCommercialScoreTooltip(pilot: MarketPilot) {
    return [
      `${t.market.commercialScore}: ${pilot.commercialScore.toFixed(2)}`,
      `${t.market.formula}: ${t.market.potential} * 0.45 + ${t.market.popularityScore} * 0.35 + ${t.market.sponsorScore} * 0.20`,
      `${t.market.potential}: ${pilot.attributes.potencial}`,
      `${t.market.popularity}: ${pilot.attributes.popularidade}`,
      `${t.market.popularityScore}: ${pilot.attributes.popularidade * 20}`,
      `${t.market.sponsorScore}: ${pilot.attributes.patrocinadorScore}`,
    ].join('\n');
  }

  async function submitNegotiation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!negotiatingPilot) return;

    if (!canSubmitNegotiation) {
      showSnackbar(t.market.salaryTooLow, 'error');
      return;
    }

    setNegotiationLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/garage/teams/${negotiationForm.teamId}/driver-proposals`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: negotiatingPilot.username,
          contractRaces: Number(negotiationForm.contractRaces),
          salaryPerRace: salaryValue,
          category: negotiationForm.category,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        showSnackbar(data.message ?? t.market.proposalFailed, 'error');
        return;
      }

      showSnackbar(t.market.proposalSent, 'success');
      setNegotiatingPilot(null);
    } catch (error) {
      showSnackbar(t.market.proposalFailed, 'error');
    } finally {
      setNegotiationLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white"
      style={{ backgroundImage: 'url(/img/bg/loginbg.png)' }}
    >
      <div className="bg-black/45 p-4 sm:p-8">
        <FtohHeader
          onLogout={logout}
          showBackButton
          backText={null}
          onBackClick={() => router.push('/')}
        />

        <section className="mx-auto mt-10 w-full max-w-6xl border-[14px] border-[#FF232B] bg-gray-800/90 p-4 shadow-2xl sm:p-6">
          {loadingMarket ? (
            <div className="py-16 text-center text-xl font-semibold">{t.common.loading}</div>
          ) : loadError ? (
            <div className="py-16 text-center text-xl font-semibold text-red-200">{loadError}</div>
          ) : !hasDriverWallet && !canManageDrivers ? (
            <div className="py-16 text-center text-xl font-semibold">{t.market.noDriverWallet}</div>
          ) : (
            <div className="flex flex-col">
              {hasDriverWallet && (
                <div className="order-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between border-4 border-[#FF232B] bg-gray-700 px-4 py-3 text-left text-2xl font-bold uppercase"
                    onClick={() => setIsScuderiasOpen((current) => !current)}
                  >
                    <span>{t.market.scuderias}</span>
                    <span className={`transition-transform ${isScuderiasOpen ? 'rotate-90' : ''}`}>›</span>
                  </button>

                  {isScuderiasOpen && (
                    <div>
                      {visibleScuderias.length === 0 ? (
                        <div className="border-4 border-[#FF232B] bg-gray-700 p-6 text-center">
                          {t.market.noScuderias}
                        </div>
                      ) : (
                        <table className="w-full table-fixed border-collapse text-left">
                          <thead>
                            <tr className="bg-[#FF232B] text-white">
                              <th className="w-[34%] p-3">{t.market.scuderias}</th>
                              <th className="p-3 text-center">{t.market.starter1}</th>
                              <th className="p-3 text-center">{t.market.starter2}</th>
                              <th className="p-3 text-center">{t.market.reserve1}</th>
                              <th className="p-3 text-center">{t.market.reserve2}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visibleScuderias.map((scuderia) => {
                              const hasVacancy = scuderia.starterVacancies > 0 || scuderia.reserveVacancies > 0;
                              const slots = [
                                scuderia.starterCount < 1,
                                scuderia.starterCount < 2,
                                scuderia.reserveCount < 1,
                                scuderia.reserveCount < 2,
                              ];

                              return (
                                <tr
                                  key={scuderia.id}
                                  className={`border-b-4 border-gray-900 bg-gray-700 ${hasVacancy ? '' : 'opacity-45 grayscale'}`}
                                >
                                  <td className="p-3">
                                    <div className="flex min-w-0 items-center gap-4">
                                      <img
                                        src={scuderia.logoUrl || getLocalScuderiaLogoPath(scuderia.name)}
                                        alt=""
                                        className="h-14 w-14 shrink-0 object-contain"
                                        onError={(event) => {
                                          const image = event.currentTarget;
                                          const fallback = getLocalScuderiaLogoPath(scuderia.name);

                                          if (scuderia.logoUrl && !image.src.endsWith(fallback)) {
                                            image.src = fallback;
                                            return;
                                          }

                                          image.style.visibility = 'hidden';
                                        }}
                                      />
                                      <div className="min-w-0">
                                        <p className="truncate text-lg font-bold">{scuderia.name}</p>
                                        <p className="truncate text-sm text-gray-300">{scuderia.tag}</p>
                                      </div>
                                    </div>
                                  </td>
                                  {slots.map((available, index) => (
                                    <td key={`${scuderia.id}-${index}`} className="p-3 text-center">
                                      <span className={`inline-block w-full border-2 px-2 py-2 text-sm font-semibold sm:px-3 sm:text-base ${
                                        available
                                          ? 'border-[#FF232B] bg-gray-900 text-white'
                                          : 'border-gray-600 bg-gray-800 text-gray-400'
                                      }`}
                                      >
                                        {available ? t.market.available : t.market.occupied}
                                      </span>
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}

                      {pagination(currentPage, totalPages, setPage)}
                    </div>
                  )}
                </div>
              )}

              {canManageDrivers && (
                <div className={`order-1 ${hasDriverWallet ? 'mb-8' : ''}`}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between border-4 border-[#FF232B] bg-gray-700 px-4 py-3 text-left text-2xl font-bold uppercase"
                    onClick={() => setIsPilotsOpen((current) => !current)}
                  >
                    <span>{t.market.pilots}</span>
                    <span className={`transition-transform ${isPilotsOpen ? 'rotate-90' : ''}`}>›</span>
                  </button>

                  {isPilotsOpen && (
                    <div>
                      <div className="overflow-x-auto">
                      <table className="w-full min-w-[1080px] table-fixed border-collapse text-left">
                        <thead>
                          <tr className="bg-[#FF232B] text-white">
                            <th className="w-[24%] p-3">{t.market.pilots}</th>
                            <th className="w-[17%] p-3 text-left">{t.market.minimumSalary}</th>
                            <th className="p-3 text-center">{t.market.marketScore}</th>
                            <th className="p-3 text-center">{t.market.overall}</th>
                            <th className="p-3 text-center">{t.market.commercialScore}</th>
                            <th className="p-3 text-center">{t.market.personalSponsor}</th>
                            <th className="p-3 text-center">{t.market.starterContract}</th>
                            <th className="w-[12%] p-3 text-center">{t.market.negotiate}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visiblePilots.length === 0 ? (
                            <tr className="border-b-4 border-gray-900 bg-gray-700">
                              <td className="p-6 text-center text-gray-300" colSpan={8}>{t.market.noPilots}</td>
                            </tr>
                          ) : visiblePilots.map((pilot) => (
                            <tr
                              key={pilot.id}
                              className={`border-b-4 border-gray-900 bg-gray-700 ${pilot.hasStarterContract ? 'opacity-70' : ''}`}
                            >
                              <td className="p-3">
                                <div className="flex min-w-0 items-center gap-4">
                                  <DriverCircle
                                    number={pilot.driverNumber ?? '--'}
                                    color={pilot.starterTeamColor ?? '#6B7280'}
                                    size="sm"
                                  />
                                  <span className="truncate text-lg font-bold">{pilot.username}</span>
                                </div>
                              </td>
                              <td className="p-3 text-left text-xl font-bold">
                                <TooltipValue tooltip={getMinimumSalaryTooltip(pilot)}>
                                  {money(pilot.minimumSalary)}
                                </TooltipValue>
                              </td>
                              <td className="p-3 text-center font-semibold">
                                <TooltipValue tooltip={getMarketScoreTooltip(pilot)}>
                                  {pilot.marketScore.toFixed(2)}
                                </TooltipValue>
                              </td>
                              <td className="p-3 text-center">
                                <TooltipValue tooltip={getOverallTooltip(pilot)}>
                                  {pilot.overall.toFixed(2)}
                                </TooltipValue>
                              </td>
                              <td className="p-3 text-center">
                                <TooltipValue tooltip={getCommercialScoreTooltip(pilot)}>
                                  {pilot.commercialScore.toFixed(2)}
                                </TooltipValue>
                              </td>
                              <td className="p-3">
                                {pilot.sponsor && (
                                  <div className="flex items-center justify-center gap-2">
                                    {pilot.sponsor.logoUrl && (
                                      <img src={pilot.sponsor.logoUrl} alt="" className="h-8 w-8 object-contain" />
                                    )}
                                    <span className="truncate text-sm font-semibold">{pilot.sponsor.name}</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {pilot.hasStarterContract ? t.market.yes : t.market.no}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  disabled={pilot.hasStarterContract}
                                  onClick={() => openNegotiation(pilot)}
                                  className="bg-[#FF232B] px-3 py-2 text-sm font-bold uppercase disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
                                >
                                  {t.market.negotiate}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>

                      {pagination(currentPilotPage, pilotTotalPages, setPilotPage)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {negotiatingPilot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <form
            onSubmit={submitNegotiation}
            className="w-full max-w-lg border-4 border-[#FF232B] bg-[#1E1E1E] p-6 text-white shadow-2xl"
          >
            <h2 className="text-2xl font-bold uppercase">{t.market.contractProposal}</h2>
            <p className="mt-2 text-lg font-bold">{negotiatingPilot.username}</p>
            <p className="text-sm text-gray-300">
              {t.market.minimumSalary}: {money(negotiationMinimumSalary)}
            </p>

            <label className="mt-5 block text-sm font-semibold" htmlFor="market-team">
              {t.market.team}
            </label>
            <select
              id="market-team"
              required
              value={negotiationForm.teamId}
              onChange={(event) => setNegotiationForm((current) => ({ ...current, teamId: event.target.value }))}
              className="mt-2 w-full border-2 border-[#FF232B] bg-black px-4 py-3 text-white outline-none"
            >
              {managedTeams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-semibold" htmlFor="market-contract-races">
              {t.market.contractDuration}
            </label>
            <input
              id="market-contract-races"
              required
              min="1"
              type="number"
              value={negotiationForm.contractRaces}
              onChange={(event) => setNegotiationForm((current) => ({ ...current, contractRaces: event.target.value }))}
              className="mt-2 w-full border-2 border-[#FF232B] bg-black px-4 py-3 text-white outline-none"
            />

            <label className="mt-4 block text-sm font-semibold" htmlFor="market-category">
              {t.market.driverCategory}
            </label>
            <select
              id="market-category"
              required
              value={negotiationForm.category}
              onChange={(event) => updateNegotiationCategory(event.target.value as 'starter' | 'reserve')}
              className="mt-2 w-full border-2 border-[#FF232B] bg-black px-4 py-3 text-white outline-none"
            >
              <option value="starter">{t.market.starter}</option>
              <option value="reserve">{t.market.reserve}</option>
            </select>
            {negotiationForm.category === 'reserve' && (
              <p className="mt-2 border border-[#FF232B] bg-black/50 p-3 text-sm font-semibold text-red-100">
                {t.market.reserveSalaryWarning}
              </p>
            )}

            <label className="mt-4 block text-sm font-semibold" htmlFor="market-salary">
              {t.market.salaryPerRace}
            </label>
            <input
              id="market-salary"
              required
              min={negotiationMinimumSalary}
              type="number"
              value={negotiationForm.salaryPerRace}
              onChange={(event) => setNegotiationForm((current) => ({ ...current, salaryPerRace: event.target.value }))}
              className="mt-2 w-full border-2 border-[#FF232B] bg-black px-4 py-3 text-white outline-none"
            />

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                disabled={negotiationLoading}
                onClick={() => setNegotiatingPilot(null)}
                className="bg-gray-700 px-4 py-3 font-bold uppercase hover:bg-gray-600 disabled:cursor-wait disabled:opacity-70"
              >
                {t.market.cancel}
              </button>
              <button
                type="submit"
                disabled={!canSubmitNegotiation || negotiationLoading}
                className="bg-[#FF232B] px-4 py-3 font-bold uppercase hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
              >
                {negotiationLoading ? t.common.loading : t.market.sendProposal}
              </button>
            </div>
          </form>
        </div>
      )}

      <AppSnackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.isOpen}
        onClose={closeSnackbar}
      />
    </main>
  );
}

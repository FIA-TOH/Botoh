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
  category: 'formula_1' | 'formula_2';
  color: string;
  logoUrl: string | null;
  starterCount: number;
  reserveCount: number;
  starterVacancies: number;
  reserveVacancies: number;
  drivers: {
    category: 'starter' | 'reserve';
    slotNumber: number;
    displayName: string;
  }[];
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
  contracts: {
    teamId: string;
    teamName: string;
    teamCategory: 'formula_1' | 'formula_2';
    driverCategory: 'starter' | 'reserve';
    teamColor: string | null;
  }[];
}

type ScuderiaFilter = 'formula_1' | 'formula_2' | 'starter_available' | 'reserve_available';
type PilotFilter = 'formula_1' | 'formula_2' | 'starter_contract' | 'reserve_contract';

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
  const [scuderiaFilters, setScuderiaFilters] = useState<ScuderiaFilter[]>([]);
  const [pilots, setPilots] = useState<MarketPilot[]>([]);
  const [pilotFilters, setPilotFilters] = useState<PilotFilter[]>([]);
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
  const selectedNegotiationTeam = managedTeams.find((team) => team.teamId === negotiationForm.teamId) ?? null;
  const isNegotiatingFormula2 = selectedNegotiationTeam?.teamCategory === 'formula_2';

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

  const sortedScuderias = useMemo(() => {
    const activeCategoryFilters = scuderiaFilters.filter((filter) => filter === 'formula_1' || filter === 'formula_2');
    const filtered = scuderias.filter((scuderia) => {
      const category = scuderia.category ?? 'formula_1';
      const matchesCategory = activeCategoryFilters.length === 0 || activeCategoryFilters.includes(category);
      const matchesStarter = !scuderiaFilters.includes('starter_available') || scuderia.starterVacancies > 0;
      const matchesReserve = !scuderiaFilters.includes('reserve_available') || scuderia.reserveVacancies > 0;

      return matchesCategory && matchesStarter && matchesReserve;
    });

    return filtered.sort((left, right) => {
      const leftCategory = (left.category ?? 'formula_1') === 'formula_1' ? 0 : 1;
      const rightCategory = (right.category ?? 'formula_1') === 'formula_1' ? 0 : 1;
      if (leftCategory !== rightCategory) return leftCategory - rightCategory;

      const leftGroup = left.starterVacancies > 0 ? 0 : left.reserveVacancies > 0 ? 1 : 2;
      const rightGroup = right.starterVacancies > 0 ? 0 : right.reserveVacancies > 0 ? 1 : 2;
      if (leftGroup !== rightGroup) return leftGroup - rightGroup;
      return left.name.localeCompare(right.name);
    });
  }, [scuderias, scuderiaFilters]);
  const totalPages = Math.max(1, Math.ceil(sortedScuderias.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleScuderias = sortedScuderias.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const sortedPilots = useMemo(() => {
    const activeCategoryFilters = pilotFilters.filter((filter) => filter === 'formula_1' || filter === 'formula_2');
    const activeContractFilters = pilotFilters.filter((filter) => filter === 'starter_contract' || filter === 'reserve_contract');
    const filtered = pilots.filter((pilot) => {
      const matchesCategory = activeCategoryFilters.length === 0 || pilot.contracts.some((contract) => (
        activeCategoryFilters.includes(contract.teamCategory)
      ));
      const matchesContract = activeContractFilters.length === 0 || pilot.contracts.some((contract) => (
        activeContractFilters.includes(contract.driverCategory === 'starter' ? 'starter_contract' : 'reserve_contract')
      ));

      return matchesCategory && matchesContract;
    });

    return filtered.sort((left, right) => {
      const leftRank = getPilotSortRank(left);
      const rightRank = getPilotSortRank(right);
      if (leftRank !== rightRank) return leftRank - rightRank;

      return right.marketScore - left.marketScore;
    });
  }, [pilots, pilotFilters]);
  const pilotTotalPages = Math.max(1, Math.ceil(sortedPilots.length / pageSize));
  const currentPilotPage = Math.min(pilotPage, pilotTotalPages);
  const visiblePilots = sortedPilots.slice((currentPilotPage - 1) * pageSize, currentPilotPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [scuderias.length, scuderiaFilters]);
  useEffect(() => {
    setPilotPage(1);
  }, [pilots.length, pilotFilters]);

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
    <div className="flex flex-col items-stretch justify-between gap-3 border-4 border-[#FF232B] bg-gray-700 p-3 text-center sm:flex-row sm:items-center sm:gap-4">
      <button
        type="button"
        className="bg-[#FF232B] px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300 sm:text-base"
        disabled={pageNumber <= 1}
        onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
      >
        {t.market.previousPage}
      </button>
      <span className="font-semibold sm:px-3">
        {t.market.page} {pageNumber} {t.market.pageOf} {totalPageCount}
      </span>
      <button
        type="button"
        className="bg-[#FF232B] px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300 sm:text-base"
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

  function getScuderiaSlots(scuderia: MarketScuderia) {
    return [
      {
        label: t.market.starter1,
        available: scuderia.starterCount < 1,
        driverName: scuderia.drivers.find((driver) => driver.category === 'starter' && driver.slotNumber === 1)?.displayName ?? null,
      },
      {
        label: t.market.starter2,
        available: scuderia.starterCount < 2,
        driverName: scuderia.drivers.find((driver) => driver.category === 'starter' && driver.slotNumber === 2)?.displayName ?? null,
      },
      {
        label: t.market.reserve1,
        available: scuderia.reserveCount < 1,
        driverName: scuderia.drivers.find((driver) => driver.category === 'reserve' && driver.slotNumber === 3)?.displayName ?? null,
      },
      {
        label: t.market.reserve2,
        available: scuderia.reserveCount < 2,
        driverName: scuderia.drivers.find((driver) => driver.category === 'reserve' && driver.slotNumber === 4)?.displayName ?? null,
      },
    ];
  }

  function toggleScuderiaFilter(filter: ScuderiaFilter) {
    setScuderiaFilters((current) => (
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    ));
  }

  function togglePilotFilter(filter: PilotFilter) {
    setPilotFilters((current) => (
      current.includes(filter)
        ? current.filter((item) => item !== filter)
        : [...current, filter]
    ));
  }

  function hasPilotContract(
    pilot: MarketPilot,
    teamCategory: 'formula_1' | 'formula_2',
    driverCategory: 'starter' | 'reserve',
  ) {
    return pilot.contracts.some((contract) => (
      contract.teamCategory === teamCategory && contract.driverCategory === driverCategory
    ));
  }

  function getPilotSortRank(pilot: MarketPilot) {
    if (pilot.contracts.length === 0) return 0;
    if (hasPilotContract(pilot, 'formula_2', 'reserve')) return 1;
    if (hasPilotContract(pilot, 'formula_2', 'starter')) return 2;
    if (hasPilotContract(pilot, 'formula_1', 'reserve')) return 3;
    if (hasPilotContract(pilot, 'formula_1', 'starter')) return 4;
    return 5;
  }

  function isFormula1Starter(pilot: MarketPilot) {
    return hasPilotContract(pilot, 'formula_1', 'starter');
  }

  function getPilotSituation(pilot: MarketPilot) {
    const starterF1 = pilot.contracts.find((contract) => contract.teamCategory === 'formula_1' && contract.driverCategory === 'starter');
    if (starterF1) return `${t.market.starterAtTeam} ${starterF1.teamName}`;

    const starterF2 = pilot.contracts.find((contract) => contract.teamCategory === 'formula_2' && contract.driverCategory === 'starter');
    if (starterF2) return `${t.market.starterAtTeam} ${starterF2.teamName}`;

    const reserveF1 = pilot.contracts.find((contract) => contract.teamCategory === 'formula_1' && contract.driverCategory === 'reserve');
    if (reserveF1) return `${t.market.reserveAtTeam} ${reserveF1.teamName}`;

    const reserveF2 = pilot.contracts.find((contract) => contract.teamCategory === 'formula_2' && contract.driverCategory === 'reserve');
    if (reserveF2) return `${t.market.reserveAtTeam} ${reserveF2.teamName}`;

    return t.market.free;
  }

  function renderScuderiaCategory(scuderia: MarketScuderia) {
    const isFormula2 = scuderia.category === 'formula_2';

    return (
      <span
        className={`inline-flex min-w-12 justify-center border-2 px-2 py-1 text-sm font-black ${
          isFormula2
            ? 'border-sky-300 bg-sky-300/15 text-sky-200'
            : 'border-[#FF232B] bg-[#FF232B]/15 text-[#FF232B]'
        }`}
      >
        {isFormula2 ? t.market.formula2 : t.market.formula1}
      </span>
    );
  }

  function renderScuderiaLogo(scuderia: MarketScuderia, className: string) {
    return (
      <img
        src={scuderia.logoUrl || getLocalScuderiaLogoPath(scuderia.name)}
        alt=""
        className={className}
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
    );
  }

  const negotiationMinimumSalary = negotiatingPilot
    ? isNegotiatingFormula2
      ? 0
      : negotiationForm.category === 'reserve'
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
    const firstTeam = managedTeams[0] ?? null;
    const isFormula2 = firstTeam?.teamCategory === 'formula_2';

    setNegotiatingPilot(pilot);
    setNegotiationForm({
      teamId: firstTeam?.teamId ?? '',
      contractRaces: '8',
      salaryPerRace: isFormula2 ? '0' : String(pilot.minimumSalary),
      category: 'starter',
    });
  }

  function updateNegotiationCategory(category: 'starter' | 'reserve') {
    setNegotiationForm((current) => ({
      ...current,
      category,
      salaryPerRace: negotiatingPilot
        ? String(isNegotiatingFormula2 ? 0 : category === 'reserve' ? Math.round(negotiatingPilot.minimumSalary * 0.25) : negotiatingPilot.minimumSalary)
        : current.salaryPerRace,
    }));
  }

  function updateNegotiationTeam(teamId: string) {
    const team = managedTeams.find((managedTeam) => managedTeam.teamId === teamId);
    setNegotiationForm((current) => ({
      ...current,
      teamId,
      salaryPerRace: team?.teamCategory === 'formula_2'
        ? '0'
        : String(current.category === 'reserve' && negotiatingPilot
          ? Math.round(negotiatingPilot.minimumSalary * 0.25)
          : negotiatingPilot?.minimumSalary ?? current.salaryPerRace),
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
          salaryPerRace: isNegotiatingFormula2 ? 0 : salaryValue,
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
      <div className="bg-black/45 px-5 py-4 sm:px-8 sm:py-8">
        <FtohHeader
          onLogout={logout}
          showBackButton
          backText={null}
          onBackClick={() => router.push('/')}
        />

        <section className="mx-auto mt-8 w-full max-w-6xl border-8 border-[#FF232B] bg-gray-800/90 p-3 shadow-2xl sm:mt-10 sm:border-[14px] sm:p-6">
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
                      <div className="flex flex-wrap gap-2 border-x-4 border-[#FF232B] bg-gray-800 p-3">
                        {([
                          ['formula_1', t.market.formula1],
                          ['formula_2', t.market.formula2],
                          ['starter_available', t.market.starterAvailable],
                          ['reserve_available', t.market.reserveAvailable],
                        ] as const).map(([filter, label]) => {
                          const isActive = scuderiaFilters.includes(filter);

                          return (
                            <button
                              key={filter}
                              type="button"
                              className={`border-2 px-3 py-2 text-xs font-black uppercase transition sm:text-sm ${
                                isActive
                                  ? 'border-[#FF232B] bg-[#FF232B] text-white'
                                  : 'border-gray-500 bg-gray-900 text-gray-200 hover:border-[#FF232B]'
                              }`}
                              onClick={() => toggleScuderiaFilter(filter)}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {visibleScuderias.length === 0 ? (
                        <div className="border-4 border-[#FF232B] bg-gray-700 p-6 text-center">
                          {t.market.noScuderias}
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-3 lg:hidden">
                            {visibleScuderias.map((scuderia) => {
                              const hasVacancy = scuderia.starterVacancies > 0 || scuderia.reserveVacancies > 0;

                              return (
                                <article
                                  key={scuderia.id}
                                  className={`border-4 border-gray-900 bg-gray-700 p-3 ${hasVacancy ? '' : 'opacity-45 grayscale'}`}
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    {renderScuderiaLogo(scuderia, 'h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16')}
                                    <div className="min-w-0">
                                      <div className="flex min-w-0 items-center gap-2">
                                        <p className="truncate text-lg font-bold sm:text-xl">{scuderia.name}</p>
                                        {renderScuderiaCategory(scuderia)}
                                      </div>
                                      <p className="truncate text-sm text-gray-300">{scuderia.tag}</p>
                                    </div>
                                  </div>

                                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {getScuderiaSlots(scuderia).map((slot) => (
                                      <div
                                        key={`${scuderia.id}-${slot.label}`}
                                        className={`border-2 px-2 py-2 text-center text-xs font-semibold sm:text-sm ${
                                          slot.available
                                            ? 'border-[#FF232B] bg-gray-900 text-white'
                                            : 'border-gray-600 bg-gray-800 text-gray-400'
                                        }`}
                                      >
                                        <p className="mb-1 uppercase text-gray-300">{slot.label}</p>
                                        <p className="truncate">{slot.available ? t.market.available : slot.driverName ?? t.market.occupied}</p>
                                      </div>
                                    ))}
                                  </div>
                                </article>
                              );
                            })}
                          </div>

                          <table className="hidden w-full table-fixed border-collapse text-left lg:table">
                            <thead>
                              <tr className="bg-[#FF232B] text-white">
                                <th className="w-[28%] p-3">{t.market.scuderias}</th>
                                <th className="w-[12%] p-3 text-center">{t.market.category}</th>
                                <th className="p-3 text-center">{t.market.starter1}</th>
                                <th className="p-3 text-center">{t.market.starter2}</th>
                                <th className="p-3 text-center">{t.market.reserve1}</th>
                                <th className="p-3 text-center">{t.market.reserve2}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visibleScuderias.map((scuderia) => {
                                const hasVacancy = scuderia.starterVacancies > 0 || scuderia.reserveVacancies > 0;

                                return (
                                  <tr
                                    key={scuderia.id}
                                    className={`border-b-4 border-gray-900 bg-gray-700 ${hasVacancy ? '' : 'opacity-45 grayscale'}`}
                                  >
                                    <td className="p-3">
                                      <div className="flex min-w-0 items-center gap-4">
                                        {renderScuderiaLogo(scuderia, 'h-14 w-14 shrink-0 object-contain')}
                                        <div className="min-w-0">
                                          <p className="truncate text-lg font-bold">{scuderia.name}</p>
                                          <p className="truncate text-sm text-gray-300">{scuderia.tag}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3 text-center">{renderScuderiaCategory(scuderia)}</td>
                                    {getScuderiaSlots(scuderia).map((slot) => (
                                      <td key={`${scuderia.id}-${slot.label}`} className="p-3 text-center">
                                        <span className={`inline-block w-full border-2 px-2 py-2 text-sm font-semibold sm:px-3 sm:text-base ${
                                          slot.available
                                            ? 'border-[#FF232B] bg-gray-900 text-white'
                                            : 'border-gray-600 bg-gray-800 text-gray-400'
                                        }`}
                                        >
                                          <span className="block truncate">
                                            {slot.available ? t.market.available : slot.driverName ?? t.market.occupied}
                                          </span>
                                        </span>
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </>
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
                      <div className="flex flex-wrap gap-2 border-x-4 border-[#FF232B] bg-gray-800 p-3">
                        {([
                          ['formula_1', t.market.formula1],
                          ['formula_2', t.market.formula2],
                          ['starter_contract', t.market.starterContractFilter],
                          ['reserve_contract', t.market.reserveContractFilter],
                        ] as const).map(([filter, label]) => {
                          const isActive = pilotFilters.includes(filter);

                          return (
                            <button
                              key={filter}
                              type="button"
                              className={`border-2 px-3 py-2 text-xs font-black uppercase transition sm:text-sm ${
                                isActive
                                  ? 'border-[#FF232B] bg-[#FF232B] text-white'
                                  : 'border-gray-500 bg-gray-900 text-gray-200 hover:border-[#FF232B]'
                              }`}
                              onClick={() => togglePilotFilter(filter)}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="lg:hidden">
                        {visiblePilots.length === 0 ? (
                          <div className="border-4 border-[#FF232B] bg-gray-700 p-6 text-center text-gray-300">
                            {t.market.noPilots}
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {visiblePilots.map((pilot) => (
                              <article
                                key={pilot.id}
                                className={`border-4 border-gray-900 bg-gray-700 p-3 ${isFormula1Starter(pilot) ? 'opacity-70' : ''}`}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <DriverCircle
                                    number={pilot.driverNumber ?? '--'}
                                    color={pilot.starterTeamColor ?? '#6B7280'}
                                    size="sm"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-lg font-bold sm:text-xl">{pilot.username}</p>
                                    <p className="mt-1 text-xl font-bold text-white sm:text-2xl">
                                      <TooltipValue tooltip={getMinimumSalaryTooltip(pilot)}>
                                        {money(pilot.minimumSalary)}
                                      </TooltipValue>
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  <div className="border-2 border-gray-900 bg-gray-800 p-2 text-center">
                                    <p className="text-[11px] font-bold uppercase text-gray-300">{t.market.marketScore}</p>
                                    <p className="mt-1 font-semibold">
                                      <TooltipValue tooltip={getMarketScoreTooltip(pilot)}>
                                        {pilot.marketScore.toFixed(2)}
                                      </TooltipValue>
                                    </p>
                                  </div>
                                  <div className="border-2 border-gray-900 bg-gray-800 p-2 text-center">
                                    <p className="text-[11px] font-bold uppercase text-gray-300">{t.market.overall}</p>
                                    <p className="mt-1">
                                      <TooltipValue tooltip={getOverallTooltip(pilot)}>
                                        {pilot.overall.toFixed(2)}
                                      </TooltipValue>
                                    </p>
                                  </div>
                                  <div className="border-2 border-gray-900 bg-gray-800 p-2 text-center">
                                    <p className="text-[11px] font-bold uppercase text-gray-300">{t.market.commercialScore}</p>
                                    <p className="mt-1">
                                      <TooltipValue tooltip={getCommercialScoreTooltip(pilot)}>
                                        {pilot.commercialScore.toFixed(2)}
                                      </TooltipValue>
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                  <div className="border-2 border-gray-900 bg-gray-800 p-3">
                                    <p className="text-xs font-bold uppercase text-gray-300">{t.market.personalSponsor}</p>
                                    {pilot.sponsor ? (
                                      <div className="mt-2 flex min-w-0 items-center gap-2">
                                        {pilot.sponsor.logoUrl && (
                                          <img src={pilot.sponsor.logoUrl} alt="" className="h-8 w-8 shrink-0 object-contain" />
                                        )}
                                        <span className="truncate text-sm font-semibold">{pilot.sponsor.name}</span>
                                      </div>
                                    ) : (
                                      <p className="mt-2 text-sm text-gray-400">{t.market.no}</p>
                                    )}
                                  </div>
                                  <div className="border-2 border-gray-900 bg-gray-800 p-3">
                                    <p className="text-xs font-bold uppercase text-gray-300">{t.market.situation}</p>
                                    <p className="mt-2 text-sm font-semibold">{getPilotSituation(pilot)}</p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={isFormula1Starter(pilot)}
                                  onClick={() => openNegotiation(pilot)}
                                  className="mt-3 w-full bg-[#FF232B] px-3 py-3 text-sm font-bold uppercase disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
                                >
                                  {t.market.negotiate}
                                </button>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="hidden lg:block">
                        <table className="w-full table-fixed border-collapse text-left">
                          <thead>
                            <tr className="bg-[#FF232B] text-white">
                              <th className="w-[24%] p-3">{t.market.pilots}</th>
                              <th className="w-[17%] p-3 text-left">{t.market.minimumSalary}</th>
                              <th className="p-3 text-center">{t.market.marketScore}</th>
                              <th className="p-3 text-center">{t.market.overall}</th>
                              <th className="p-3 text-center">{t.market.commercialScore}</th>
                              <th className="p-3 text-center">{t.market.personalSponsor}</th>
                              <th className="p-3 text-center">{t.market.situation}</th>
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
                                className={`border-b-4 border-gray-900 bg-gray-700 ${isFormula1Starter(pilot) ? 'opacity-70' : ''}`}
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
                                  {getPilotSituation(pilot)}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    disabled={isFormula1Starter(pilot)}
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
            {!isNegotiatingFormula2 && (
              <p className="text-sm text-gray-300">
                {t.market.minimumSalary}: {money(negotiationMinimumSalary)}
              </p>
            )}

            <label className="mt-5 block text-sm font-semibold" htmlFor="market-team">
              {t.market.team}
            </label>
            <select
              id="market-team"
              required
              value={negotiationForm.teamId}
              onChange={(event) => updateNegotiationTeam(event.target.value)}
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
            {negotiationForm.category === 'reserve' && !isNegotiatingFormula2 && (
              <p className="mt-2 border border-[#FF232B] bg-black/50 p-3 text-sm font-semibold text-red-100">
                {t.market.reserveSalaryWarning}
              </p>
            )}

            {!isNegotiatingFormula2 && (
              <>
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
              </>
            )}

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

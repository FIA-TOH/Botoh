'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSnackbar, useAppSnackbar } from '@/components/AppSnackbar';
import { apiUrl } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/i18n';
import {
  EconomicScuderia,
  SponsorCatalogItem,
  SponsorMarketResult,
  SponsorMarketSection,
} from '@/components/admin/SponsorMarketSection';
import {
  EMPTY_SPONSOR_FORM,
  SponsorFormData,
  SponsorFormModal,
} from '@/components/admin/SponsorFormModal';
import { PaginationControls, usePagination } from '@/components/admin/PaginationControls';

interface AdminUser {
  id: string;
  username: string;
  role: string;
  shortUsername: string | null;
  teamPrincipal: boolean;
  teamAssistant: boolean;
  driver: boolean;
  teamMemberships: TeamMembership[];
  driverNumber: number | null;
  language: 'pt' | 'en' | 'es';
}

type Scuderia = EconomicScuderia;
interface TeamGarageManage {
  id: string; name: string; carName: string; cashTotal: number; climateCostPerRace: number;
  pitCrewCostPerRace: number; salaryCostPerRace: number; sponsorIncomePerRace: number;
  climateMonitoringLevel: number; pitCrewLevel: number;
  financialHistory: { id: string; amount: number; entryType: string; reason: string; occurredAt: string }[];
  drivers: {
    id: string;
    userId: string | null;
    displayName: string;
    driverNumber: number | null;
    category: 'starter' | 'reserve';
    contractEndsAfterRaces: number;
    salaryPerRace: number;
  }[];
  sponsors: TeamSponsor[];
}
interface TeamSponsor {
  id: string; sponsorId?: string; name: string; category: string; slotNumber: number;
  contractRacesRemaining?: number; initialReward?: number; rewardPerRace?: number;
  seasonMissions: Mission[]; raceMissions: Mission[];
}
interface Mission { id: string; title: string; reward: number; racesToComplete?: number }
interface RaceProgressAlert {
  id: string;
  entityType: 'driver_contract' | 'sponsor_contract' | 'season_mission';
  teamName: string;
  entityName: string;
  detail: string;
  createdAt: string;
}

type TeamMembershipRole = 'team_principal' | 'team_assistant' | 'driver';

interface TeamMembership {
  teamId: string;
  teamName?: string;
  teamTag?: string;
  teamColor?: string;
  roles: TeamMembershipRole[];
  driverCategory?: 'starter' | 'reserve' | null;
  contractRaces?: number | null;
  salaryPerRace?: number | null;
}

interface UserFormData {
  username: string;
  password: string;
  shortUsername: string;
  teamMemberships: {
    teamId: string;
    roles: TeamMembershipRole[];
    driverCategory: 'starter' | 'reserve';
    contractRaces: string;
    salaryPerRace: string;
  }[];
  driverNumber: string;
  language: 'pt' | 'en' | 'es';
}

interface ScuderiaFormData {
  name: string;
  tag: string;
  emoji: string;
  color: string;
  logoUrl: string;
  momentoComercial: number;
  prestigio: number;
  agressividade: number;
  popularidade: number;
  tecnica: number;
  nacionalidades: string;
  setores: string[];
}

const EMPTY_USER_FORM: UserFormData = {
  username: '',
  password: '',
  shortUsername: '',
  teamMemberships: [],
  driverNumber: '',
  language: 'pt',
};

const EMPTY_SCUDERIA_FORM: ScuderiaFormData = {
  name: '',
  tag: '',
  emoji: '',
  color: '#FFFFFF',
  logoUrl: '',
  momentoComercial: 50,
  prestigio: 1,
  agressividade: 1,
  popularidade: 1,
  tecnica: 1,
  nacionalidades: '',
  setores: [],
};

const MEMBERSHIP_ROLE_OPTIONS: { value: TeamMembershipRole; label: string }[] = [
  { value: 'team_principal', label: 'Chefe de equipe' },
  { value: 'team_assistant', label: 'Assistente de equipe' },
  { value: 'driver', label: 'Piloto' },
];

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function limitScuderiaEmoji(value: string) {
  return Array.from(value).slice(0, 2).join('');
}

function getLocalScuderiaLogoPath(teamName: string) {
  return `/img/scuderia/logos/${encodeURIComponent(teamName.trim().toLowerCase())}.png`;
}

function getReadableTextColor(backgroundColor?: string) {
  if (!backgroundColor || !/^#[0-9A-Fa-f]{6}$/.test(backgroundColor)) {
    return '#FFFFFF';
  }

  const red = parseInt(backgroundColor.slice(1, 3), 16);
  const green = parseInt(backgroundColor.slice(3, 5), 16);
  const blue = parseInt(backgroundColor.slice(5, 7), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.62 ? '#111827' : '#FFFFFF';
}

export default function AdminPage() {
  const { isLoading, isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const { snackbar, showSnackbar, closeSnackbar } = useAppSnackbar();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [scuderias, setScuderias] = useState<Scuderia[]>([]);
  const [sponsorCatalog, setSponsorCatalog] = useState<SponsorCatalogItem[]>([]);
  const [raceProgressAlerts, setRaceProgressAlerts] = useState<RaceProgressAlert[]>([]);
  const [raceProgressLoading, setRaceProgressLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserFormData>(EMPTY_USER_FORM);
  const [savingUser, setSavingUser] = useState(false);

  const [scuderiaModalOpen, setScuderiaModalOpen] = useState(false);
  const [editingScuderiaId, setEditingScuderiaId] = useState<string | null>(null);
  const [scuderiaForm, setScuderiaForm] = useState<ScuderiaFormData>(EMPTY_SCUDERIA_FORM);
  const [savingScuderia, setSavingScuderia] = useState(false);
  const [managingScuderia, setManagingScuderia] = useState<Scuderia | null>(null);
  const [managedGarage, setManagedGarage] = useState<TeamGarageManage | null>(null);
  const [financeForm, setFinanceForm] = useState({ amount: '', reason: '' });
  const [carNameDraft, setCarNameDraft] = useState('');
  const [driverForm, setDriverForm] = useState({
    username: '',
    category: 'reserve' as 'starter' | 'reserve',
    contractRaces: '8',
    salaryPerRace: '4500000',
  });
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [sponsorForm, setSponsorForm] = useState<SponsorFormData>(EMPTY_SPONSOR_FORM);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [editingSponsorId, setEditingSponsorId] = useState<string | null>(null);
  const [teamSponsorForm, setTeamSponsorForm] = useState({
    sponsorId: '', category: 'title_sponsor',
    contractRacesRemaining: '', initialReward: '', rewardPerRace: '',
  });
  const [editingTeamSponsorId, setEditingTeamSponsorId] = useState<string | null>(null);
  const financialHistoryRef = React.useRef<HTMLDivElement | null>(null);
  const [missionModal, setMissionModal] = useState<{
    sponsor: TeamSponsor;
    type: 'race' | 'season';
    mission?: Mission;
  } | null>(null);
  const [missionForm, setMissionForm] = useState({ title: '', reward: '', racesToComplete: '' });
  const sponsorCategoryLimits = {
    title_sponsor: 1,
    main_partner: 2,
    official_partner: 4,
    minor_sponsor: 8,
    personal_sponsor: 4,
  } as const;
  const [openSections, setOpenSections] = useState({
    users: false,
    scuderias: false,
    sponsors: false,
    raceLogs: false,
    sponsorMarket: false,
  });

  const sortedScuderias = useMemo(
    () => [...scuderias].sort((a, b) => a.name.localeCompare(b.name)),
    [scuderias],
  );
  const availableScuderias = useMemo(
    () =>
      sortedScuderias.filter(
        (scuderia) =>
          !userForm.teamMemberships.some((membership) => membership.teamId === scuderia.id),
      ),
    [sortedScuderias, userForm.teamMemberships],
  );
  const usersPagination = usePagination(users);
  const scuderiasPagination = usePagination(sortedScuderias);
  const sponsorsPagination = usePagination(sponsorCatalog);

  async function loadAdminData() {
    setLoadingData(true);

    try {
      const [usersResponse, scuderiasResponse, sponsorsResponse, raceAlertsResponse] = await Promise.all([
        fetch(apiUrl('/api/admin/users'), { headers: getAuthHeaders() }),
        fetch(apiUrl('/api/admin/scuderias'), { headers: getAuthHeaders() }),
        fetch(apiUrl('/api/admin/sponsors'), { headers: getAuthHeaders() }),
        fetch(apiUrl('/api/admin/race-progress/alerts'), { headers: getAuthHeaders(), cache: 'no-store' }),
      ]);

      const usersData = await usersResponse.json();
      const scuderiasData = await scuderiasResponse.json();
      const sponsorsData = await sponsorsResponse.json();
      const raceAlertsData = await raceAlertsResponse.json();

      if (!usersData.success) throw new Error(usersData.message || t.admin.loadUsersFailed);
      if (!scuderiasData.success) throw new Error(scuderiasData.message || t.admin.loadScuderiasFailed);

      setUsers(usersData.users);
      setScuderias(scuderiasData.scuderias);
      if (sponsorsData.success) setSponsorCatalog(sponsorsData.sponsors);
      if (raceAlertsData.success) setRaceProgressAlerts(raceAlertsData.alerts);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.loadDataFailed, 'error');
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAdminData();
    }
  }, [isAuthenticated, user?.role]);

  function openCreateUser() {
    setEditingUserId(null);
    setUserForm(EMPTY_USER_FORM);
    setUserModalOpen(true);
  }

  function openEditUser(adminUser: AdminUser) {
    setEditingUserId(adminUser.id);
    setUserForm({
      username: adminUser.username,
      password: '',
      shortUsername: adminUser.shortUsername ?? '',
      teamMemberships: adminUser.teamMemberships.map((membership) => ({
        teamId: membership.teamId,
        roles: membership.roles,
        driverCategory: membership.driverCategory ?? 'reserve',
        contractRaces: String(membership.contractRaces ?? 8),
        salaryPerRace: String(membership.salaryPerRace ?? 0),
      })),
      driverNumber: adminUser.driverNumber?.toString() ?? '',
      language: adminUser.language ?? 'pt',
    });
    setUserModalOpen(true);
  }

  function openCreateScuderia() {
    setEditingScuderiaId(null);
    setScuderiaForm(EMPTY_SCUDERIA_FORM);
    setScuderiaModalOpen(true);
  }

  function openEditScuderia(scuderia: Scuderia) {
    setEditingScuderiaId(scuderia.id);
    setScuderiaForm({
      name: scuderia.name,
      tag: scuderia.tag,
      emoji: scuderia.emoji ?? '',
      color: scuderia.color,
      logoUrl: scuderia.logoUrl ?? '',
      momentoComercial: scuderia.momentoComercial,
      prestigio: scuderia.prestigio,
      agressividade: scuderia.agressividade,
      popularidade: scuderia.popularidade,
      tecnica: scuderia.tecnica,
      nacionalidades: (scuderia.nacionalidades ?? []).join(', '),
      setores: scuderia.setores ?? [],
    });
    setScuderiaModalOpen(true);
  }

  async function saveUser(event: React.FormEvent) {
    event.preventDefault();

    if (userForm.teamMemberships.some((membership) => membership.roles.length === 0)) {
      showSnackbar(t.admin.membershipRoleRequired, 'error');
      return;
    }

    setSavingUser(true);

    try {
      const response = await fetch(
        apiUrl(editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users'),
        {
          method: editingUserId ? 'PUT' : 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...userForm,
            driverNumber: Number(userForm.driverNumber),
            teamMemberships: userForm.teamMemberships.map((membership) => ({
              ...membership,
              contractRaces: membership.roles.includes('driver')
                ? Number(membership.contractRaces)
                : null,
              salaryPerRace: membership.roles.includes('driver')
                ? Number(membership.salaryPerRace)
                : null,
              driverCategory: membership.roles.includes('driver')
                ? membership.driverCategory
                : null,
            })),
          }),
        },
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.saveUserFailed);

      showSnackbar(editingUserId ? t.admin.userUpdated : t.admin.userCreated, 'success');
      setUserModalOpen(false);
      await refreshAdminViews();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.saveUserFailed, 'error');
    } finally {
      setSavingUser(false);
    }
  }

  async function deleteUser(userId: string) {
    if (!window.confirm('Excluir este usuário?')) return;

    try {
      const response = await fetch(apiUrl(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.deleteUserFailed);

      showSnackbar(t.admin.userDeleted, 'success');
      await refreshAdminViews();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.deleteUserFailed, 'error');
    }
  }

  async function saveScuderia(event: React.FormEvent) {
    event.preventDefault();

    if (Array.from(scuderiaForm.emoji.trim()).length > 2) {
      showSnackbar(t.admin.scuderiaEmojiInvalid, 'error');
      return;
    }

    setSavingScuderia(true);

    try {
      const response = await fetch(
        apiUrl(editingScuderiaId ? `/api/admin/scuderias/${editingScuderiaId}` : '/api/admin/scuderias'),
        {
          method: editingScuderiaId ? 'PUT' : 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...scuderiaForm,
            emoji: scuderiaForm.emoji.trim(),
            logoUrl: scuderiaForm.logoUrl || null,
            nacionalidades: scuderiaForm.nacionalidades.split(',').map((value) => value.trim()).filter(Boolean),
          }),
        },
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.saveScuderiaFailed);

      showSnackbar(editingScuderiaId ? t.admin.scuderiaUpdated : t.admin.scuderiaCreated, 'success');
      setScuderiaModalOpen(false);
      await refreshAdminViews();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.saveScuderiaFailed, 'error');
    } finally {
      setSavingScuderia(false);
    }
  }

  async function deleteScuderia(scuderiaId: string) {
    if (!window.confirm('Excluir esta scuderia? Usuários dela ficarão sem time.')) return;

    try {
      const response = await fetch(apiUrl(`/api/admin/scuderias/${scuderiaId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.deleteScuderiaFailed);

      showSnackbar(t.admin.scuderiaDeleted, 'success');
      await refreshAdminViews();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.deleteScuderiaFailed, 'error');
    }
  }
  async function openManageScuderia(scuderia: Scuderia) {
    setManagingScuderia(scuderia);
    const response = await fetch(apiUrl(`/api/admin/scuderias/${scuderia.id}/manage`), { headers: getAuthHeaders(), cache: 'no-store' });
    const data = await response.json();
    if (data.success) {
      setManagedGarage(data.garage);
      setCarNameDraft(data.garage.carName);
    }
  }
  async function refreshManagedGarage() {
    if (!managingScuderia) return;
    await openManageScuderia(managingScuderia);
  }
  async function refreshAdminViews() {
    await Promise.all([
      loadAdminData(),
      managingScuderia ? refreshManagedGarage() : Promise.resolve(),
    ]);
  }
  async function progressRace(direction: 'advance' | 'rollback') {
    setRaceProgressLoading(true);

    try {
      const response = await fetch(apiUrl('/api/admin/race-progress'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ direction }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.actionFailed);

      showSnackbar(direction === 'advance' ? t.admin.raceAdvanced : t.admin.raceRolledBack, 'success');
      await refreshAdminViews();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.actionFailed, 'error');
    } finally {
      setRaceProgressLoading(false);
    }
  }
  async function clearRaceProgressAlerts() {
    const response = await fetch(apiUrl('/api/admin/race-progress/alerts'), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return;
    }
    setRaceProgressAlerts([]);
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  async function submitFinance(event: React.FormEvent) {
    event.preventDefault();
    if (!managingScuderia) return;
    const amount = Number(financeForm.amount.replace(',', '.'));
    const response = await fetch(apiUrl(`/api/admin/scuderias/${managingScuderia.id}/finance-entries`), {
      method: 'POST', headers: getAuthHeaders(),
      body: JSON.stringify({ amount: Math.abs(amount), entryType: amount >= 0 ? 'income' : 'expense', reason: financeForm.reason }),
    });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return;
    }
    setFinanceForm({ amount: '', reason: '' });
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  const normalizedFinanceAmount = financeForm.amount.replace(',', '.');
  const financeAmountIsValid = /^-?\d+(?:[.,]\d+)?$/.test(financeForm.amount)
    && Number.isFinite(Number(normalizedFinanceAmount));
  const assignedSponsorIds = new Set(managedGarage?.sponsors.map((sponsor) => sponsor.sponsorId) ?? []);
  const availableSponsorCatalog = sponsorCatalog.filter(
    (sponsor) => editingTeamSponsorId || !assignedSponsorIds.has(sponsor.id),
  );
  const availableSponsorCategories = Object.entries(sponsorCategoryLimits)
    .filter(([category, limit]) => {
      if (editingTeamSponsorId) return true;
      const currentCount = managedGarage?.sponsors.filter((sponsor) => sponsor.category === category).length ?? 0;
      return currentCount < limit;
    })
    .map(([category]) => category);
  function formatFinancialReason(reason: string) {
    if (reason.startsWith('Failed mission ')) {
      return `${t.admin.failedMission} ${reason.replace('Failed mission ', '')}`;
    }
    return reason;
  }
  function formatFinancialDate(date: string) {
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() - 3);
    return adjustedDate.toLocaleString('pt-BR');
  }
  useEffect(() => {
    if (!editingTeamSponsorId && availableSponsorCategories.length > 0 && !availableSponsorCategories.includes(teamSponsorForm.category)) {
      setTeamSponsorForm((current) => ({ ...current, category: availableSponsorCategories[0] }));
    }
  }, [availableSponsorCategories, editingTeamSponsorId, teamSponsorForm.category]);
  useEffect(() => {
    const historyElement = financialHistoryRef.current;
    if (!historyElement) return;

    requestAnimationFrame(() => {
      historyElement.scrollTop = historyElement.scrollHeight;
    });
  }, [managedGarage?.financialHistory]);
  async function saveCarName() {
    if (!managingScuderia) return;
    const response = await fetch(apiUrl(`/api/admin/scuderias/${managingScuderia.id}/car-name`), {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ carName: carNameDraft }),
    });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return;
    }
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  async function saveManagedDriver(event: React.FormEvent) {
    event.preventDefault();
    if (!managingScuderia) return;

    const payload = {
      username: driverForm.username,
      category: driverForm.category,
      contractRaces: Number(driverForm.contractRaces),
      salaryPerRace: Number(driverForm.salaryPerRace),
    };
    const response = await fetch(
      editingDriverId
        ? apiUrl(`/api/admin/scuderias/${managingScuderia.id}/drivers/${editingDriverId}`)
        : apiUrl(`/api/admin/scuderias/${managingScuderia.id}/drivers`),
      {
        method: editingDriverId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingDriverId ? {
          category: payload.category,
          contractRaces: payload.contractRaces,
          salaryPerRace: payload.salaryPerRace,
        } : payload),
      },
    );
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.garage.driverActionFailed, 'error');
      return;
    }

    setEditingDriverId(null);
    setDriverForm({ username: '', category: 'reserve', contractRaces: '8', salaryPerRace: '4500000' });
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  function startEditManagedDriver(driver: TeamGarageManage['drivers'][number]) {
    setEditingDriverId(driver.id);
    setDriverForm({
      username: driver.displayName,
      category: driver.category,
      contractRaces: String(driver.contractEndsAfterRaces),
      salaryPerRace: String(driver.salaryPerRace),
    });
  }
  async function removeManagedDriver(driverId: string) {
    if (!managingScuderia) return;
    const response = await fetch(apiUrl(`/api/admin/scuderias/${managingScuderia.id}/drivers/${driverId}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.garage.driverActionFailed, 'error');
      return;
    }
    if (editingDriverId === driverId) {
      setEditingDriverId(null);
      setDriverForm({ username: '', category: 'reserve', contractRaces: '8', salaryPerRace: '4500000' });
    }
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  function openMissionModal(sponsor: TeamSponsor, type: 'race' | 'season', mission?: Mission) {
    setMissionModal({ sponsor, type, mission });
    setMissionForm({
      title: mission?.title ?? '',
      reward: String(mission?.reward ?? ''),
      racesToComplete: String(mission?.racesToComplete ?? ''),
    });
  }
  async function saveMission(event: React.FormEvent) {
    event.preventDefault();
    if (!missionModal) return;
    const payload = {
      title: missionForm.title,
      reward: Number(missionForm.reward.replace(',', '.')),
      racesToComplete: missionModal.type === 'season' ? Number(missionForm.racesToComplete) : undefined,
    };
    const response = await fetch(
      missionModal.mission
        ? apiUrl(`/api/admin/sponsor-missions/${missionModal.type}/${missionModal.mission.id}`)
        : apiUrl(`/api/admin/team-sponsors/${missionModal.sponsor.id}/${missionModal.type}-missions`),
      {
        method: missionModal.mission ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return;
    }
    setMissionModal(null);
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  async function removeMission(missionId: string, type: 'race' | 'season') {
    const response = await fetch(apiUrl(`/api/admin/sponsor-missions/${type}/${missionId}`), { method: 'DELETE', headers: getAuthHeaders() });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return;
    }
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  async function resolveMission(missionId: string, type: 'race' | 'season', outcome: 'success' | 'failure') {
    const response = await fetch(apiUrl(`/api/admin/sponsor-missions/${type}/${missionId}/resolve`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ outcome }),
    });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return;
    }
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  async function removeTeamSponsor(id: string) {
    const response = await fetch(apiUrl(`/api/admin/team-sponsors/${id}`), { method: 'DELETE', headers: getAuthHeaders() });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return;
    }
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  async function saveCatalogSponsor(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(apiUrl(editingSponsorId ? `/api/admin/sponsors/${editingSponsorId}` : '/api/admin/sponsors'), {
      method: editingSponsorId ? 'PUT' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(sponsorForm),
    });
    const data = await response.json();
    if (data.success) {
      setSponsorForm(EMPTY_SPONSOR_FORM);
      setEditingSponsorId(null);
      setSponsorModalOpen(false);
      showSnackbar(t.admin.actionCompleted, 'success');
      await refreshAdminViews();
    } else {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
    }
  }
  function openCreateSponsor() {
    setEditingSponsorId(null);
    setSponsorForm(EMPTY_SPONSOR_FORM);
    setSponsorModalOpen(true);
  }
  function startEditSponsor(sponsor: SponsorCatalogItem) {
    setEditingSponsorId(sponsor.id);
    setSponsorForm({
      name: sponsor.name,
      logoUrl: sponsor.logoUrl ?? '',
      nacionalidade: sponsor.nacionalidade ?? '',
      tipo: sponsor.tipo ?? '',
      setor: sponsor.setor,
      felicidade: sponsor.felicidade,
      prestigio: sponsor.prestigio,
      agressividade: sponsor.agressividade,
      focoEmMidia: sponsor.focoEmMidia,
      focoTecnico: sponsor.focoTecnico,
      nacionalismo: sponsor.nacionalismo,
      orcamento: sponsor.orcamento,
      ambicao: sponsor.ambicao,
      fidelidade: sponsor.fidelidade,
      publicoAlvo1: sponsor.publicoAlvo1,
      publicoAlvo2: sponsor.publicoAlvo2,
    });
    setSponsorModalOpen(true);
  }
  async function deleteCatalogSponsor(sponsorId: string) {
    const response = await fetch(apiUrl(`/api/admin/sponsors/${sponsorId}`), { method: 'DELETE', headers: getAuthHeaders() });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return;
    }
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  function updateSponsorDraft(sponsor: SponsorCatalogItem) {
    setSponsorCatalog((current) => current.map((row) => row.id === sponsor.id ? sponsor : row));
  }
  async function saveSponsorDraft(sponsor: SponsorCatalogItem) {
    const response = await fetch(apiUrl(`/api/admin/sponsors/${sponsor.id}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(sponsor),
    });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      await loadAdminData();
    }
  }
  function updateScuderiaDraft(scuderia: Scuderia) {
    setScuderias((current) => current.map((row) => row.id === scuderia.id ? scuderia : row));
  }
  async function saveScuderiaDraft(scuderia: Scuderia) {
    const response = await fetch(apiUrl(`/api/admin/scuderias/${scuderia.id}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...scuderia, logoUrl: scuderia.logoUrl || null }),
    });
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      await loadAdminData();
    }
  }
  async function generateSponsorMarketRound(teamId: string) {
    const response = await fetch(apiUrl(`/api/admin/scuderias/${teamId}/sponsor-market`), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    const data: { success: boolean; marketResult?: SponsorMarketResult; message?: string } = await response.json();
    if (!data.success || !data.marketResult) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return null;
    }
    return data.marketResult;
  }
  async function saveTeamSponsor(event: React.FormEvent) {
    event.preventDefault();
    if (!managingScuderia) return;
    const payload = {
      sponsorId: teamSponsorForm.sponsorId,
      category: teamSponsorForm.category,
      contractRacesRemaining: Number(teamSponsorForm.contractRacesRemaining),
      initialReward: Number(teamSponsorForm.initialReward),
      rewardPerRace: Number(teamSponsorForm.rewardPerRace),
    };
    const response = await fetch(
      editingTeamSponsorId
        ? apiUrl(`/api/admin/team-sponsors/${editingTeamSponsorId}`)
        : apiUrl(`/api/admin/scuderias/${managingScuderia.id}/sponsors`),
      {
        method: editingTeamSponsorId ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(editingTeamSponsorId ? {
          category: payload.category,
          contractRacesRemaining: payload.contractRacesRemaining,
          initialReward: payload.initialReward,
          rewardPerRace: payload.rewardPerRace,
        } : payload),
      },
    );
    const data = await response.json();
    if (!data.success) {
      showSnackbar(data.message || t.admin.actionFailed, 'error');
      return;
    }
    setEditingTeamSponsorId(null);
    setTeamSponsorForm({ sponsorId: '', category: 'title_sponsor', contractRacesRemaining: '', initialReward: '', rewardPerRace: '' });
    showSnackbar(t.admin.actionCompleted, 'success');
    await refreshAdminViews();
  }
  function startEditTeamSponsor(sponsor: TeamSponsor) {
    setEditingTeamSponsorId(sponsor.id);
    setTeamSponsorForm({
      sponsorId: sponsor.sponsorId ?? '',
      category: sponsor.category,
      contractRacesRemaining: String(sponsor.contractRacesRemaining ?? ''),
      initialReward: String(sponsor.initialReward ?? ''),
      rewardPerRace: String(sponsor.rewardPerRace ?? ''),
    });
  }
  function raceAlertTypeLabel(type: RaceProgressAlert['entityType']) {
    if (type === 'driver_contract') return t.admin.driverContractExpired;
    if (type === 'sponsor_contract') return t.admin.sponsorContractExpired;
    return t.admin.seasonMissionExpired;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Carregando...
      </main>
    );
  }

  if (!isAuthenticated) return null;

  if (user?.role !== 'admin') {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <button className="px-4 py-2 bg-blue-600 rounded-lg" onClick={() => router.push('/')}>
            Voltar para Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <button className="px-4 py-2 bg-gray-700 rounded-lg mb-4" onClick={() => router.push('/')}>
              Voltar
            </button>
            <h1 className="text-3xl font-bold">Administração</h1>
            <p className="text-gray-300">Usuários e scuderias conectados ao banco de dados.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={raceProgressLoading}
                onClick={() => progressRace('advance')}
                className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {t.admin.advanceRace}
              </button>
              <button
                type="button"
                disabled={raceProgressLoading}
                onClick={() => progressRace('rollback')}
                className="rounded-lg bg-amber-700 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {t.admin.rollbackRace}
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-400">Logado como</p>
            <p className="font-semibold mb-3">{user?.username}</p>
            <button className="px-4 py-2 bg-red-600 rounded-lg" onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        <AppSnackbar
          message={snackbar.message}
          type={snackbar.type}
          isOpen={snackbar.isOpen}
          onClose={closeSnackbar}
        />

        <section className="mb-6 rounded-lg bg-gray-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => setOpenSections((current) => ({ ...current, users: !current.users }))}
            >
              <span className={`text-xl transition-transform ${openSections.users ? 'rotate-90' : ''}`}>&rsaquo;</span>
              <h2 className="text-2xl font-semibold">Usuários</h2>
            </button>
            {openSections.users && (
              <button className="rounded-lg bg-purple-600 px-4 py-2" onClick={openCreateUser}>
                Criar Novo Usuário
              </button>
            )}
          </div>

          {openSections.users && <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-300">
                <tr>
                  <th className="py-2">Usuario</th>
                  <th className="py-2">Curto</th>
                  <th className="py-2">Scuderias</th>
                  <th className="py-2">Número</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usersPagination.rows.map((adminUser) => (
                  <tr key={adminUser.id} className="border-t border-gray-700">
                    <td className="py-3">{adminUser.username}</td>
                    <td className="py-3">{adminUser.shortUsername ?? '-'}</td>
                    <td className="py-3">
                      {adminUser.teamMemberships.length
                        ? (
                          <div className="flex flex-wrap gap-2">
                            {adminUser.teamMemberships.map((membership) => {
                              const roleLabels = membership.roles
                                .map((role) => MEMBERSHIP_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role)
                                .join(', ');
                              const backgroundColor = membership.teamColor ?? '#374151';

                              return (
                                <span
                                  key={`${adminUser.id}-${membership.teamId}`}
                                  title={roleLabels}
                                  className="inline-flex rounded-full px-3 py-1 text-sm font-semibold shadow-sm"
                                  style={{
                                    backgroundColor,
                                    color: getReadableTextColor(backgroundColor),
                                  }}
                                >
                                  {membership.teamName}
                                </span>
                              );
                            })}
                          </div>
                        )
                        : '-'}
                    </td>
                    <td className="py-3">{adminUser.driverNumber ?? '-'}</td>
                    <td className="py-3 text-right">
                      <button className="px-3 py-1 bg-gray-600 rounded mr-2" onClick={() => openEditUser(adminUser)}>
                        Editar
                      </button>
                      <button className="px-3 py-1 bg-red-700 rounded" onClick={() => deleteUser(adminUser.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {!loadingData && users.length === 0 && (
                  <tr>
                    <td className="py-4 text-gray-400" colSpan={5}>Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationControls labels={t.admin} {...usersPagination} />
          </div>}
        </section>

        <section className="mb-6 rounded-lg bg-gray-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => setOpenSections((current) => ({ ...current, scuderias: !current.scuderias }))}
            >
              <span className={`text-xl transition-transform ${openSections.scuderias ? 'rotate-90' : ''}`}>&rsaquo;</span>
              <h2 className="text-2xl font-semibold">Scuderias</h2>
            </button>
            {openSections.scuderias && (
              <button className="rounded-lg bg-red-600 px-4 py-2" onClick={openCreateScuderia}>
                Criar Nova Scuderia
              </button>
            )}
          </div>

          {openSections.scuderias && <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-gray-300">
                <tr>
                  <th className="py-2">Nome</th>
                  <th className="py-2">{t.admin.emoji}</th>
                  <th className="py-2">Abreviação</th>
                  <th className="py-2">Cor</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {scuderiasPagination.rows.map((scuderia) => (
                  <tr key={scuderia.id} className="border-t border-gray-700">
                    <td className="py-3">
                      <span className="inline-flex items-center gap-3">
                        <img
                          src={scuderia.logoUrl || getLocalScuderiaLogoPath(scuderia.name)}
                          alt=""
                          className="h-10 w-10 object-contain"
                          onError={(event) => {
                            const image = event.currentTarget;
                            const fallback = getLocalScuderiaLogoPath(scuderia.name);

                            if (scuderia.logoUrl && !image.src.endsWith(fallback)) {
                              image.src = fallback;
                              return;
                            }

                            image.style.display = 'none';
                          }}
                        />
                        {scuderia.name}
                      </span>
                    </td>
                    <td className="py-3 text-2xl">{scuderia.emoji || '---'}</td>
                    <td className="py-3">{scuderia.tag}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-5 w-5 rounded border border-white/30"
                          style={{ backgroundColor: scuderia.color }}
                        />
                        {scuderia.color}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="px-3 py-1 bg-gray-600 rounded mr-2" onClick={() => openEditScuderia(scuderia)}>
                        Editar
                      </button>
                      <button className="px-3 py-1 bg-blue-700 rounded mr-2" onClick={() => openManageScuderia(scuderia)}>
                        {t.admin.manage}
                      </button>
                      <button className="px-3 py-1 bg-red-700 rounded" onClick={() => deleteScuderia(scuderia.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
                {!loadingData && sortedScuderias.length === 0 && (
                  <tr>
                    <td className="py-4 text-gray-400" colSpan={5}>Nenhuma scuderia encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <PaginationControls labels={t.admin} {...scuderiasPagination} />
          </div>}
        </section>

        <section className="mb-6 rounded-lg bg-gray-800 p-6">
          <button
            type="button"
            className="inline-flex items-center gap-3 text-left"
            onClick={() => setOpenSections((current) => ({ ...current, sponsors: !current.sponsors }))}
          >
            <span className={`text-xl transition-transform ${openSections.sponsors ? 'rotate-90' : ''}`}>&rsaquo;</span>
            <h2 className="text-2xl font-semibold">{t.admin.sponsors}</h2>
          </button>
          {openSections.sponsors && (
            <div className="mt-4">
              <button type="button" onClick={openCreateSponsor} className="mb-4 rounded bg-purple-600 px-4 py-2">
                {t.admin.createSponsor}
              </button>
              {sponsorCatalog.length === 0 ? (
                <div className="text-gray-400">{t.admin.sponsorsEmpty}</div>
              ) : (
                <div className="space-y-2">
                  {sponsorsPagination.rows.map((sponsor) => (
                    <div key={sponsor.id} className="flex items-center justify-between rounded bg-gray-700 p-3">
                      <div className="flex items-center gap-3">
                        {sponsor.logoUrl && (
                          <img src={sponsor.logoUrl} alt="" className="h-10 w-10 object-contain" />
                        )}
                        <span>{sponsor.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded bg-gray-600 px-3 py-1" onClick={() => startEditSponsor(sponsor)}>
                          {t.admin.edit}
                        </button>
                        <button className="rounded bg-red-700 px-3 py-1" onClick={() => deleteCatalogSponsor(sponsor.id)}>
                          {t.admin.remove}
                        </button>
                      </div>
                    </div>
                  ))}
                  <PaginationControls labels={t.admin} {...sponsorsPagination} />
                </div>
              )}
            </div>
          )}
        </section>

        <section className="rounded-lg bg-gray-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => setOpenSections((current) => ({ ...current, raceLogs: !current.raceLogs }))}
            >
              <span className={`text-xl transition-transform ${openSections.raceLogs ? 'rotate-90' : ''}`}>&rsaquo;</span>
              <h2 className="text-2xl font-semibold">{t.admin.raceProgressLogs}</h2>
            </button>
            {openSections.raceLogs && raceProgressAlerts.length > 0 && (
              <button
                type="button"
                onClick={clearRaceProgressAlerts}
                className="rounded bg-red-700 px-3 py-1 font-semibold hover:bg-red-600"
              >
                {t.admin.clear}
              </button>
            )}
          </div>
          {openSections.raceLogs && (
            <div className="mt-4 max-h-80 overflow-y-auto">
              {raceProgressAlerts.length === 0 ? (
                <div className="text-gray-400">{t.admin.raceProgressLogsEmpty}</div>
              ) : (
                <div className="space-y-2">
                  {raceProgressAlerts.map((alert) => (
                    <div key={alert.id} className="rounded bg-gray-700 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{raceAlertTypeLabel(alert.entityType)}</p>
                        <p className="text-sm text-gray-300">{formatFinancialDate(alert.createdAt)}</p>
                      </div>
                      <p className="text-sm text-gray-200">
                        {alert.teamName} - {alert.detail || alert.entityName}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
        <SponsorMarketSection
          labels={t.admin}
          sponsors={sponsorCatalog}
          scuderias={sortedScuderias}
          isOpen={openSections.sponsorMarket}
          onToggle={() => setOpenSections((current) => ({ ...current, sponsorMarket: !current.sponsorMarket }))}
          onCreateSponsor={openCreateSponsor}
          onSponsorDraftChange={updateSponsorDraft}
          onSponsorSave={saveSponsorDraft}
          onScuderiaDraftChange={updateScuderiaDraft}
          onScuderiaSave={saveScuderiaDraft}
          onGenerateMarket={generateSponsorMarketRound}
        />
      </div>

      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={saveUser}
            className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-gray-800 p-6"
          >
            <h2 className="text-2xl font-bold mb-4">{editingUserId ? 'Editar Usuário' : 'Criar Novo Usuário'}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm mb-2">Usuario</span>
                <input
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  name="username"
                  value={userForm.username}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))}
                  minLength={3}
                  maxLength={50}
                  required
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-2">Senha</span>
                <input
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  type="password"
                  value={userForm.password}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                  minLength={6}
                  required={!editingUserId}
                  placeholder={editingUserId ? 'Deixe em branco para manter a atual' : ''}
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-2">Usuario curto</span>
                <input
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  value={userForm.shortUsername}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, shortUsername: event.target.value.toUpperCase() }))}
                  minLength={1}
                  maxLength={3}
                  pattern="[A-Z0-9]+"
                  required
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-2">Numero do piloto</span>
                <input
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  type="number"
                  value={userForm.driverNumber}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, driverNumber: event.target.value }))}
                  min={0}
                  max={999}
                  required
                />
              </label>

              <label className="block">
                <span className="block text-sm mb-2">Idioma</span>
                <select
                  className="w-full bg-gray-700 rounded-lg px-4 py-2"
                  value={userForm.language}
                  onChange={(event) => setUserForm((prev) => ({ ...prev, language: event.target.value as 'pt' | 'en' | 'es' }))}
                >
                  <option value="pt">Portugues</option>
                  <option value="en">Ingles</option>
                  <option value="es">Espanhol</option>
                </select>
              </label>
            </div>

            <div className="mt-4">
              <span className="mb-3 block text-sm">Scuderias relacionadas</span>

              <div className="space-y-3">
                {userForm.teamMemberships.map((membership, index) => (
                  <div key={`${membership.teamId}-${index}`} className="grid grid-cols-1 gap-3 rounded-lg bg-gray-900/40 p-3 sm:grid-cols-[1fr_auto]">
                    <select
                      className="w-full bg-gray-700 rounded-lg px-4 py-2"
                      value={membership.teamId}
                      onChange={(event) =>
                        setUserForm((prev) => ({
                          ...prev,
                          teamMemberships: prev.teamMemberships.map((current, currentIndex) =>
                            currentIndex === index ? { ...current, teamId: event.target.value } : current,
                          ),
                        }))
                      }
                      required
                    >
                      <option value="">Selecione a scuderia</option>
                      {sortedScuderias.map((scuderia) => (
                        <option
                          key={scuderia.id}
                          value={scuderia.id}
                          disabled={
                            scuderia.id !== membership.teamId
                            && userForm.teamMemberships.some((current) => current.teamId === scuderia.id)
                          }
                        >
                          {scuderia.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="rounded-lg bg-red-700 px-4 py-2"
                      onClick={() =>
                        setUserForm((prev) => ({
                          ...prev,
                          teamMemberships: prev.teamMemberships.filter((_, currentIndex) => currentIndex !== index),
                        }))
                      }
                    >
                      Remover
                    </button>

                    <div className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-3">
                      {MEMBERSHIP_ROLE_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 rounded-lg bg-gray-700 px-3 py-2">
                          <input
                            type="checkbox"
                            checked={membership.roles.includes(option.value)}
                            onChange={() =>
                              setUserForm((prev) => ({
                                ...prev,
                                teamMemberships: prev.teamMemberships.map((current, currentIndex) => {
                                  if (currentIndex !== index) return current;

                                  return {
                                    ...current,
                                    roles: current.roles.includes(option.value)
                                      ? current.roles.filter((role) => role !== option.value)
                                      : [...current.roles, option.value],
                                  };
                                }),
                              }))
                            }
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>

                    {membership.roles.includes('driver') && (
                      <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-800 p-3 sm:col-span-2 sm:grid-cols-3">
                        <label className="block">
                          <span className="mb-2 block text-sm">{t.garage.driverCategory}</span>
                          <select
                            className="w-full rounded-lg bg-gray-700 px-4 py-2"
                            value={membership.driverCategory}
                            onChange={(event) =>
                              setUserForm((prev) => ({
                                ...prev,
                                teamMemberships: prev.teamMemberships.map((current, currentIndex) =>
                                  currentIndex === index
                                    ? { ...current, driverCategory: event.target.value as 'starter' | 'reserve' }
                                    : current,
                                ),
                              }))
                            }
                          >
                            <option value="starter">{t.garage.starter}</option>
                            <option value="reserve">{t.garage.reserve}</option>
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm">{t.garage.contractDuration}</span>
                          <input
                            required
                            min={1}
                            type="number"
                            className="w-full rounded-lg bg-gray-700 px-4 py-2"
                            value={membership.contractRaces}
                            onChange={(event) =>
                              setUserForm((prev) => ({
                                ...prev,
                                teamMemberships: prev.teamMemberships.map((current, currentIndex) =>
                                  currentIndex === index
                                    ? { ...current, contractRaces: event.target.value }
                                    : current,
                                ),
                              }))
                            }
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm">{t.garage.salaryPerRace}</span>
                          <input
                            required
                            min={0}
                            type="number"
                            className="w-full rounded-lg bg-gray-700 px-4 py-2"
                            value={membership.salaryPerRace}
                            onChange={(event) =>
                              setUserForm((prev) => ({
                                ...prev,
                                teamMemberships: prev.teamMemberships.map((current, currentIndex) =>
                                  currentIndex === index
                                    ? { ...current, salaryPerRace: event.target.value }
                                    : current,
                                ),
                              }))
                            }
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-3 rounded-lg bg-gray-700 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                disabled={availableScuderias.length === 0}
                onClick={() =>
                  setUserForm((prev) => ({
                    ...prev,
                    teamMemberships: [
                      ...prev.teamMemberships,
                      {
                        teamId: sortedScuderias.find(
                          (scuderia) => !prev.teamMemberships.some((membership) => membership.teamId === scuderia.id),
                        )?.id ?? '',
                        roles: ['team_principal'],
                        driverCategory: 'reserve',
                        contractRaces: '8',
                        salaryPerRace: '4500000',
                      },
                    ],
                  }))
                }
              >
                Adicionar mais uma scuderia
              </button>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-purple-600 rounded-lg py-2 disabled:bg-purple-500" disabled={savingUser}>
                {savingUser ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="flex-1 bg-gray-600 rounded-lg py-2" onClick={() => setUserModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      {managingScuderia && managedGarage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4">
          <div className="mx-auto max-w-5xl rounded-lg bg-gray-800 p-6">
            <div className="mb-6 flex justify-between">
              <h2 className="text-2xl font-bold">{t.admin.manage}: {managingScuderia.name}</h2>
              <button onClick={() => { setManagingScuderia(null); setManagedGarage(null); }}>×</button>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <section>
                <h3 className="mb-2 font-bold">{t.admin.finances}</h3>
                <p>{t.garage.cash}: {managedGarage.cashTotal}</p>
                <p>{t.admin.climateCostPerRace}: {managedGarage.climateCostPerRace}</p>
                <p>{t.admin.pitCrewCostPerRace}: {managedGarage.pitCrewCostPerRace}</p>
                <p>{t.garage.salaries}: {managedGarage.salaryCostPerRace}</p>
                <p>{t.garage.sponsors}: {managedGarage.sponsorIncomePerRace}</p>
                <div className="mt-3 rounded bg-gray-700/70 p-3">
                  <p>{t.admin.climateMonitoringLevel}: {managedGarage.climateMonitoringLevel}</p>
                  <p>{t.admin.pitCrewLevel}: {managedGarage.pitCrewLevel}</p>
                </div>
                <form onSubmit={submitFinance} className="mt-3 flex gap-2">
                  <input
                    inputMode="decimal"
                    className="w-32 rounded bg-gray-700 p-2"
                    value={financeForm.amount}
                    onChange={(e) => setFinanceForm((v) => ({ ...v, amount: e.target.value }))}
                    placeholder={t.admin.amount}
                  />
                  <input className="flex-1 rounded bg-gray-700 p-2" value={financeForm.reason} onChange={(e) => setFinanceForm((v) => ({ ...v, reason: e.target.value }))} placeholder={t.admin.reason} />
                  <button disabled={!financeAmountIsValid || !financeForm.reason.trim()} className="rounded bg-purple-600 px-3 disabled:cursor-not-allowed disabled:bg-gray-600">{t.admin.add}</button>
                </form>
              </section>
              <section>
                <h3 className="mb-2 font-bold">{t.admin.car}</h3>
                <div className="flex gap-2">
                  <input className="flex-1 rounded bg-gray-700 p-2" value={carNameDraft} onChange={(e) => setCarNameDraft(e.target.value)} />
                  <button className="rounded bg-purple-600 px-3" onClick={saveCarName}>{t.admin.save}</button>
                </div>
                <h3 className="mb-2 mt-4 font-bold">{t.garage.drivers}</h3>
                <form onSubmit={saveManagedDriver} className="grid gap-2 rounded bg-gray-900/40 p-3">
                  <input
                    required={!editingDriverId}
                    disabled={Boolean(editingDriverId)}
                    className="rounded bg-gray-700 p-2 disabled:opacity-60"
                    placeholder={t.garage.driverUsername}
                    value={driverForm.username}
                    onChange={(e) => setDriverForm((v) => ({ ...v, username: e.target.value }))}
                  />
                  <div className="grid gap-2 sm:grid-cols-3">
                    <select
                      required
                      className="rounded bg-gray-700 p-2"
                      value={driverForm.category}
                      onChange={(e) => setDriverForm((v) => ({ ...v, category: e.target.value as 'starter' | 'reserve' }))}
                    >
                      <option value="starter">{t.garage.starter}</option>
                      <option value="reserve">{t.garage.reserve}</option>
                    </select>
                    <input
                      required
                      min="1"
                      type="number"
                      className="rounded bg-gray-700 p-2"
                      placeholder={t.garage.contractDuration}
                      value={driverForm.contractRaces}
                      onChange={(e) => setDriverForm((v) => ({ ...v, contractRaces: e.target.value }))}
                    />
                    <input
                      required
                      min="0"
                      type="number"
                      className="rounded bg-gray-700 p-2"
                      placeholder={t.garage.salaryPerRace}
                      value={driverForm.salaryPerRace}
                      onChange={(e) => setDriverForm((v) => ({ ...v, salaryPerRace: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded bg-purple-600 px-3 py-2 font-semibold">
                      {editingDriverId ? t.admin.save : t.admin.add}
                    </button>
                    {editingDriverId && (
                      <button
                        type="button"
                        className="rounded bg-gray-600 px-3 py-2"
                        onClick={() => {
                          setEditingDriverId(null);
                          setDriverForm({ username: '', category: 'reserve', contractRaces: '8', salaryPerRace: '4500000' });
                        }}
                      >
                        {t.garage.cancel}
                      </button>
                    )}
                  </div>
                </form>
                <div className="mt-3 space-y-2">
                  {managedGarage.drivers.map((driver) => (
                    <div key={driver.id} className="rounded bg-gray-700 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{driver.displayName}</p>
                          <p className="text-sm text-gray-300">
                            {driver.category === 'starter' ? t.garage.starter : t.garage.reserve}
                            {' · '}
                            {t.garage.contractEndsIn}: {driver.contractEndsAfterRaces} {t.garage.races}
                            {' · '}
                            {t.garage.salary}: {driver.salaryPerRace}
                          </p>
                        </div>
                        <span className="flex gap-2">
                          <button
                            className="rounded bg-slate-500 px-3 py-1 font-semibold hover:bg-slate-400"
                            onClick={() => startEditManagedDriver(driver)}
                          >
                            {t.admin.edit}
                          </button>
                          <button
                            className="rounded bg-rose-700 px-3 py-1 font-semibold hover:bg-rose-600"
                            onClick={() => removeManagedDriver(driver.id)}
                          >
                            {t.admin.remove}
                          </button>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <section className="mt-6">
              <h3 className="mb-2 font-bold">{t.admin.financialHistory}</h3>
              <div ref={financialHistoryRef} className="h-40 overflow-y-auto rounded border border-white/30 bg-gray-900 p-3">
                {[...managedGarage.financialHistory].reverse().map((entry) => (
                  <p
                    key={entry.id}
                    className={entry.entryType === 'income' ? 'text-green-400' : 'text-red-400'}
                  >
                    {entry.entryType === 'income' ? '+' : '-'} {entry.amount} - {formatFinancialDate(entry.occurredAt)} - {formatFinancialReason(entry.reason)}
                  </p>
                ))}
              </div>
            </section>
            <section className="mt-6">
              <h3 className="mb-3 font-bold">{t.garage.sponsors}</h3>
              <form onSubmit={saveTeamSponsor} className="mb-4 grid gap-2 md:grid-cols-3">
                <select required className="rounded bg-gray-700 p-2" value={teamSponsorForm.sponsorId} onChange={(e) => setTeamSponsorForm((v) => ({ ...v, sponsorId: e.target.value }))} disabled={Boolean(editingTeamSponsorId)}>
                  <option value="">{t.admin.sponsorName}</option>
                  {availableSponsorCatalog.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>)}
                </select>
                <select required className="rounded bg-gray-700 p-2" value={teamSponsorForm.category} onChange={(e) => setTeamSponsorForm((v) => ({ ...v, category: e.target.value }))}>
                  {availableSponsorCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                <input required type="number" min="0" className="rounded bg-gray-700 p-2" placeholder={t.admin.contractDuration} value={teamSponsorForm.contractRacesRemaining} onChange={(e) => setTeamSponsorForm((v) => ({ ...v, contractRacesRemaining: e.target.value }))} />
                <input required type="number" min="0" className="rounded bg-gray-700 p-2" placeholder={t.admin.initialReward} value={teamSponsorForm.initialReward} onChange={(e) => setTeamSponsorForm((v) => ({ ...v, initialReward: e.target.value }))} />
                <input required type="number" min="0" className="rounded bg-gray-700 p-2" placeholder={t.admin.rewardPerRace} value={teamSponsorForm.rewardPerRace} onChange={(e) => setTeamSponsorForm((v) => ({ ...v, rewardPerRace: e.target.value }))} />
                <button className="rounded bg-purple-600 px-3 py-2">{editingTeamSponsorId ? t.admin.save : t.admin.add}</button>
              </form>
              {managedGarage.sponsors.map((sponsor) => (
                <div key={sponsor.id} className="mb-4 rounded bg-gray-700 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong>{sponsor.name} - {sponsor.category}</strong>
                      <div className="mt-1 text-sm text-gray-300">
                        {t.admin.contractDuration}: {sponsor.contractRacesRemaining ?? 0} {t.garage.races}
                        {' Â· '}
                        {t.admin.initialReward}: {sponsor.initialReward ?? 0}
                        {' Â· '}
                        {t.admin.rewardPerRace}: {sponsor.rewardPerRace ?? 0}
                      </div>
                    </div>
                    <span className="flex gap-2">
                      <button
                        className="rounded bg-slate-500 px-3 py-1 font-semibold hover:bg-slate-400"
                        onClick={() => startEditTeamSponsor(sponsor)}
                      >
                        {t.admin.edit}
                      </button>
                      <button
                        className="rounded bg-rose-700 px-3 py-1 font-semibold hover:bg-rose-600"
                        onClick={() => removeTeamSponsor(sponsor.id)}
                      >
                        {t.admin.remove}
                      </button>
                    </span>
                  </div>
                  <p className="mt-2 font-semibold">{t.admin.raceMissions}</p>
                  {sponsor.raceMissions.map((m) => (
                    <div key={m.id} className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="mr-auto">{m.title} ({m.reward})</span>
                      <button className="rounded bg-slate-500 px-3 py-1 font-semibold hover:bg-slate-400" onClick={() => openMissionModal(sponsor, 'race', m)}>{t.admin.edit}</button>
                      <button className="rounded bg-emerald-600 px-3 py-1 font-bold hover:bg-emerald-500" onClick={() => resolveMission(m.id, 'race', 'success')}>OK</button>
                      <button className="rounded bg-rose-700 px-3 py-1 font-bold hover:bg-rose-600" onClick={() => resolveMission(m.id, 'race', 'failure')}>X</button>
                    </div>
                  ))}
                  <button className="mt-2 rounded bg-purple-600 px-3 py-2 font-semibold hover:bg-purple-500" onClick={() => openMissionModal(sponsor, 'race')}>{t.admin.add}</button>
                  <p className="mt-2 font-semibold">{t.admin.seasonMissions}</p>
                  {sponsor.seasonMissions.map((m) => (
                    <div key={m.id} className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="mr-auto">{m.title} ({m.reward}) {m.racesToComplete} {t.garage.races}</span>
                      <button className="rounded bg-slate-500 px-3 py-1 font-semibold hover:bg-slate-400" onClick={() => openMissionModal(sponsor, 'season', m)}>{t.admin.edit}</button>
                      <button className="rounded bg-emerald-600 px-3 py-1 font-bold hover:bg-emerald-500" onClick={() => resolveMission(m.id, 'season', 'success')}>OK</button>
                      <button className="rounded bg-rose-700 px-3 py-1 font-bold hover:bg-rose-600" onClick={() => resolveMission(m.id, 'season', 'failure')}>X</button>
                    </div>
                  ))}
                  <button className="mt-2 rounded bg-purple-600 px-3 py-2 font-semibold hover:bg-purple-500" onClick={() => openMissionModal(sponsor, 'season')}>{t.admin.add}</button>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}
      {missionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={saveMission} className="w-full max-w-md rounded-lg bg-gray-800 p-6">
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-bold">{missionModal.mission ? t.admin.edit : t.admin.add} {missionModal.type === 'race' ? t.admin.raceMissions : t.admin.seasonMissions}</h2>
              <button type="button" onClick={() => setMissionModal(null)}>×</button>
            </div>
            <div className="space-y-3">
              <input required className="w-full rounded bg-gray-700 p-2" placeholder={t.admin.missionTitle} value={missionForm.title} onChange={(e) => setMissionForm((v) => ({ ...v, title: e.target.value }))} />
              <input required inputMode="decimal" className="w-full rounded bg-gray-700 p-2" placeholder={t.admin.missionReward} value={missionForm.reward} onChange={(e) => setMissionForm((v) => ({ ...v, reward: e.target.value }))} />
              {missionModal.type === 'season' && (
                <input required type="number" min="1" className="w-full rounded bg-gray-700 p-2" placeholder={t.admin.racesToComplete} value={missionForm.racesToComplete} onChange={(e) => setMissionForm((v) => ({ ...v, racesToComplete: e.target.value }))} />
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded bg-gray-600 px-4 py-2" onClick={() => setMissionModal(null)}>{t.admin.remove}</button>
              <button className="rounded bg-purple-600 px-4 py-2">{t.admin.save}</button>
            </div>
          </form>
        </div>
      )}

      {sponsorModalOpen && (
        <SponsorFormModal
          labels={t.admin}
          isEditing={Boolean(editingSponsorId)}
          form={sponsorForm}
          onChange={setSponsorForm}
          onClose={() => setSponsorModalOpen(false)}
          onSubmit={saveCatalogSponsor}
        />
      )}

      {scuderiaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={saveScuderia} className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-4">{editingScuderiaId ? t.admin.editScuderia : t.admin.createScuderia}</h2>

            <label className="block mb-4">
              <span className="block text-sm mb-2">{t.admin.name}</span>
              <input
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
                value={scuderiaForm.name}
                onChange={(event) => setScuderiaForm((prev) => ({ ...prev, name: event.target.value }))}
                minLength={2}
                maxLength={100}
                required
              />
            </label>

            <label className="block mb-6">
              <span className="block text-sm mb-2">{t.admin.abbreviation}</span>
              <input
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
                value={scuderiaForm.tag}
                onChange={(event) => setScuderiaForm((prev) => ({ ...prev, tag: event.target.value.toUpperCase() }))}
                minLength={3}
                maxLength={3}
                pattern="[A-Z0-9]{3}"
                required
              />
            </label>

            <label className="block mb-6">
              <span className="block text-sm mb-2">{t.admin.emoji}</span>
              <input
                className="w-full bg-gray-700 rounded-lg px-4 py-2"
                value={scuderiaForm.emoji}
                onChange={(event) => setScuderiaForm((prev) => ({
                  ...prev,
                  emoji: limitScuderiaEmoji(event.target.value),
                }))}
                placeholder={t.admin.scuderiaEmojiPlaceholder}
              />
            </label>

            <label className="block mb-6">
              <span className="block text-sm mb-2">{t.admin.color}</span>
              <div className="flex gap-3">
                <input
                  className="h-10 w-16 rounded bg-gray-700"
                  type="color"
                  value={scuderiaForm.color}
                  onChange={(event) => setScuderiaForm((prev) => ({ ...prev, color: event.target.value.toUpperCase() }))}
                  required
                />
                <input
                  className="flex-1 bg-gray-700 rounded-lg px-4 py-2"
                  value={scuderiaForm.color}
                  onChange={(event) => setScuderiaForm((prev) => ({ ...prev, color: event.target.value.toUpperCase() }))}
                  pattern="#[0-9A-Fa-f]{6}"
                  required
                />
              </div>
            </label>

            <label className="mb-6 block">
              <span className="mb-2 block text-sm">{t.admin.logoUrl}</span>
              <input
                type="url"
                className="w-full rounded-lg bg-gray-700 px-4 py-2"
                value={scuderiaForm.logoUrl}
                onChange={(event) => setScuderiaForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
              />
            </label>

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {([
                ['momentoComercial', t.admin.commercialMomentum, 0, 100],
                ['prestigio', t.admin.prestige, 1, 5],
                ['agressividade', t.admin.aggressiveness, 0, 3],
                ['popularidade', t.admin.popularity, 0, 3],
                ['tecnica', t.admin.technique, 0, 3],
              ] as const).map(([field, label, min, max]) => (
                <label key={field}>
                  <span className="mb-2 block text-sm">{label}</span>
                  <input
                    required
                    type="number"
                    min={min}
                    max={max}
                    className="w-full rounded-lg bg-gray-700 px-4 py-2"
                    value={scuderiaForm[field]}
                    onChange={(event) => setScuderiaForm((prev) => ({ ...prev, [field]: Number(event.target.value) }))}
                  />
                </label>
              ))}
              <label className="sm:col-span-3">
                <span className="mb-2 block text-sm">{t.admin.nationalities}</span>
                <input
                  className="w-full rounded-lg bg-gray-700 px-4 py-2"
                  value={scuderiaForm.nacionalidades}
                  onChange={(event) => setScuderiaForm((prev) => ({ ...prev, nacionalidades: event.target.value }))}
                  placeholder={t.admin.commaSeparated}
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-red-600 rounded-lg py-2 disabled:bg-red-500" disabled={savingScuderia}>
                {savingScuderia ? t.admin.saving : t.admin.save}
              </button>
              <button type="button" className="flex-1 bg-gray-600 rounded-lg py-2" onClick={() => setScuderiaModalOpen(false)}>
                {t.admin.cancel}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

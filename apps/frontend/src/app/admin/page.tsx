'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/i18n';

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

interface Scuderia {
  id: string;
  name: string;
  tag: string;
  color: string;
}
interface TeamGarageManage {
  id: string; name: string; carName: string; cashTotal: number; climateCostPerRace: number;
  pitCrewCostPerRace: number; salaryCostPerRace: number; sponsorIncomePerRace: number;
  climateMonitoringLevel: number; pitCrewLevel: number;
  financialHistory: { id: string; amount: number; entryType: string; reason: string; occurredAt: string }[];
  drivers: { id: string; displayName: string; contractEndsAfterRaces: number; salaryPerRace: number }[];
  sponsors: TeamSponsor[];
}
interface TeamSponsor {
  id: string; sponsorId?: string; name: string; category: string; slotNumber: number;
  contractRacesRemaining?: number; initialReward?: number; rewardPerRace?: number;
  seasonMissions: Mission[]; raceMissions: Mission[];
}
interface Mission { id: string; title: string; reward: number; racesToComplete?: number }
interface SponsorCatalogItem { id: string; name: string; logoUrl?: string | null }

type TeamMembershipRole = 'team_principal' | 'team_assistant' | 'driver';

interface TeamMembership {
  teamId: string;
  teamName?: string;
  teamTag?: string;
  teamColor?: string;
  roles: TeamMembershipRole[];
}

interface UserFormData {
  username: string;
  password: string;
  shortUsername: string;
  teamMemberships: { teamId: string; roles: TeamMembershipRole[] }[];
  driverNumber: string;
  language: 'pt' | 'en' | 'es';
}

interface ScuderiaFormData {
  name: string;
  tag: string;
  color: string;
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
  color: '#FFFFFF',
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

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [scuderias, setScuderias] = useState<Scuderia[]>([]);
  const [sponsorCatalog, setSponsorCatalog] = useState<SponsorCatalogItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  const [newSponsorForm, setNewSponsorForm] = useState({ name: '', logoUrl: '' });
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

  async function loadAdminData() {
    setLoadingData(true);
    setError(null);

    try {
      const [usersResponse, scuderiasResponse, sponsorsResponse] = await Promise.all([
        fetch('/api/admin/users', { headers: getAuthHeaders() }),
        fetch('/api/admin/scuderias', { headers: getAuthHeaders() }),
        fetch('/api/admin/sponsors', { headers: getAuthHeaders() }),
      ]);

      const usersData = await usersResponse.json();
      const scuderiasData = await scuderiasResponse.json();
      const sponsorsData = await sponsorsResponse.json();

      if (!usersData.success) throw new Error(usersData.message || 'Falha ao carregar usuarios');
      if (!scuderiasData.success) throw new Error(scuderiasData.message || 'Falha ao carregar scuderias');

      setUsers(usersData.users);
      setScuderias(scuderiasData.scuderias);
      if (sponsorsData.success) setSponsorCatalog(sponsorsData.sponsors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar dados administrativos');
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
    setScuderiaForm({ name: scuderia.name, tag: scuderia.tag, color: scuderia.color });
    setScuderiaModalOpen(true);
  }

  async function saveUser(event: React.FormEvent) {
    event.preventDefault();

    if (userForm.teamMemberships.some((membership) => membership.roles.length === 0)) {
      setError('Selecione pelo menos uma função para cada scuderia.');
      return;
    }

    setSavingUser(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        editingUserId ? `/api/admin/users/${editingUserId}` : '/api/admin/users',
        {
          method: editingUserId ? 'PUT' : 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            ...userForm,
            driverNumber: Number(userForm.driverNumber),
          }),
        },
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Falha ao salvar usuario');

      setMessage(editingUserId ? 'Usuário atualizado.' : 'Usuário criado.');
      setUserModalOpen(false);
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar usuario');
    } finally {
      setSavingUser(false);
    }
  }

  async function deleteUser(userId: string) {
    if (!window.confirm('Excluir este usuário?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Falha ao excluir usuario');

      setMessage('Usuário excluído.');
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir usuario');
    }
  }

  async function saveScuderia(event: React.FormEvent) {
    event.preventDefault();
    setSavingScuderia(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(
        editingScuderiaId ? `/api/admin/scuderias/${editingScuderiaId}` : '/api/admin/scuderias',
        {
          method: editingScuderiaId ? 'PUT' : 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(scuderiaForm),
        },
      );

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Falha ao salvar scuderia');

      setMessage(editingScuderiaId ? 'Scuderia atualizada.' : 'Scuderia criada.');
      setScuderiaModalOpen(false);
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar scuderia');
    } finally {
      setSavingScuderia(false);
    }
  }

  async function deleteScuderia(scuderiaId: string) {
    if (!window.confirm('Excluir esta scuderia? Usuários dela ficarão sem time.')) return;

    try {
      const response = await fetch(`/api/admin/scuderias/${scuderiaId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Falha ao excluir scuderia');

      setMessage('Scuderia excluída.');
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir scuderia');
    }
  }
  async function openManageScuderia(scuderia: Scuderia) {
    setManagingScuderia(scuderia);
    const response = await fetch(`/api/admin/scuderias/${scuderia.id}/manage`, { headers: getAuthHeaders() });
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
  async function submitFinance(event: React.FormEvent) {
    event.preventDefault();
    if (!managingScuderia) return;
    const amount = Number(financeForm.amount.replace(',', '.'));
    await fetch(`/api/admin/scuderias/${managingScuderia.id}/finance-entries`, {
      method: 'POST', headers: getAuthHeaders(),
      body: JSON.stringify({ amount: Math.abs(amount), entryType: amount >= 0 ? 'income' : 'expense', reason: financeForm.reason }),
    });
    setFinanceForm({ amount: '', reason: '' });
    await refreshManagedGarage();
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
    if (financialHistoryRef.current) {
      financialHistoryRef.current.scrollTop = financialHistoryRef.current.scrollHeight;
    }
  }, [managedGarage?.financialHistory]);
  async function saveCarName() {
    if (!managingScuderia) return;
    await fetch(`/api/admin/scuderias/${managingScuderia.id}/car-name`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ carName: carNameDraft }),
    });
    await refreshManagedGarage();
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
    await fetch(
      missionModal.mission
        ? `/api/admin/sponsor-missions/${missionModal.type}/${missionModal.mission.id}`
        : `/api/admin/team-sponsors/${missionModal.sponsor.id}/${missionModal.type}-missions`,
      {
        method: missionModal.mission ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      },
    );
    setMissionModal(null);
    await refreshManagedGarage();
  }
  async function removeMission(missionId: string, type: 'race' | 'season') {
    await fetch(`/api/admin/sponsor-missions/${type}/${missionId}`, { method: 'DELETE', headers: getAuthHeaders() });
    await refreshManagedGarage();
  }
  async function resolveMission(missionId: string, type: 'race' | 'season', outcome: 'success' | 'failure') {
    await fetch(`/api/admin/sponsor-missions/${type}/${missionId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ outcome }),
    });
    await refreshManagedGarage();
  }
  async function removeTeamSponsor(id: string) {
    await fetch(`/api/admin/team-sponsors/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    await refreshManagedGarage();
  }
  async function saveCatalogSponsor(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(editingSponsorId ? `/api/admin/sponsors/${editingSponsorId}` : '/api/admin/sponsors', {
      method: editingSponsorId ? 'PUT' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(newSponsorForm),
    });
    const data = await response.json();
    if (data.success) {
      setNewSponsorForm({ name: '', logoUrl: '' });
      setEditingSponsorId(null);
      await loadAdminData();
    }
  }
  function startEditSponsor(sponsor: SponsorCatalogItem) {
    setEditingSponsorId(sponsor.id);
    setNewSponsorForm({ name: sponsor.name, logoUrl: sponsor.logoUrl ?? '' });
  }
  async function deleteCatalogSponsor(sponsorId: string) {
    await fetch(`/api/admin/sponsors/${sponsorId}`, { method: 'DELETE', headers: getAuthHeaders() });
    await loadAdminData();
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
    await fetch(
      editingTeamSponsorId
        ? `/api/admin/team-sponsors/${editingTeamSponsorId}`
        : `/api/admin/scuderias/${managingScuderia.id}/sponsors`,
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
    setEditingTeamSponsorId(null);
    setTeamSponsorForm({ sponsorId: '', category: 'title_sponsor', contractRacesRemaining: '', initialReward: '', rewardPerRace: '' });
    await refreshManagedGarage();
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
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-400">Logado como</p>
            <p className="font-semibold mb-3">{user?.username}</p>
            <button className="px-4 py-2 bg-red-600 rounded-lg" onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        {message && <div className="mb-4 rounded-lg bg-green-700 px-4 py-3">{message}</div>}
        {error && <div className="mb-4 rounded-lg bg-red-700 px-4 py-3">{error}</div>}

        <section className="mb-6 rounded-lg bg-gray-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => setOpenSections((current) => ({ ...current, users: !current.users }))}
            >
              <span className={`text-xl transition-transform ${openSections.users ? 'rotate-90' : ''}`}>›</span>
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
                {users.map((adminUser) => (
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
          </div>}
        </section>

        <section className="mb-6 rounded-lg bg-gray-800 p-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="flex items-center gap-3 text-left"
              onClick={() => setOpenSections((current) => ({ ...current, scuderias: !current.scuderias }))}
            >
              <span className={`text-xl transition-transform ${openSections.scuderias ? 'rotate-90' : ''}`}>›</span>
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
                  <th className="py-2">Abreviação</th>
                  <th className="py-2">Cor</th>
                  <th className="py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedScuderias.map((scuderia) => (
                  <tr key={scuderia.id} className="border-t border-gray-700">
                    <td className="py-3">{scuderia.name}</td>
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
                    <td className="py-4 text-gray-400" colSpan={4}>Nenhuma scuderia encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>}
        </section>

        <section className="rounded-lg bg-gray-800 p-6">
          <button
            type="button"
            className="flex items-center gap-3 text-left"
            onClick={() => setOpenSections((current) => ({ ...current, sponsors: !current.sponsors }))}
          >
            <span className={`text-xl transition-transform ${openSections.sponsors ? 'rotate-90' : ''}`}>›</span>
            <h2 className="text-2xl font-semibold">{t.admin.sponsors}</h2>
          </button>
          {openSections.sponsors && (
            <div className="mt-4">
              <form onSubmit={saveCatalogSponsor} className="mb-4 flex flex-wrap gap-2">
                <input required className="rounded bg-gray-700 p-2" placeholder={t.admin.sponsorName} value={newSponsorForm.name} onChange={(e) => setNewSponsorForm((v) => ({ ...v, name: e.target.value }))} />
                <input required type="url" className="min-w-72 flex-1 rounded bg-gray-700 p-2" placeholder={t.admin.logoUrl} value={newSponsorForm.logoUrl} onChange={(e) => setNewSponsorForm((v) => ({ ...v, logoUrl: e.target.value }))} />
                <button className="rounded bg-purple-600 px-4">{editingSponsorId ? t.admin.save : t.admin.addSponsor}</button>
              </form>
              {sponsorCatalog.length === 0 ? (
                <div className="text-gray-400">{t.admin.sponsorsEmpty}</div>
              ) : (
                <div className="space-y-2">
                  {sponsorCatalog.map((sponsor) => (
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
                </div>
              )}
            </div>
          )}
        </section>
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
                <p>{t.garage.weatherCenter}: {managedGarage.climateCostPerRace}</p>
                <p>{t.garage.pitCrew}: {managedGarage.pitCrewCostPerRace}</p>
                <p>{t.garage.salaries}: {managedGarage.salaryCostPerRace}</p>
                <p>{t.garage.sponsors}: {managedGarage.sponsorIncomePerRace}</p>
                <p>{t.garage.weatherMonitoring}: {managedGarage.climateMonitoringLevel}</p>
                <p>{t.garage.pitCrew}: {managedGarage.pitCrewLevel}</p>
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
                {managedGarage.drivers.map((driver) => <p key={driver.id}>{driver.displayName} — {driver.contractEndsAfterRaces} / {driver.salaryPerRace}</p>)}
              </section>
            </div>
            <section className="mt-6">
              <h3 className="mb-2 font-bold">{t.admin.financialHistory}</h3>
              <div ref={financialHistoryRef} className="max-h-40 overflow-y-auto rounded border border-white/30 bg-gray-900 p-3">
                {[...managedGarage.financialHistory].reverse().map((entry) => (
                  <p
                    key={entry.id}
                    className={entry.entryType === 'income' ? 'text-green-400' : 'text-red-400'}
                  >
                    {entry.entryType === 'income' ? '+' : '-'} {entry.amount} — {formatFinancialDate(entry.occurredAt)} — {formatFinancialReason(entry.reason)}
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
                    <strong>{sponsor.name} — {sponsor.category}</strong>
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
                      <button className="rounded bg-emerald-600 px-3 py-1 font-bold hover:bg-emerald-500" onClick={() => resolveMission(m.id, 'race', 'success')}>✓</button>
                      <button className="rounded bg-rose-700 px-3 py-1 font-bold hover:bg-rose-600" onClick={() => resolveMission(m.id, 'race', 'failure')}>✕</button>
                    </div>
                  ))}
                  <button className="mt-2 rounded bg-purple-600 px-3 py-2 font-semibold hover:bg-purple-500" onClick={() => openMissionModal(sponsor, 'race')}>{t.admin.add}</button>
                  <p className="mt-2 font-semibold">{t.admin.seasonMissions}</p>
                  {sponsor.seasonMissions.map((m) => (
                    <div key={m.id} className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="mr-auto">{m.title} ({m.reward}) {m.racesToComplete} {t.garage.races}</span>
                      <button className="rounded bg-slate-500 px-3 py-1 font-semibold hover:bg-slate-400" onClick={() => openMissionModal(sponsor, 'season', m)}>{t.admin.edit}</button>
                      <button className="rounded bg-emerald-600 px-3 py-1 font-bold hover:bg-emerald-500" onClick={() => resolveMission(m.id, 'season', 'success')}>✓</button>
                      <button className="rounded bg-rose-700 px-3 py-1 font-bold hover:bg-rose-600" onClick={() => resolveMission(m.id, 'season', 'failure')}>✕</button>
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

      {scuderiaModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form onSubmit={saveScuderia} className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingScuderiaId ? 'Editar Scuderia' : 'Criar Nova Scuderia'}</h2>

            <label className="block mb-4">
              <span className="block text-sm mb-2">Nome</span>
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
              <span className="block text-sm mb-2">Abreviação</span>
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
              <span className="block text-sm mb-2">Cor</span>
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

            <div className="flex gap-3">
              <button className="flex-1 bg-red-600 rounded-lg py-2 disabled:bg-red-500" disabled={savingScuderia}>
                {savingScuderia ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="flex-1 bg-gray-600 rounded-lg py-2" onClick={() => setScuderiaModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}


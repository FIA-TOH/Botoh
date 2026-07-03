'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSnackbar, useAppSnackbar } from '@/components/AppSnackbar';
import { FtohHeader } from '@/components/FtohHeader';
import { PaginationControls, usePagination } from '@/components/admin/PaginationControls';
import { apiUrl } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/i18n';

interface PublicHostUser {
  auth: string;
  name: string;
  rankingXp: number;
  championshipPoints: number;
  placementRacesRemaining: number;
  racesCount: number;
  qualyCount: number;
  circuitsCount: number;
  createdAt: string;
  lastLoginAt: string | null;
}

interface PublicHostCircuit {
  trackName: string;
  baseRecordTime: number | null;
  baseRecordDriver: string | null;
  recordLapTime: number | null;
  recordLapDriver: string | null;
  sector1RecordTime: number | null;
  sector1RecordDriver: string | null;
  sector2RecordTime: number | null;
  sector2RecordDriver: string | null;
  sector3RecordTime: number | null;
  sector3RecordDriver: string | null;
  playedCount: number;
  voteCount: number;
  driversCount: number;
  updatedAt: string;
}

interface PublicHostStanding {
  position: number;
  auth: string;
  name: string;
  championshipPoints: number;
  rankingXp: number;
  racesCount?: number;
  qualyCount?: number;
  placementRacesRemaining?: number;
}

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return Number(trimmed.replace(',', '.'));
}

export default function PublicHostAdminPage() {
  const { isLoading, isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const { snackbar, showSnackbar, closeSnackbar } = useAppSnackbar();

  const [publicUsers, setPublicUsers] = useState<PublicHostUser[]>([]);
  const [publicCircuits, setPublicCircuits] = useState<PublicHostCircuit[]>([]);
  const [publicChampionship, setPublicChampionship] = useState<PublicHostStanding[]>([]);
  const [publicRankings, setPublicRankings] = useState<PublicHostStanding[]>([]);
  const [publicUsersSearch, setPublicUsersSearch] = useState('');
  const [publicCircuitsSearch, setPublicCircuitsSearch] = useState('');
  const [selectedPublicUserAuth, setSelectedPublicUserAuth] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const filteredPublicUsers = useMemo(() => {
    const search = publicUsersSearch.trim().toLocaleLowerCase();
    if (!search) return publicUsers;
    return publicUsers.filter((publicUser) => [
      publicUser.name,
      publicUser.auth,
      publicUser.rankingXp,
      publicUser.championshipPoints,
      publicUser.racesCount,
      publicUser.qualyCount,
    ].join(' ').toLocaleLowerCase().includes(search));
  }, [publicUsers, publicUsersSearch]);

  const filteredPublicCircuits = useMemo(() => {
    const search = publicCircuitsSearch.trim().toLocaleLowerCase();
    if (!search) return publicCircuits;
    return publicCircuits.filter((circuit) => [
      circuit.trackName,
      circuit.baseRecordDriver,
      circuit.recordLapDriver,
      circuit.sector1RecordDriver,
      circuit.sector2RecordDriver,
      circuit.sector3RecordDriver,
    ].filter(Boolean).join(' ').toLocaleLowerCase().includes(search));
  }, [publicCircuits, publicCircuitsSearch]);

  const usersPagination = usePagination(filteredPublicUsers);
  const circuitsPagination = usePagination(filteredPublicCircuits);

  async function loadPublicHostData() {
    setLoadingData(true);

    try {
      const response = await fetch(apiUrl('/api/admin/public-host'), {
        headers: getAuthHeaders(),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.publicHostLoadFailed);

      setPublicUsers(data.users ?? []);
      setPublicCircuits(data.circuits ?? []);
      setPublicChampionship(data.championship ?? []);
      setPublicRankings(data.rankings ?? []);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.publicHostLoadFailed, 'error');
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadPublicHostData();
    }
  }, [isAuthenticated, user?.role]);

  function updatePublicUserDraft<T extends keyof PublicHostUser>(
    auth: string,
    field: T,
    value: PublicHostUser[T],
  ) {
    setPublicUsers((current) =>
      current.map((publicUser) =>
        publicUser.auth === auth ? { ...publicUser, [field]: value } : publicUser,
      ),
    );
  }

  function updatePublicCircuitDraft<T extends keyof PublicHostCircuit>(
    trackName: string,
    field: T,
    value: PublicHostCircuit[T],
  ) {
    setPublicCircuits((current) =>
      current.map((circuit) =>
        circuit.trackName === trackName ? { ...circuit, [field]: value } : circuit,
      ),
    );
  }

  async function savePublicUser(publicUser: PublicHostUser) {
    setSavingKey(`user:${publicUser.auth}`);

    try {
      const response = await fetch(apiUrl(`/api/admin/public-host/users/${encodeURIComponent(publicUser.auth)}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: publicUser.name.trim(),
          rankingXp: Number(publicUser.rankingXp),
          championshipPoints: Number(publicUser.championshipPoints),
          placementRacesRemaining: Number(publicUser.placementRacesRemaining),
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.actionFailed);

      showSnackbar(t.admin.publicUserUpdated, 'success');
      await loadPublicHostData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.actionFailed, 'error');
    } finally {
      setSavingKey(null);
    }
  }

  async function deletePublicUser(auth: string) {
    if (!window.confirm(t.admin.confirmDeleteUser)) return;

    setSavingKey(`user:${auth}`);
    try {
      const response = await fetch(apiUrl(`/api/admin/public-host/users/${encodeURIComponent(auth)}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.actionFailed);

      showSnackbar(t.admin.publicUserDeleted, 'success');
      await loadPublicHostData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.actionFailed, 'error');
    } finally {
      setSavingKey(null);
    }
  }

  async function savePublicCircuit(circuit: PublicHostCircuit) {
    setSavingKey(`circuit:${circuit.trackName}`);

    try {
      const response = await fetch(apiUrl(`/api/admin/public-host/circuits/${encodeURIComponent(circuit.trackName)}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          baseRecordTime: circuit.baseRecordTime,
          baseRecordDriver: circuit.baseRecordDriver,
          recordLapTime: circuit.recordLapTime,
          recordLapDriver: circuit.recordLapDriver,
          sector1RecordTime: circuit.sector1RecordTime,
          sector1RecordDriver: circuit.sector1RecordDriver,
          sector2RecordTime: circuit.sector2RecordTime,
          sector2RecordDriver: circuit.sector2RecordDriver,
          sector3RecordTime: circuit.sector3RecordTime,
          sector3RecordDriver: circuit.sector3RecordDriver,
          playedCount: Number(circuit.playedCount),
          voteCount: Number(circuit.voteCount),
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.actionFailed);

      showSnackbar(t.admin.publicCircuitUpdated, 'success');
      await loadPublicHostData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.actionFailed, 'error');
    } finally {
      setSavingKey(null);
    }
  }

  async function deletePublicCircuit(trackName: string) {
    if (!window.confirm(t.admin.confirmDeleteCircuit)) return;

    setSavingKey(`circuit:${trackName}`);
    try {
      const response = await fetch(apiUrl(`/api/admin/public-host/circuits/${encodeURIComponent(trackName)}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || t.admin.actionFailed);

      showSnackbar(t.admin.publicCircuitDeleted, 'success');
      await loadPublicHostData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : t.admin.actionFailed, 'error');
    } finally {
      setSavingKey(null);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        {t.common.loading}
      </main>
    );
  }

  if (!isAuthenticated) return null;

  if (user?.role !== 'admin') {
    router.push('/');
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-950 p-6 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <FtohHeader
          onLogout={logout}
          showBackButton
          onBackClick={() => router.push('/')}
          align="right"
        />

        <AppSnackbar
          message={snackbar.message}
          type={snackbar.type}
          isOpen={snackbar.isOpen}
          onClose={closeSnackbar}
        />

        <div className="mt-8">
          <h1 className="text-3xl font-bold">{t.admin.publicHostDashboard}</h1>
        </div>

        <section className="mt-8 rounded-lg bg-gray-900 p-5 shadow-xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{t.admin.publicUsers}</h2>
            <input
              type="search"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder:text-gray-400 md:w-96"
              value={publicUsersSearch}
              onChange={(event) => {
                setSelectedPublicUserAuth('');
                setPublicUsersSearch(event.target.value);
              }}
              placeholder={t.admin.searchPublicUsers}
            />
            <select
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white md:w-80"
              value={selectedPublicUserAuth}
              onChange={(event) => {
                const auth = event.target.value;
                const selectedUser = publicUsers.find((publicUser) => publicUser.auth === auth);
                setSelectedPublicUserAuth(auth);
                setPublicUsersSearch(selectedUser ? `${selectedUser.name} ${selectedUser.auth}` : '');
              }}
            >
              <option value="">{t.admin.selectPublicUser}</option>
              {publicUsers.map((publicUser) => (
                <option key={publicUser.auth} value={publicUser.auth}>
                  {publicUser.name}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="text-gray-300">
                <tr>
                  <th className="py-2">{t.admin.username}</th>
                  <th className="py-2">{t.admin.auth}</th>
                  <th className="py-2">{t.admin.rankingXp}</th>
                  <th className="py-2">{t.admin.championshipPoints}</th>
                  <th className="py-2">{t.admin.placementRaces}</th>
                  <th className="py-2">{t.admin.races}</th>
                  <th className="py-2">{t.admin.qualys}</th>
                  <th className="py-2 text-right">{t.admin.actions}</th>
                </tr>
              </thead>
              <tbody>
                {usersPagination.rows.map((publicUser) => (
                  <tr key={publicUser.auth} className="border-t border-gray-800">
                    <td className="py-3 pr-3">
                      <input
                        className="w-48 rounded bg-gray-800 px-3 py-2"
                        value={publicUser.name}
                        onChange={(event) => updatePublicUserDraft(publicUser.auth, 'name', event.target.value)}
                      />
                    </td>
                    <td className="max-w-[180px] truncate py-3 pr-3 font-mono text-sm text-gray-300">{publicUser.auth}</td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        className="w-24 rounded bg-gray-800 px-3 py-2"
                        value={publicUser.rankingXp}
                        onChange={(event) => updatePublicUserDraft(publicUser.auth, 'rankingXp', Number(event.target.value))}
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        className="w-24 rounded bg-gray-800 px-3 py-2"
                        value={publicUser.championshipPoints}
                        onChange={(event) => updatePublicUserDraft(publicUser.auth, 'championshipPoints', Number(event.target.value))}
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min={0}
                        max={5}
                        className="w-20 rounded bg-gray-800 px-3 py-2"
                        value={publicUser.placementRacesRemaining}
                        onChange={(event) => updatePublicUserDraft(publicUser.auth, 'placementRacesRemaining', Number(event.target.value))}
                      />
                    </td>
                    <td className="py-3 pr-3">{publicUser.racesCount}</td>
                    <td className="py-3 pr-3">{publicUser.qualyCount}</td>
                    <td className="py-3 text-right">
                      <button
                        className="mr-2 rounded bg-gray-700 px-3 py-1 disabled:cursor-not-allowed disabled:bg-gray-800"
                        disabled={savingKey === `user:${publicUser.auth}`}
                        onClick={() => savePublicUser(publicUser)}
                      >
                        {t.admin.save}
                      </button>
                      <button
                        className="rounded bg-red-700 px-3 py-1 disabled:cursor-not-allowed disabled:bg-gray-800"
                        disabled={savingKey === `user:${publicUser.auth}`}
                        onClick={() => deletePublicUser(publicUser.auth)}
                      >
                        {t.admin.delete}
                      </button>
                    </td>
                  </tr>
                ))}
                {!loadingData && filteredPublicUsers.length === 0 && (
                  <tr>
                    <td className="py-5 text-gray-400" colSpan={8}>{t.admin.noPublicUsersFound}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls labels={t.admin} {...usersPagination} />
        </section>

        <section className="mt-8 rounded-lg bg-gray-900 p-5 shadow-xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{t.admin.publicCircuits}</h2>
            <input
              type="search"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder:text-gray-400 md:w-96"
              value={publicCircuitsSearch}
              onChange={(event) => setPublicCircuitsSearch(event.target.value)}
              placeholder={t.admin.searchPublicCircuits}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] text-left">
              <thead className="text-gray-300">
                <tr>
                  <th className="py-2">{t.admin.track}</th>
                  <th className="py-2">{t.admin.baseRecord}</th>
                  <th className="py-2">{t.admin.lapRecord}</th>
                  <th className="py-2">{t.admin.sector1}</th>
                  <th className="py-2">{t.admin.sector2}</th>
                  <th className="py-2">{t.admin.sector3}</th>
                  <th className="py-2">{t.admin.played}</th>
                  <th className="py-2">{t.admin.votes}</th>
                  <th className="py-2 text-right">{t.admin.actions}</th>
                </tr>
              </thead>
              <tbody>
                {circuitsPagination.rows.map((circuit) => (
                  <tr key={circuit.trackName} className="border-t border-gray-800 align-top">
                    <td className="max-w-[220px] py-3 pr-3 font-semibold">{circuit.trackName}</td>
                    {([
                      ['baseRecordTime', 'baseRecordDriver'],
                      ['recordLapTime', 'recordLapDriver'],
                      ['sector1RecordTime', 'sector1RecordDriver'],
                      ['sector2RecordTime', 'sector2RecordDriver'],
                      ['sector3RecordTime', 'sector3RecordDriver'],
                    ] as const).map(([timeField, driverField]) => (
                      <td key={`${circuit.trackName}-${timeField}`} className="py-3 pr-3">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="mb-2 w-24 rounded bg-gray-800 px-3 py-2"
                          value={circuit[timeField] ?? ''}
                          onChange={(event) => updatePublicCircuitDraft(circuit.trackName, timeField, optionalNumber(event.target.value))}
                        />
                        <input
                          className="block w-32 rounded bg-gray-800 px-3 py-2"
                          value={circuit[driverField] ?? ''}
                          onChange={(event) => updatePublicCircuitDraft(circuit.trackName, driverField, event.target.value || null)}
                          placeholder={t.admin.driver}
                        />
                      </td>
                    ))}
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min={0}
                        className="w-20 rounded bg-gray-800 px-3 py-2"
                        value={circuit.playedCount}
                        onChange={(event) => updatePublicCircuitDraft(circuit.trackName, 'playedCount', Number(event.target.value))}
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min={0}
                        className="w-20 rounded bg-gray-800 px-3 py-2"
                        value={circuit.voteCount}
                        onChange={(event) => updatePublicCircuitDraft(circuit.trackName, 'voteCount', Number(event.target.value))}
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        className="mr-2 rounded bg-gray-700 px-3 py-1 disabled:cursor-not-allowed disabled:bg-gray-800"
                        disabled={savingKey === `circuit:${circuit.trackName}`}
                        onClick={() => savePublicCircuit(circuit)}
                      >
                        {t.admin.save}
                      </button>
                      <button
                        className="rounded bg-red-700 px-3 py-1 disabled:cursor-not-allowed disabled:bg-gray-800"
                        disabled={savingKey === `circuit:${circuit.trackName}`}
                        onClick={() => deletePublicCircuit(circuit.trackName)}
                      >
                        {t.admin.delete}
                      </button>
                    </td>
                  </tr>
                ))}
                {!loadingData && filteredPublicCircuits.length === 0 && (
                  <tr>
                    <td className="py-5 text-gray-400" colSpan={9}>{t.admin.noPublicCircuitsFound}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls labels={t.admin} {...circuitsPagination} />
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-lg bg-gray-900 p-5 shadow-xl">
            <h2 className="mb-5 text-2xl font-semibold">{t.admin.publicChampionship}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-gray-300">
                  <tr>
                    <th className="py-2">#</th>
                    <th className="py-2">{t.admin.username}</th>
                    <th className="py-2">{t.admin.championshipPoints}</th>
                    <th className="py-2">{t.admin.races}</th>
                  </tr>
                </thead>
                <tbody>
                  {publicChampionship.map((standing) => (
                    <tr key={standing.auth} className="border-t border-gray-800">
                      <td className="py-3 font-bold">{standing.position}</td>
                      <td className="py-3">{standing.name}</td>
                      <td className="py-3">{standing.championshipPoints}</td>
                      <td className="py-3">{standing.racesCount ?? 0}</td>
                    </tr>
                  ))}
                  {!loadingData && publicChampionship.length === 0 && (
                    <tr>
                      <td className="py-5 text-gray-400" colSpan={4}>{t.admin.noPublicChampionshipFound}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg bg-gray-900 p-5 shadow-xl">
            <h2 className="mb-5 text-2xl font-semibold">{t.admin.publicRankings}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-gray-300">
                  <tr>
                    <th className="py-2">#</th>
                    <th className="py-2">{t.admin.username}</th>
                    <th className="py-2">{t.admin.rankingXp}</th>
                    <th className="py-2">{t.admin.qualys}</th>
                  </tr>
                </thead>
                <tbody>
                  {publicRankings.map((standing) => (
                    <tr key={standing.auth} className="border-t border-gray-800">
                      <td className="py-3 font-bold">{standing.position}</td>
                      <td className="py-3">{standing.name}</td>
                      <td className="py-3">{standing.rankingXp}</td>
                      <td className="py-3">{standing.qualyCount ?? 0}</td>
                    </tr>
                  ))}
                  {!loadingData && publicRankings.length === 0 && (
                    <tr>
                      <td className="py-5 text-gray-400" colSpan={4}>{t.admin.noPublicRankingsFound}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

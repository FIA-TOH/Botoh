'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { ChatTarget, useChat } from '@/hooks/useChat';
import { useLogs } from '@/hooks/useLogs';
import { usePitCall } from '@/hooks/usePitCall';
import { usePlayerList } from '@/hooks/usePlayerList';


import { ChatPanel } from '../../components/pit-wall/ChatPanel';
import { LogsPanel } from '../../components/pit-wall/LogsPanel';
import { LiveMap } from '../../components/pit-wall/LiveMap';
import { PlayersPanel } from '../../components/pit-wall/PlayersPanel';
import { TeamInfoPanel } from '../../components/pit-wall/TeamInfoPanel';
import { RaceInsightsGrid } from '../../components/pit-wall/RaceInsightsGrid';
import { useTranslations } from '@/i18n';

export default function PitWallPage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { playerList, playerPositions } = usePlayerList();
  const {
    messages,
    sendMessage,
    isConnected: isChatConnected,
  } = useChat();
  const { logs } = useLogs();
  const { sendPitCall } = usePitCall();
  const eligibleMemberships = useMemo(
    () =>
      (user?.teamMemberships ?? []).filter(
        (membership) =>
          membership.roles.includes('team_principal')
          || membership.roles.includes('team_assistant'),
      ),
    [user?.teamMemberships],
  );
  const selectedTeamId = searchParams.get('teamId');
  const selectedMembership =
    eligibleMemberships.find((membership) => membership.teamId === selectedTeamId)
    ?? null;
  const loggedUserTeam = selectedMembership?.teamName ?? null;
  const drivers = useMemo(
    () =>
      (playerList?.players ?? []).map((player) => ({
        ...player,
        position: player.racePosition,
      })),
    [playerList?.players],
  );
  const standings = useMemo(
    () =>
      (playerList?.standings ?? []).map((player) => ({
        ...player,
        position: player.racePosition,
      })),
    [playerList?.standings],
  );
  const teamDrivers = useMemo(
    () =>
      loggedUserTeam
        ? drivers.filter((driver) => driver.leagueScuderia === loggedUserTeam)
        : [],
    [drivers, loggedUserTeam],
  );
  const recipientOptions = useMemo(
    () => [
      t.chat.everyone,
      ...(loggedUserTeam ? [t.chat.team] : []),
      ...teamDrivers.map((driver) => driver.name),
    ],
    [loggedUserTeam, teamDrivers],
  );

  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>(t.chat.everyone);

  useEffect(() => {
    if (!recipientOptions.includes(selectedRecipient)) {
      setSelectedRecipient(t.chat.everyone);
    }
  }, [recipientOptions, selectedRecipient]);

  if (!isAuthenticated) {
    return null;
  }

  if (!selectedMembership) {
    return (
      <main
        className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white"
        style={{ backgroundImage: 'url(/img/bg/pitwallwpp.png)' }}
      >
        <div className="absolute inset-0 bg-black/60" />

        <button
          type="button"
          aria-label={t.common.back}
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
              return;
            }

            router.push('/');
          }}
          className="absolute left-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF232B] text-white shadow-lg transition-transform hover:scale-105"
        >
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-xl text-center">
            <h1 className="mb-6 text-3xl font-bold uppercase">Escolha a scuderia</h1>

            <div className="grid gap-4">
              {eligibleMemberships.map((membership) => (
                <button
                  key={membership.teamId}
                  type="button"
                  onClick={() => router.push(`/pit-wall?teamId=${membership.teamId}`)}
                  className="rounded-lg border border-white/20 bg-black/70 px-6 py-5 text-xl font-semibold transition hover:border-[#FF232B] hover:bg-black/85"
                >
                  {membership.teamName}
                </button>
              ))}
            </div>

            {eligibleMemberships.length === 0 && (
              <p className="rounded-lg bg-black/70 px-6 py-5 text-lg">
                Nenhuma scuderia disponível para o pit wall.
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen p-8 text-white bg-cover  bg-center
  bg-no-repeat
  bg-fixed"
      style={{
        backgroundImage:
          'url(/img/bg/pitwallwpp.png)',
      }}
    >
      <button
        type="button"
        aria-label={t.common.back}
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
            return;
          }

          router.push('/');
        }}
        className="absolute left-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF232B] text-white shadow-lg transition-transform hover:scale-105"
      >
        <svg
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

    <div className="max-w-[1440px] mx-auto">
        <div className="pit-wall-main-grid grid gap-8">
          <PlayersPanel
            drivers={standings}
            raceSession={playerList?.raceSession}
            loading={!playerList}
          />

          <LogsPanel logs={logs} loading={false}/>

          <TeamInfoPanel
            drivers={drivers}
            loggedUserTeam={loggedUserTeam}
            onPitCall={(driver) => sendPitCall(driver.name)}
            loading={!playerList}
          />

          <ChatPanel
            messages={messages}
            message={message}
            setMessage={setMessage}
            handleSendMessage={(event) => {
              event.preventDefault();
              const target: ChatTarget =
                selectedRecipient === t.chat.everyone
                  ? { type: 'all' }
                  : selectedRecipient === t.chat.team && loggedUserTeam
                    ? { type: 'team', teamName: loggedUserTeam }
                    : { type: 'player', playerName: selectedRecipient };

              sendMessage(message, user?.username ?? 'Frontend', target);
              setMessage('');
            }}
            isConnected={isChatConnected}
            isMuted={playerList?.raceSession.isChatMuted ?? false}
            recipientOptions={recipientOptions}
            onSelectRecipient={setSelectedRecipient}
            loading={false}
          />

          <LiveMap
            players={playerPositions?.players || []}
            playerDetails={playerList?.players || []}
          />
        </div>

          <RaceInsightsGrid
          drivers={standings}
          loggedUserTeam={loggedUserTeam}
          raceSession={playerList?.raceSession}
          loading={!playerList}
          error={null}
        />
      </div>
    </main>
  );
}

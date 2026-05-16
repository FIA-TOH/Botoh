'use client';

import { useEffect, useMemo, useState } from 'react';

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

export default function PitWallPage() {
  const { isAuthenticated, user } = useAuth();

  const { playerList, playerPositions } = usePlayerList();
  const {
    messages,
    sendMessage,
    isConnected: isChatConnected,
  } = useChat();
  const { logs } = useLogs();
  const { sendPitCall } = usePitCall();
  const loggedUserTeam = user?.teamName ?? null;
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
      'Todos',
      ...(loggedUserTeam ? ['Equipe'] : []),
      ...teamDrivers.map((driver) => driver.name),
    ],
    [loggedUserTeam, teamDrivers],
  );

  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('Todos');

  useEffect(() => {
    if (!recipientOptions.includes(selectedRecipient)) {
      setSelectedRecipient('Todos');
    }
  }, [recipientOptions, selectedRecipient]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main
      className="min-h-screen p-8 text-white bg-cover  bg-center
  bg-no-repeat
  bg-fixed"
      style={{
        backgroundImage:
          'url(/img/bg/pitwallwpp.png)',
      }}
    >
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
                selectedRecipient === 'Todos'
                  ? { type: 'all' }
                  : selectedRecipient === 'Equipe' && loggedUserTeam
                    ? { type: 'team', teamName: loggedUserTeam }
                    : { type: 'player', playerName: selectedRecipient };

              sendMessage(message, user?.username ?? 'Frontend', target);
              setMessage('');
            }}
            isConnected={isChatConnected}
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

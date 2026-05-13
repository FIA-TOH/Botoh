'use client';

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { usePlayerList } from '@/hooks/usePlayerList';

import { mockRaceData } from '@/mocks/raceData';

import { ChatPanel } from '../../components/pit-wall/ChatPanel';
import { LogsPanel } from '../../components/pit-wall/LogsPanel';
import { LiveMap } from '../../components/pit-wall/LiveMap';
import { PlayersPanel } from '../../components/pit-wall/PlayersPanel';
import { TeamInfoPanel } from '../../components/pit-wall/TeamInfoPanel';
import { RaceInsightsGrid } from '../../components/pit-wall/RaceInsightsGrid';
import { mockLogs, mockMessages } from '@/mocks/pitwall';

export default function PitWallPage() {
  const { isAuthenticated } = useAuth();

  const { playerList } = usePlayerList();

  const [message, setMessage] = useState('');

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
        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: '200px 12fr 7fr',
            gridTemplateRows: '7fr 5fr',
            gridTemplateAreas: `
              "players map chat"
              "players team-info logs"
            `,
          }}
        >
          <PlayersPanel
            drivers={mockRaceData.drivers} loading={false}
          />

          <LogsPanel logs={mockLogs} loading={false}/>

          <TeamInfoPanel loading={false}/>

          <ChatPanel
            messages={mockMessages}
            message={message}
            setMessage={setMessage}
            handleSendMessage={() => {}}
            isConnected
            loading={false}
          />

          <LiveMap
            players={playerList?.players || []}
          />
        </div>

        <RaceInsightsGrid />
      </div>
    </main>
  );
}

'use client';

import { useMemo } from 'react';

import { PlayersPanel } from '@/components/pit-wall/PlayersPanel';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { usePlayerList } from '@/hooks/usePlayerList';

export default function PositionsWidgetPage() {
  const { playerList } = usePlayerList({
    subscribePositions: false,
    reconnectAttempts: Number.POSITIVE_INFINITY,
    reconnectDelay: 1000,
  });

  const standings = useMemo(
    () =>
      (playerList?.standings ?? []).map((player) => ({
        ...player,
        position: player.racePosition,
      })),
    [playerList?.standings],
  );

  return (
    <WidgetShell>
      <main className="h-screen w-screen overflow-hidden bg-transparent p-2">
        <PlayersPanel
          drivers={standings}
          raceSession={playerList?.raceSession}
          loading={!playerList}
          error={null}
          isWidget
          interactive={false}
        />
      </main>
    </WidgetShell>
  );
}

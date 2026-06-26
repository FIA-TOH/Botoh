'use client';

import { LiveMap } from '@/components/pit-wall/LiveMap';
import { WidgetShell } from '@/components/widgets/WidgetShell';
import { usePlayerList } from '@/hooks/usePlayerList';

const LIVE_MAP_WIDGET_FPS = 30;

export default function LiveMapWidgetPage() {
  const { playerList, playerPositions } = usePlayerList({
    positionUpdateFps: LIVE_MAP_WIDGET_FPS,
    reconnectAttempts: Number.POSITIVE_INFINITY,
    reconnectDelay: 1000,
  });

  return (
    <WidgetShell>
      <main className="h-screen w-screen overflow-hidden bg-transparent">
        <LiveMap
          players={playerPositions?.players ?? []}
          playerDetails={playerList?.players ?? []}
          isWidget
          interactive={false}
          maxFps={LIVE_MAP_WIDGET_FPS}
        />
      </main>
    </WidgetShell>
  );
}

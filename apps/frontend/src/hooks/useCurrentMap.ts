import { useState, useEffect } from 'react';
import { pitwallApiUrl } from '@/config/api';
import { useSocket } from './useSocket';

interface CurrentMapData {
  mapName: string | null;
  hasSvg: boolean;
  svgUrl: string | null;
  isLoading: boolean;
}

export type PitWallGameState = 'running' | 'paused' | null;

const svgCache = new Map<string, boolean>();
const PITWALL_REQUEST_HEADERS = {
  'ngrok-skip-browser-warning': 'true',
};

async function checkSvgExists(url: string): Promise<boolean> {
  if (svgCache.has(url)) {
    return svgCache.get(url)!;
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const exists = response.ok;
    svgCache.set(url, exists);
    return exists;
  } catch (error) {
    svgCache.set(url, false);
    return false;
  }
}

function normalizeMapName(mapName: string | null): string | null {
  return mapName ? mapName.replace(/\.(hbs|json)$/i, '').toLowerCase() : null;
}

export function useCurrentMap(): CurrentMapData {
  const { socket, isConnected } = useSocket();
  const [mapData, setMapData] = useState<CurrentMapData>({
    mapName: null,
    hasSvg: false,
    svgUrl: null,
    isLoading: true,
  });

  useEffect(() => {
    const applyMapName = async (mapName: string | null) => {
      const normalizedMap = normalizeMapName(mapName);

      if (!normalizedMap) {
        setMapData({
          mapName: null,
          hasSvg: false,
          svgUrl: null,
          isLoading: false,
        });
        return;
      }

      setMapData(prev => ({
        ...prev,
        mapName: normalizedMap,
        isLoading: true,
      }));

      const svgUrl = `/maps/${normalizedMap}.svg`;
      const hasSvg = await checkSvgExists(svgUrl);

      setMapData({
        mapName: normalizedMap,
        hasSvg,
        svgUrl: hasSvg ? svgUrl : null,
        isLoading: false,
      });

      localStorage.setItem('currentMap', normalizedMap);
    };

    const detectCurrentMap = async () => {
      let detectedMap: string | null = null;

      const roomInfo = (window as any).__ROOM_INFO__;
      if (roomInfo?.currentMap) {
        detectedMap = roomInfo.currentMap;
      }

      if (!detectedMap) {
        const urlParams = new URLSearchParams(window.location.search);
        detectedMap = urlParams.get('map') || null;
      }

      if (!detectedMap) {
        try {
          const response = await fetch(pitwallApiUrl('/api/room/current-map'), {
            headers: PITWALL_REQUEST_HEADERS,
          });

          if (response.ok) {
            const data = await response.json();
            detectedMap = data.mapName;
          }
        } catch (error) {
          console.warn('Erro ao buscar mapa atual da API:', error);
        }
      }

      if (!detectedMap) {
        detectedMap = localStorage.getItem('currentMap') || null;
      }

      await applyMapName(detectedMap);
    };

    detectCurrentMap();

    const handleMapChange = (event: { mapName?: string | null; currentMap?: string | null }) => {
      const mapName = event?.mapName ?? event?.currentMap;

      if (mapName) {
        applyMapName(mapName);
      }
    };

    if (socket && isConnected) {
      socket.on('room:mapChanged', handleMapChange);
      socket.on('room:heartbeat', handleMapChange);
    }

    return () => {
      if (socket) {
        socket.off('room:mapChanged', handleMapChange);
        socket.off('room:heartbeat', handleMapChange);
      }
    };
  }, [socket, isConnected]);

  return mapData;
}

export function usePitWallGameState(): PitWallGameState {
  const { socket, isConnected } = useSocket();
  const [gameState, setGameState] = useState<PitWallGameState>(null);

  useEffect(() => {
    const fetchRoomState = async () => {
      try {
        const response = await fetch(pitwallApiUrl('/api/room/state'), {
          headers: PITWALL_REQUEST_HEADERS,
        });

        if (!response.ok) return;

        const data = await response.json();
        const nextGameState = data?.roomState?.gameState;

        if (nextGameState === 'running' || nextGameState === 'paused' || nextGameState === null) {
          setGameState(nextGameState);
        }
      } catch (error) {
        console.warn('Erro ao buscar gameState atual:', error);
      }
    };

    fetchRoomState();

    const handleGameStateChange = (event: { gameState?: PitWallGameState }) => {
      if (event?.gameState === 'running' || event?.gameState === 'paused' || event?.gameState === null) {
        setGameState(event.gameState);
      }
    };

    if (socket && isConnected) {
      socket.on('room:gameStateChanged', handleGameStateChange);
      socket.on('room:heartbeat', handleGameStateChange);
    }

    return () => {
      if (socket) {
        socket.off('room:gameStateChanged', handleGameStateChange);
        socket.off('room:heartbeat', handleGameStateChange);
      }
    };
  }, [socket, isConnected]);

  return gameState;
}

export function useMapBackground(): {
  backgroundUrl: string | null;
  fallbackType: 'svg' | 'missing' | 'default';
} {
  const { mapName, hasSvg, svgUrl, isLoading } = useCurrentMap();

  if (isLoading) {
    return { backgroundUrl: null, fallbackType: 'default' };
  }

  if (hasSvg && svgUrl) {
    return { backgroundUrl: svgUrl, fallbackType: 'svg' };
  }

  if (mapName) {
    return { backgroundUrl: null, fallbackType: 'missing' };
  }

  return { backgroundUrl: null, fallbackType: 'default' };
}

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
const KNOWN_MAP_SVG_FILES = [
  'bahrainSeasonTres.svg',
  'imola.svg',
  'imolaSeasonTres.svg',
  'imolaTeste.svg',
  'miamiSeasonTres.svg',
  'suzuka.svg',
];
const mapSvgFileByNormalizedName = new Map(
  KNOWN_MAP_SVG_FILES.map((fileName) => [
    fileName.replace(/\.svg$/i, '').toLowerCase(),
    fileName,
  ]),
);

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
  return mapName ? mapName.replace(/\.(hbs|json)$/i, '') : null;
}

function getMapSvgUrl(mapName: string): string {
  const mappedFileName = mapSvgFileByNormalizedName.get(mapName.toLowerCase());
  return `/maps/${mappedFileName ?? `${mapName}.svg`}`;
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

      const svgUrl = getMapSvgUrl(normalizedMap);
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
    }

    return () => {
      if (socket) {
        socket.off('room:mapChanged', handleMapChange);
      }
    };
  }, [socket, isConnected]);

  return mapData;
}

export function usePitWallGameState(): PitWallGameState {
  const { socket, isConnected } = useSocket();
  const [gameState, setGameState] = useState<PitWallGameState>('running');

  useEffect(() => {
    let isCancelled = false;

    const applyGameState = (nextGameState: unknown) => {
      if (
        !isCancelled
        && (nextGameState === 'running' || nextGameState === 'paused' || nextGameState === null)
      ) {
        setGameState(nextGameState);
      }
    };

    const fetchCurrentGameState = async () => {
      try {
        const response = await fetch(pitwallApiUrl('/api/room/game-state'), {
          headers: PITWALL_REQUEST_HEADERS,
          cache: 'no-store',
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data?.isSynced === true) {
          applyGameState(data?.gameState);
        }
      } catch (error) {
        console.warn('Erro ao buscar estado atual da sala:', error);
      }
    };

    fetchCurrentGameState();

    const handleGameStateChange = (event: { gameState?: PitWallGameState }) => {
      applyGameState(event?.gameState);
    };

    if (socket && isConnected) {
      socket.on('room:gameStateChanged', handleGameStateChange);
      socket.on('room:heartbeat', handleGameStateChange);
    }

    return () => {
      isCancelled = true;

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

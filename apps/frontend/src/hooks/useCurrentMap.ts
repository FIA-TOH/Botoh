import { useState, useEffect } from 'react';

/**
 * Hook para detectar o mapa atual no Room
 * Retorna o nome do mapa e informações sobre disponibilidade de SVG
 */

interface CurrentMapData {
  mapName: string | null;
  hasSvg: boolean;
  svgUrl: string | null;
  isLoading: boolean;
}

// Cache para verificar disponibilidade de SVGs
const svgCache = new Map<string, boolean>();

export function useCurrentMap(): CurrentMapData {
  const [mapData, setMapData] = useState<CurrentMapData>({
    mapName: null,
    hasSvg: false,
    svgUrl: null,
    isLoading: true
  });

  useEffect(() => {
    // Função para detectar o mapa atual
    const detectCurrentMap = async () => {
      try {
        let detectedMap = null;
        
        // 1. Tentar obter do window se disponível (injeção do backend)
        const roomInfo = (window as any).__ROOM_INFO__;
        if (roomInfo?.currentMap) {
          detectedMap = roomInfo.currentMap;
        }
        
        // 2. Tentar obter da URL
        if (!detectedMap) {
          const urlParams = new URLSearchParams(window.location.search);
          detectedMap = urlParams.get('map') || null;
        }
        
        // 3. Tentar obter do localStorage (cache)
        if (!detectedMap) {
          detectedMap = localStorage.getItem('currentMap') || null;
        }
        
        // 4. Tentar obter de um endpoint de API
        if (!detectedMap) {
          try {
            console.log('🔍 Buscando mapa atual da API...');
            const response = await fetch('/api/room/current-map');
            console.log('📡 Resposta da API:', response.status, response.statusText);
            
            if (response.ok) {
              const data = await response.json();
              console.log('📦 Dados recebidos:', data);
              detectedMap = data.mapName;
              console.log('🗺️ Mapa detectado da API:', detectedMap);
            } else {
              console.log('❌ API retornou erro:', response.status);
            }
          } catch (error) {
            console.log('❌ Erro ao buscar da API:', error);
          }
        }
        
        // Normalizar nome do mapa (remover extensões, converter para lowercase)
        const normalizedMap = detectedMap 
          ? detectedMap.replace(/\.(hbs|json)$/i, '').toLowerCase()
          : null;
        
        // Verificar se existe SVG para este mapa
        let svgUrl = null;
        let hasSvg = false;
        
        if (normalizedMap) {
          svgUrl = `/maps/${normalizedMap}.svg`;
          hasSvg = await checkSvgExists(svgUrl);
        }
        
        setMapData({
          mapName: normalizedMap,
          hasSvg,
          svgUrl: hasSvg ? svgUrl : null,
          isLoading: false
        });
        
        // Salvar no cache/localStorage
        if (normalizedMap) {
          localStorage.setItem('currentMap', normalizedMap);
        }
        
      } catch (error) {
        console.warn('Erro ao detectar mapa atual:', error);
        setMapData({
          mapName: null,
          hasSvg: false,
          svgUrl: null,
          isLoading: false
        });
      }
    };

    // Função para verificar se SVG existe
    const checkSvgExists = async (url: string): Promise<boolean> => {
      // Verificar cache primeiro
      if (svgCache.has(url)) {
        return svgCache.get(url)!;
      }
      
      try {
        // Fazer uma requisição HEAD para verificar se o arquivo existe
        const response = await fetch(url, { method: 'HEAD' });
        const exists = response.ok;
        
        // Salvar no cache
        svgCache.set(url, exists);
        return exists;
      } catch (error) {
        // Se falhar, assumir que não existe
        svgCache.set(url, false);
        return false;
      }
    };

    // Detectar mapa imediatamente
    detectCurrentMap();

    // Configurar listener para mudanças de mapa
    const handleMapChange = (event: CustomEvent) => {
      if (event.detail?.mapName) {
        const newMap = event.detail.mapName.replace(/\.(hbs|json)$/i, '').toLowerCase();
        setMapData(prev => ({
          ...prev,
          mapName: newMap,
          isLoading: true
        }));
        
        // Verificar SVG para o novo mapa
        checkSvgExists(`/maps/${newMap}.svg`).then(hasSvg => {
          setMapData(prev => ({
            ...prev,
            hasSvg,
            svgUrl: hasSvg ? `/maps/${newMap}.svg` : null,
            isLoading: false
          }));
        });
      }
    };

    // Adicionar event listener para mudanças de mapa
    window.addEventListener('mapChanged', handleMapChange as EventListener);
    
    // Intervalo para verificar mudanças (fallback)
    const interval = setInterval(detectCurrentMap, 10000);

    return () => {
      window.removeEventListener('mapChanged', handleMapChange as EventListener);
      clearInterval(interval);
    };
  }, []);

  return mapData;
}

/**
 * Hook para gerenciar background do LiveMap
 * Retorna a URL do background ou null para usar o padrão
 */
export function useMapBackground(): { backgroundUrl: string | null; fallbackType: 'svg' | 'grid' | 'default' } {
  const { mapName, hasSvg, svgUrl, isLoading } = useCurrentMap();

  // Sistema de fallback:
  // 1. Se tem SVG do mapa atual -> usar SVG
  // 2. Se não tem mapa ou SVG -> usar grid
  // 3. Se tudo falhar -> usar padrão (nenhum background)

  if (isLoading) {
    return { backgroundUrl: null, fallbackType: 'default' };
  }

  if (hasSvg && svgUrl) {
    return { backgroundUrl: svgUrl, fallbackType: 'svg' };
  }

  if (mapName) {
    // Tem mapa mas não tem SVG -> usar grid
    return { backgroundUrl: null, fallbackType: 'grid' };
  }

  // Não tem mapa -> usar padrão
  return { backgroundUrl: null, fallbackType: 'default' };
}

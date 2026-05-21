import React from 'react';
import { PlayerData, PlayerPositionData } from '@/hooks/usePlayerList';
import { useMapBackground, usePitWallGameState } from '@/hooks/useCurrentMap';
import { colorNumberToHex, isDarkColor } from '@/app/utils/race';
import { Teams } from '@/types/game';
import { useTranslations } from '@/i18n';

interface Props {
  players: PlayerPositionData[];
  playerDetails: PlayerData[];
}

interface ViewBoxData {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

const DEFAULT_VIEW_BOX: ViewBoxData = {
  minX: -5000,
  minY: -5000,
  width: 10000,
  height: 10000,
};

function parseSvgViewBox(svgText: string): ViewBoxData | null {
  const viewBoxMatch = svgText.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch?.[1]
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);

  if (
    !viewBox
    || viewBox.length !== 4
    || viewBox.some((value) => !Number.isFinite(value))
    || viewBox[2] <= 0
    || viewBox[3] <= 0
  ) {
    return null;
  }

  return {
    minX: viewBox[0],
    minY: viewBox[1],
    width: viewBox[2],
    height: viewBox[3],
  };
}

export function LiveMap({
  players,
  playerDetails,
}: Props) {
  const { t } = useTranslations();
  const { backgroundUrl, fallbackType } = useMapBackground();
  const gameState = usePitWallGameState();

  const containerRef = React.useRef<HTMLDivElement>(null);

  const [mapDimensions, setMapDimensions] = React.useState({
    width: 0,
    height: 0,
    scale: 1,
  });
  const [svgViewBox, setSvgViewBox] = React.useState<ViewBoxData | null>(null);
  const [smoothedPositions, setSmoothedPositions] = React.useState<
    Record<number, { x: number; y: number }>
  >({});
  const targetsRef = React.useRef<Record<number, { x: number; y: number }>>({});
  const smoothedRef = React.useRef<Record<number, { x: number; y: number }>>({});
  const rafRef = React.useRef<number | null>(null);
  const lastFrameRef = React.useRef<number | null>(null);
  const playerDetailsById = React.useMemo(
    () =>
      new Map(
        playerDetails.map((player) => [player.id, player]),
      ),
    [playerDetails],
  );
  const runningPlayers = React.useMemo(
    () => players.filter((player) => player.team === Teams.RUNNERS),
    [players],
  );

  // =========================================
  // SVG VIEWBOX
  // =========================================

  const getViewBoxData = React.useCallback((): ViewBoxData => {
    if (fallbackType === 'svg' && svgViewBox) {
      return svgViewBox;
    }

    return DEFAULT_VIEW_BOX;
  }, [fallbackType, svgViewBox]);

  React.useEffect(() => {
    let isCancelled = false;

    const loadSvgViewBox = async () => {
      setSvgViewBox(null);

      if (fallbackType !== 'svg' || !backgroundUrl) return;

      try {
        const response = await fetch(backgroundUrl);
        if (!response.ok) return;

        const svgText = await response.text();
        const viewBox = parseSvgViewBox(svgText);

        if (!isCancelled) {
          setSvgViewBox(viewBox);
        }
      } catch (error) {
        if (!isCancelled) {
          setSvgViewBox(null);
        }
      }
    };

    loadSvgViewBox();

    return () => {
      isCancelled = true;
    };
  }, [backgroundUrl, fallbackType]);

  // =========================================
  // RESPONSIVE MAP SIZE
  // =========================================

  React.useEffect(() => {

    const updateMapDimensions = () => {

      if (!containerRef.current) return;

      const container = containerRef.current;

      // área máxima disponível
      const maxWidth = container.clientWidth;
      const maxHeight = container.clientHeight;

      const viewBox = getViewBoxData();

      const aspectRatio =
        viewBox.width / viewBox.height;

      let width = maxWidth;
      let height = width / aspectRatio;

      // se ultrapassar altura máxima
      // recalcula baseado na altura
      if (height > maxHeight) {

        height = maxHeight;
        width = height * aspectRatio;
      }

      const scale = width / viewBox.width;

      setMapDimensions({
        width,
        height,
        scale,
      });
    };

    updateMapDimensions();

    window.addEventListener(
      'resize',
      updateMapDimensions,
    );

    return () => {

      window.removeEventListener(
        'resize',
        updateMapDimensions,
      );
    };

  }, [getViewBoxData]);

  // =========================================
  // HAXBALL -> SVG
  // =========================================

  const convertHaxballToSvg = React.useCallback((
    x: number,
    y: number,
  ) => {

    const viewBox = getViewBoxData();

    const svgX =
      ((x - viewBox.minX) / viewBox.width) * 100;

    const svgY =
      ((y - viewBox.minY) / viewBox.height) * 100;

    return {
      x: svgX,
      y: svgY,
    };
  }, [getViewBoxData]);

  React.useEffect(() => {
    const activeIds = new Set<number>();

    runningPlayers.forEach((player) => {
      activeIds.add(player.id);
      const target = convertHaxballToSvg(player.position.x, player.position.y);
      targetsRef.current[player.id] = target;

      if (!smoothedRef.current[player.id]) {
        smoothedRef.current[player.id] = target;
      }
    });

    Object.keys(smoothedRef.current).forEach((idStr) => {
      const id = Number(idStr);
      if (!activeIds.has(id)) {
        delete smoothedRef.current[id];
        delete targetsRef.current[id];
      }
    });
  }, [runningPlayers, convertHaxballToSvg]);

  React.useEffect(() => {
    const SNAP_DISTANCE_PERCENT = 10;
    const TAU_MS = 140;

    const animate = (now: number) => {
      const last = lastFrameRef.current ?? now;
      const dt = Math.max(0, now - last);
      lastFrameRef.current = now;

      const alpha = 1 - Math.exp(-dt / TAU_MS);
      let changed = false;
      const next: Record<number, { x: number; y: number }> = { ...smoothedRef.current };

      Object.keys(targetsRef.current).forEach((idStr) => {
        const id = Number(idStr);
        const target = targetsRef.current[id];
        const current = next[id];

        if (!target || !current) return;

        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const distance = Math.hypot(dx, dy);

        if (distance > SNAP_DISTANCE_PERCENT) {
          next[id] = { x: target.x, y: target.y };
          changed = true;
          return;
        }

        const nx = current.x + dx * alpha;
        const ny = current.y + dy * alpha;

        if (Math.abs(nx - current.x) > 0.01 || Math.abs(ny - current.y) > 0.01) {
          next[id] = { x: nx, y: ny };
          changed = true;
        }
      });

      if (changed) {
        smoothedRef.current = next;
        setSmoothedPositions(next);
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;
      lastFrameRef.current = null;
    };
  }, []);

  // =========================================
  // RENDER
  // =========================================

  return (

    <div
      style={{
        gridArea: 'map',
        backgroundColor: '#555555',
        outline: '8px solid #FF232B',
        position: 'relative',
      }}
      className=""
    >
      {gameState !== 'running' && (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            text-lg
            font-semibold
            text-white
            pointer-events-none
          "
          style={{
            backgroundColor:
              gameState === 'paused'
                ? 'rgba(0, 0, 0, 0.6)'
                : 'rgba(17, 24, 39, 0.78)',
            zIndex: 30,
          }}
        >
          {gameState === 'paused'
            ? t.liveMap.paused
            : t.liveMap.idle}
        </div>
      )}

      <div
        ref={containerRef}
        className="
          relative
          rounded-lg
          mx-auto
          flex
          items-center
          justify-center
        "
        style={{
          width: '100%',
          height: '400px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: backgroundUrl
            ? 'transparent'
            : '#374151',
        }}
      >
        {/* MAP */}

        <div
          style={{
            width: `${mapDimensions.width}px`,
            height: `${mapDimensions.height}px`,
            position: 'relative',

            backgroundImage: backgroundUrl
              ? `url(${backgroundUrl})`
              : undefined,

            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',

            flexShrink: 0,
          }}
        >

          {/* GRID */}

          {fallbackType === 'missing' && (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                text-sm
                font-semibold
                text-white
              "
              style={{
                backgroundColor: '#1f2937',
              }}
            >
              {t.liveMap.missingMap}
            </div>
          )}

          {/* CENTER VERTICAL */}

          {fallbackType !== 'svg' && (
            <div
              className="
                absolute
                bg-red-500
                opacity-50
                pointer-events-none
              "
              style={{
                left: '50%',
                top: 0,
                width: '1px',
                height: '100%',
              }}
            />
          )}

          {/* CENTER HORIZONTAL */}

          {fallbackType !== 'svg' && (
            <div
              className="
                absolute
                bg-red-500
                opacity-50
                pointer-events-none
              "
              style={{
                left: 0,
                top: '50%',
                width: '100%',
                height: '1px',
              }}
            />
          )}

          {/* COORD LABELS */}

          {fallbackType !== 'svg' && (
            <>

              <div
                className="
                  absolute
                  text-xs
                  text-gray-400
                  pointer-events-none
                "
                style={{
                  left: '5px',
                  top: '5px',
                }}
              >
                (5000, 5000)
              </div>

              <div
                className="
                  absolute
                  text-xs
                  text-gray-400
                  pointer-events-none
                "
                style={{
                  right: '5px',
                  top: '5px',
                }}
              >
                (-5000, 5000)
              </div>

              <div
                className="
                  absolute
                  text-xs
                  text-gray-400
                  pointer-events-none
                "
                style={{
                  left: '5px',
                  bottom: '5px',
                }}
              >
                (5000, -5000)
              </div>

              <div
                className="
                  absolute
                  text-xs
                  text-gray-400
                  pointer-events-none
                "
                style={{
                  right: '5px',
                  bottom: '5px',
                }}
              >
                (-5000, -5000)
              </div>

            </>
          )}

          {/* PLAYERS */}

          {runningPlayers.map((player) => {
            const playerDetail = playerDetailsById.get(player.id);
            const carColor = colorNumberToHex(playerDetail?.scuderiaColor);
            const isSecondDriverOfScuderia =
              playerDetail?.isFirstDriver === false;
            const borderColor = isDarkColor(carColor)
              ? '#FFFFFF'
              : '#000000';

            const smoothPosition = smoothedPositions[player.id]
              || targetsRef.current[player.id]
              || convertHaxballToSvg(player.position.x, player.position.y);

            const mapX = smoothPosition.x;
            const mapY = smoothPosition.y;

            return (

              <div
                key={player.id}
                className={`
                  absolute
                  w-2
                  h-2
                  ${isSecondDriverOfScuderia ? '' : 'rounded-full'}
                `}
                style={{
                  left: `${mapX}%`,
                  top: `${mapY}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: carColor,
                  border: `1px solid ${borderColor}`,

                  boxShadow: player.admin
                    ? '0 0 5px rgba(147, 51, 234, 0.8)'
                    : 'none',
                }}
                title={`
                  ${player.name}
                  (
                    ${Math.round(player.position.x)},
                    ${Math.round(player.position.y)}
                  )
                `}
              />

            );
          })}

        </div>

      </div>

    </div>
  );
}

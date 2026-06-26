import React from 'react';
import { PlayerData, PlayerPositionData } from '@/hooks/usePlayerList';
import { useMapBackground, usePitWallGameState } from '@/hooks/useCurrentMap';
import { colorNumberToHex, isDarkColor } from '@/app/utils/race';
import { Teams } from '@/types/game';
import { useTranslations } from '@/i18n';

interface Props {
  players: PlayerPositionData[];
  playerDetails: PlayerData[];
  isWidget?: boolean;
  interactive?: boolean;
  maxFps?: number;
  showGameStateOverlay?: boolean;
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
  isWidget = false,
  interactive = true,
  maxFps,
  showGameStateOverlay = true,
}: Props) {
  const { t } = useTranslations();
  const {
    backgroundUrl,
    fallbackType,
    isRefreshing,
    refreshCurrentMap,
  } = useMapBackground();
  const gameState = usePitWallGameState(showGameStateOverlay && !isWidget);

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
  const [hoveredPlayerId, setHoveredPlayerId] = React.useState<number | null>(null);
  const [mapZoom, setMapZoom] = React.useState(1);
  const [mapPan, setMapPan] = React.useState({ x: 0, y: 0 });
  const targetsRef = React.useRef<Record<number, { x: number; y: number }>>({});
  const smoothedRef = React.useRef<Record<number, { x: number; y: number }>>({});
  const rafRef = React.useRef<number | null>(null);
  const lastFrameRef = React.useRef<number | null>(null);
  const pinchRef = React.useRef<{
    distance: number;
    zoom: number;
    center: { x: number; y: number };
    pan: { x: number; y: number };
  } | null>(null);
  const dragRef = React.useRef<{
    pointerId?: number;
    start: { x: number; y: number };
    pan: { x: number; y: number };
  } | null>(null);
  const panRef = React.useRef({ x: 0, y: 0 });
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
  const hoveredPlayer = React.useMemo(
    () => runningPlayers.find((player) => player.id === hoveredPlayerId) ?? null,
    [hoveredPlayerId, runningPlayers],
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
    const minFrameMs = maxFps && maxFps > 0
      ? 1000 / maxFps
      : 0;

    const animate = (now: number) => {
      if (
        minFrameMs > 0
        && lastFrameRef.current !== null
        && now - lastFrameRef.current < minFrameMs
      ) {
        rafRef.current = window.requestAnimationFrame(animate);
        return;
      }

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
  }, [maxFps]);

  React.useEffect(() => {
    panRef.current = mapPan;
  }, [mapPan]);

  const clampPan = React.useCallback((
    pan: { x: number; y: number },
    zoom = mapZoom,
  ) => {
    const container = containerRef.current;

    if (!container || zoom <= 1) return { x: 0, y: 0 };

    const maxX = Math.max(0, (mapDimensions.width * zoom - container.clientWidth) / 2);
    const maxY = Math.max(0, (mapDimensions.height * zoom - container.clientHeight) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, pan.x)),
      y: Math.max(-maxY, Math.min(maxY, pan.y)),
    };
  }, [mapDimensions.height, mapDimensions.width, mapZoom]);

  React.useEffect(() => {
    setMapPan((current) => clampPan(current, mapZoom));
  }, [clampPan, mapDimensions.height, mapDimensions.width, mapZoom]);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;

    const first = touches[0];
    const second = touches[1];

    return Math.hypot(
      second.clientX - first.clientX,
      second.clientY - first.clientY,
    );
  };

  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length < 2) {
      const touch = touches[0];
      return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
    }

    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 1 && mapZoom > 1) {
      const touch = event.touches[0];
      dragRef.current = {
        start: { x: touch.clientX, y: touch.clientY },
        pan: panRef.current,
      };
      return;
    }

    if (event.touches.length !== 2) return;

    event.preventDefault();

    pinchRef.current = {
      distance: getTouchDistance(event.touches),
      zoom: mapZoom,
      center: getTouchCenter(event.touches),
      pan: panRef.current,
    };
    dragRef.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 1 && dragRef.current && mapZoom > 1) {
      event.preventDefault();

      const touch = event.touches[0];
      setMapPan(clampPan({
        x: dragRef.current.pan.x + touch.clientX - dragRef.current.start.x,
        y: dragRef.current.pan.y + touch.clientY - dragRef.current.start.y,
      }));
      return;
    }

    if (event.touches.length !== 2 || !pinchRef.current) return;

    event.preventDefault();

    const nextDistance = getTouchDistance(event.touches);
    if (nextDistance <= 0 || pinchRef.current.distance <= 0) return;

    const nextZoom = pinchRef.current.zoom * (nextDistance / pinchRef.current.distance);
    const clampedZoom = Math.min(3, Math.max(1, nextZoom));
    const nextCenter = getTouchCenter(event.touches);

    setMapZoom(clampedZoom);
    setMapPan(clampPan({
      x: pinchRef.current.pan.x + nextCenter.x - pinchRef.current.center.x,
      y: pinchRef.current.pan.y + nextCenter.y - pinchRef.current.center.y,
    }, clampedZoom));
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2) {
      pinchRef.current = null;
    }

    if (event.touches.length === 0) {
      dragRef.current = null;
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || mapZoom <= 1) return;

    dragRef.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      pan: panRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || !dragRef.current || mapZoom <= 1) return;

    setMapPan(clampPan({
      x: dragRef.current.pan.x + event.clientX - dragRef.current.start.x,
      y: dragRef.current.pan.y + event.clientY - dragRef.current.start.y,
    }));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const getPlayerMapPosition = React.useCallback((player: PlayerPositionData) => (
    smoothedPositions[player.id]
    || targetsRef.current[player.id]
    || convertHaxballToSvg(player.position.x, player.position.y)
  ), [convertHaxballToSvg, smoothedPositions]);

  const hoveredTooltipPosition = React.useMemo(() => {
    if (!hoveredPlayer || !containerRef.current || mapDimensions.width <= 0 || mapDimensions.height <= 0) {
      return null;
    }

    const container = containerRef.current;
    const mapPosition = getPlayerMapPosition(hoveredPlayer);
    const mapLeft = (container.clientWidth - mapDimensions.width) / 2;
    const mapTop = (container.clientHeight - mapDimensions.height) / 2;
    const pointX = (mapPosition.x / 100) * mapDimensions.width;
    const pointY = (mapPosition.y / 100) * mapDimensions.height;

    return {
      left: mapLeft + mapPan.x + ((pointX - mapDimensions.width / 2) * mapZoom) + mapDimensions.width / 2,
      top: mapTop + mapPan.y + ((pointY - mapDimensions.height / 2) * mapZoom) + mapDimensions.height / 2,
    };
  }, [getPlayerMapPosition, hoveredPlayer, mapDimensions.height, mapDimensions.width, mapPan.x, mapPan.y, mapZoom]);

  // =========================================
  // RENDER
  // =========================================

  return (

    <div
      style={{
        gridArea: 'map',
        backgroundColor: '#555555',
        outline: isWidget ? 'none' : '8px solid #FF232B',
        position: 'relative',
      }}
      className={`pit-wall-live-map ${isWidget ? 'h-full w-full' : ''}`}
    >
      {showGameStateOverlay && !isWidget && gameState !== 'running' && (
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
        onTouchStart={interactive && !isWidget ? handleTouchStart : undefined}
        onTouchMove={interactive && !isWidget ? handleTouchMove : undefined}
        onTouchEnd={interactive && !isWidget ? handleTouchEnd : undefined}
        onTouchCancel={interactive && !isWidget ? handleTouchEnd : undefined}
        onPointerDown={interactive && !isWidget ? handlePointerDown : undefined}
        onPointerMove={interactive && !isWidget ? handlePointerMove : undefined}
        onPointerUp={interactive && !isWidget ? handlePointerUp : undefined}
        onPointerCancel={interactive && !isWidget ? handlePointerUp : undefined}
        className="
          pit-wall-live-map-inner
          relative
          mx-auto
          flex
          items-center
          justify-center
        "
        style={{
          width: '100%',
          height: isWidget ? '100%' : undefined,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: isWidget ? 0 : '0.5rem',
          cursor: interactive && !isWidget && mapZoom > 1 ? 'grab' : 'default',
          touchAction: interactive && !isWidget ? 'none' : 'auto',
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
            transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
            transformOrigin: 'center center',

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
                flex-col
                items-center
                justify-center
                gap-3
                text-sm
                font-semibold
                text-white
              "
              style={{
                backgroundColor: '#1f2937',
              }}
            >
              <span>{t.liveMap.missingMap}</span>
              {!isWidget && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  refreshCurrentMap();
                }}
                disabled={isRefreshing}
                className="
                  rounded
                  border
                  border-white/30
                  bg-white/10
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-white/20
                  disabled:cursor-wait
                  disabled:opacity-60
                "
              >
                {isRefreshing
                  ? t.liveMap.retryingMap
                  : t.liveMap.retryMap}
              </button>
              )}
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

            const smoothPosition = getPlayerMapPosition(player);

            const mapX = smoothPosition.x;
            const mapY = smoothPosition.y;

            return (

              <div
                key={player.id}
                className={`
                  absolute
                  h-6
                  w-6
                  ${interactive && !isWidget ? 'cursor-help' : ''}
                `}
                style={{
                  left: `${mapX}%`,
                  top: `${mapY}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: interactive && !isWidget ? 'auto' : 'none',
                }}
                onMouseEnter={interactive && !isWidget ? () => setHoveredPlayerId(player.id) : undefined}
                onMouseLeave={interactive && !isWidget ? () => setHoveredPlayerId((current) => (current === player.id ? null : current)) : undefined}
                onFocus={interactive && !isWidget ? () => setHoveredPlayerId(player.id) : undefined}
                onBlur={interactive && !isWidget ? () => setHoveredPlayerId((current) => (current === player.id ? null : current)) : undefined}
                onPointerDown={interactive && !isWidget ? (event) => event.stopPropagation() : undefined}
                tabIndex={interactive && !isWidget ? 0 : undefined}
                aria-label={interactive && !isWidget ? player.name : undefined}
              >
                <span
                  className={`
                    absolute
                    left-1/2
                    top-1/2
                    h-2
                    w-2
                    -translate-x-1/2
                    -translate-y-1/2
                    ${isSecondDriverOfScuderia ? '' : 'rounded-full'}
                  `}
                  style={{
                    backgroundColor: carColor,
                    border: `1px solid ${borderColor}`,
                    boxShadow: player.admin
                      ? '0 0 5px rgba(147, 51, 234, 0.8)'
                      : 'none',
                  }}
                />
              </div>

            );
          })}

        </div>

      </div>

      {interactive && !isWidget && hoveredPlayer && hoveredTooltipPosition && (
        <div
          className="
            pointer-events-none
            absolute
            z-40
            max-w-48
            -translate-x-1/2
            -translate-y-[calc(100%+10px)]
            rounded
            border
            border-white/20
            bg-black/85
            px-2.5
            py-1.5
            text-center
            text-xs
            font-bold
            text-white
            shadow-xl
          "
          style={{
            left: hoveredTooltipPosition.left,
            top: hoveredTooltipPosition.top,
          }}
        >
          <span className="block truncate">{hoveredPlayer.name}</span>
        </div>
      )}

    </div>
  );
}

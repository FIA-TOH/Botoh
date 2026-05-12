import React from 'react';
import { PlayerData } from '@/hooks/usePlayerList';
import { useMapBackground } from '@/hooks/useCurrentMap';

interface Props {
  players: PlayerData[];
}

export function LiveMap({
  players,
}: Props) {

  const { backgroundUrl, fallbackType } = useMapBackground();

  const containerRef = React.useRef<HTMLDivElement>(null);

  const [mapDimensions, setMapDimensions] = React.useState({
    width: 0,
    height: 0,
    scale: 1,
  });

  // =========================================
  // SVG METADATA
  // =========================================

  const getViewBoxData = () => {

    if (fallbackType === 'svg' && backgroundUrl) {

      const svgMetadata: Record<
        string,
        {
          minX: number;
          minY: number;
          width: number;
          height: number;
        }
      > = {

        imola: {
          minX: -3603.6,
          minY: -2328.3,
          width: 7531.2,
          height: 4623.6,
        },

      };

      const mapName = backgroundUrl
        .replace('/maps/', '')
        .replace('.svg', '');

      return (
        svgMetadata[mapName] || {
          minX: -5000,
          minY: -5000,
          width: 10000,
          height: 10000,
        }
      );
    }

    return {
      minX: -5000,
      minY: -5000,
      width: 10000,
      height: 10000,
    };
  };

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

  }, [backgroundUrl, fallbackType]);

  // =========================================
  // HAXBALL -> SVG
  // =========================================

  const convertHaxballToSvg = (
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
  };

  // =========================================
  // RENDER
  // =========================================

  return (

    <div
      style={{
        gridArea: 'map',
        backgroundColor: '#555555',
        outline: '8px solid #FF232B',
      }}
      className="p-4"
    >

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

          {fallbackType === 'grid' && (
            <div
              className="
                absolute
                inset-0
                pointer-events-none
              "
              style={{
                backgroundImage:
                  `
                  linear-gradient(
                    to right,
                    rgba(255,255,255,0.1) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    to bottom,
                    rgba(255,255,255,0.1) 1px,
                    transparent 1px
                  )
                  `,
                backgroundSize: '20px 20px',
              }}
            />
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

          {players.map((player) => {

            const {
              x: mapX,
              y: mapY,
            } = convertHaxballToSvg(
              player.position.x,
              player.position.y,
            );

            return (

              <div
                key={player.id}
                className={`
                  absolute
                  w-2
                  h-2
                  rounded-full
                  ${
                    player.team === 0
                      ? 'bg-red-500'
                      : player.team === 1
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
                  }
                `}
                style={{
                  left: `${mapX}%`,
                  top: `${mapY}%`,
                  transform:
                    'translate(-50%, -50%)',

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
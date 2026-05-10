import { PlayerData } from '@/hooks/usePlayerList';

interface Props {
  players: PlayerData[];
}

export function LiveMap({
  players,
}: Props) {
  return (
    <div
      style={{
        gridArea: 'map',
        backgroundColor: '#1E1E1E',
        outline: '8px solid #FF232B',
      }}
      className="p-4"
    >
      <h2 className="text-xl font-semibold mb-4">
        Mapa Ao Vivo
      </h2>

      <div
        className="
          relative
          bg-gray-700
          rounded-lg
          mx-auto
        "
        style={{
          width: '100%',
          height: '300px',
          position: 'relative',
        }}
      >

        {/* GRID */}
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

        {/* CENTER VERTICAL */}
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

        {/* CENTER HORIZONTAL */}
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

        {/* COORD LABELS */}
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

        {/* PLAYERS */}
        {players.map((player) => {

          const mapX =
            50 + (player.position.x * 0.01);

          const mapY =
            50 + (player.position.y * 0.01);

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
  );
}
import { mockRaceData } from '@/mocks/raceData';

import { DriverHud } from './DriverHud';

interface Props {
  loading?: boolean;

  error?: string | null;
}

export function TeamInfoPanel({
  loading = false,
  error = null,
}: Props) {

  const teamDrivers = mockRaceData.drivers
    .filter(
      (driver) =>
        driver.leagueScuderia === mockRaceData.loggedUserTeam
    )
    .slice(0, 2);

  const driver1 = teamDrivers[0];
  const driver2 = teamDrivers[1];

  return (
    <div
      style={{
        gridArea: 'team-info',
        backgroundColor: '#1E1E1E',
        outline: '8px solid #FF232B',
      }}
      className="p-4"
    >

      {/* LOADING */}
      {loading && (
        <div
          className="
            min-h-[320px]
            flex
            flex-col
            items-center
            justify-center
            gap-4
          "
        >
          <div
            className="
              w-12
              h-12
              border-4
              border-white/20
              border-t-red-500
              rounded-full
              animate-spin
            "
          />

          <span
            className="
              text-gray-300
              text-xl
              font-bold
            "
          >
            Carregando pilotos...
          </span>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div
          className="
            min-h-[320px]
            flex
            flex-col
            items-center
            justify-center
            text-center
            px-6
          "
        >
          <div className="text-6xl mb-4">
            ⚠️
          </div>

          <div
            className="
              text-red-500
              text-2xl
              font-bold
              mb-2
            "
          >
            Erro ao carregar HUD
          </div>

          <div className="text-gray-400">
            {error}
          </div>
        </div>
      )}

      {!loading &&
        !error && (
          <div className="flex justify-between">
            <DriverHud
              driver={driver1}
              align="left"
            />

            <DriverHud
              driver={driver2}
              align="right"
            />
          </div>
        )}
    </div>
  );
}

import { Driver } from '@/mocks/raceData';

import { DriverHud } from './DriverHud';
import { useTranslations } from '@/i18n';

interface Props {
  drivers?: Driver[];
  loggedUserTeam?: string | null;
  onPitCall?: (driver: Driver) => void;
  loading?: boolean;

  error?: string | null;
}

export function TeamInfoPanel({
  drivers = [],
  loggedUserTeam = null,
  onPitCall,
  loading = false,
  error = null,
}: Props) {
  const { t } = useTranslations();

  const teamDrivers = drivers
    .filter(
      (driver) =>
        loggedUserTeam !== null
        && driver.leagueScuderia === loggedUserTeam
    )
    .slice(0, 2);

  const driver1 = teamDrivers.find((driver) => driver.isFirstDriver);
  const driver2 = teamDrivers.find((driver) => !driver.isFirstDriver);

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
            {t.team.loading}
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
            {t.team.loadError}
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
              onPitCall={onPitCall}
            />

            <DriverHud
              driver={driver2}
              align="right"
              onPitCall={onPitCall}
            />
          </div>
        )}
    </div>
  );
}


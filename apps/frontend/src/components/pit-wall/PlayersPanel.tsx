'use client';

import { useEffect, useRef, useState } from 'react';

import { PlayerRow } from './PlayerRow';
import { HoverTooltip } from './HoverTooltip';

import {
  formatGap,
  lapTimeToMs,
} from '../../app/utils/race';

import { Driver, RaceSession } from '@/mocks/raceData';
import { Teams } from '@/types/game';
import { useTranslations } from '@/i18n';

interface Props {
  drivers?: Driver[];
  raceSession?: RaceSession | null;

  loading?: boolean;

  error?: string | null;
}

const FLAG_HEADER_CONFIG = {
  GREEN: {
    title: 'GREEN',
    subtitle: 'FLAG',
    color: '#2DBE20',
    backgroundColor: '#1E1E1E',
  },
  YELLOW: {
    title: 'YELLOW',
    subtitle: 'FLAG',
    color: '#FFC919',
    backgroundColor: '#1E1E1E',
  },
  RED: {
    title: 'RED',
    subtitle: 'FLAG',
    color: '#FF0000',
    backgroundColor: '#1E1E1E',
  },
  BLUE: {
    title: 'BLUE',
    subtitle: 'FLAG',
    color: '#3B82F6',
    backgroundColor: '#1E1E1E',
  },
  BLACK: {
    title: 'BLACK',
    subtitle: 'FLAG',
    color: '#FFFFFF',
    backgroundColor: '#000000',
  },
  SAFETY: {
    title: 'SAFETY CAR',
    subtitle: '',
    color: '#000000',
    backgroundColor: '#FFC919',
  },
  VIRTUAL_SAFETY: {
    title: 'VSC',
    subtitle: '',
    color: '#000000',
    backgroundColor: '#FFC919',
  },
};

const GREEN_FLAG_VISIBLE_DURATION_MS = 5000;

function formatSessionTime(seconds: number): string {
  const safeSeconds = Math.max(
    0,
    Math.floor(seconds)
  );
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    const remainingMinutes = Math.floor((safeSeconds % 3600) / 60);

    return `${hours}:${remainingMinutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

export function PlayersPanel({
  drivers = [],
  raceSession = null,
  loading = false,
  error = null,
}: Props) {
  const { t } = useTranslations();
  const [hoveredDriver, setHoveredDriver] =
    useState<string | null>(null);

  const [
    hoveredDriverPosition,
    setHoveredDriverPosition,
  ] = useState<number | null>(null);
  const [visibleFlag, setVisibleFlag] = useState<RaceSession['flag'] | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const previousFlag = useRef<RaceSession['flag'] | null>(null);

  useEffect(() => {
    const nextFlag = raceSession?.flag ?? null;
    const previousRaceFlag = previousFlag.current;

    if (!nextFlag) {
      setVisibleFlag(null);
      previousFlag.current = nextFlag;
      return;
    }

    if (nextFlag === 'GREEN') {
      if (previousRaceFlag && previousRaceFlag !== 'GREEN') {
        setVisibleFlag('GREEN');

        const timeout = setTimeout(() => {
          setVisibleFlag(null);
        }, GREEN_FLAG_VISIBLE_DURATION_MS);

        previousFlag.current = nextFlag;
        return () => clearTimeout(timeout);
      }

      if (!previousRaceFlag) {
        setVisibleFlag(null);
      }

      previousFlag.current = nextFlag;
      return;
    }

    setVisibleFlag(nextFlag);
    previousFlag.current = nextFlag;
  }, [raceSession?.flag]);

  useEffect(() => {
    const openOnDesktop = () => {
      if (!window.matchMedia('(max-width: 1023px)').matches) {
        setIsCollapsed(false);
      }
    };

    openOnDesktop();
    window.addEventListener('resize', openOnDesktop);

    return () => window.removeEventListener('resize', openOnDesktop);
  }, []);

  const toggleMobilePanel = () => {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    setIsCollapsed((current) => !current);
  };

  const isQualifyingSession =
    raceSession?.sessionType === 'qualy'
    || raceSession?.sessionType === 'hard_qualy';
  const isTimingStandingsSession =
    isQualifyingSession
    || raceSession?.sessionType === 'training';
  const shouldShowSectorBars =
    isTimingStandingsSession
    || raceSession?.sessionType === 'training';

  const sortedDrivers = [...drivers].sort((a, b) => {
    if (isTimingStandingsSession) {
      const aTime = a.bestTime ? lapTimeToMs(a.bestTime) : Number.POSITIVE_INFINITY;
      const bTime = b.bestTime ? lapTimeToMs(b.bestTime) : Number.POSITIVE_INFINITY;

      if (aTime !== bTime) {
        return aTime - bTime;
      }
    } else {
      const aPosition = a.position;
      const bPosition = b.position;
      const aHasPosition = typeof aPosition === 'number';
      const bHasPosition = typeof bPosition === 'number';

      if (aHasPosition && bHasPosition) {
        return aPosition - bPosition;
      }

      if (aHasPosition) return -1;
      if (bHasPosition) return 1;
    }

    return String(a.name ?? a.shortName ?? '')
      .localeCompare(
        String(b.name ?? b.shortName ?? ''),
        undefined,
        { sensitivity: 'base' }
      );
  });

  const displayedDrivers = isTimingStandingsSession
    ? sortedDrivers.map((driver, index) => ({
        ...driver,
        position: driver.bestTime ? index + 1 : null,
      }))
    : sortedDrivers;

  const timingLeader = isTimingStandingsSession
    ? displayedDrivers.find((driver) => !!driver.bestTime)
    : undefined;

  const getGapText = (driver: Driver) => {

    if (raceSession?.sessionType === 'race' && driver.isFinished) {
      return '🏁';
    }

    if (raceSession?.sessionType === 'race' && driver.isOut) {
      return 'OUT';
    }

    if (
      raceSession?.sessionType === 'race'
    ) {
      if (driver.inPitLane) {
        return 'PIT';
      }

      return driver.position === 1
        ? t.players.gap
        : driver.gapToNext;
    }

    if (
      isTimingStandingsSession
    ) {
      const driverLapTime =
        driver.bestTime

      if (timingLeader?.name === driver.name) {
        return driverLapTime ?? t.players.noTime;
      }

      if (!driverLapTime) {
        return t.players.noTime;
      }

      const leaderLapTime =
        timingLeader?.bestTime

      if (
        leaderLapTime
        && driverLapTime
      ) {

        const leaderMs = lapTimeToMs(
          leaderLapTime
        );

        const driverMs = lapTimeToMs(
          driverLapTime
        );

        return formatGap(Math.max(0, driverMs - leaderMs));
      }

      return t.players.noTime;
    }

    return driver.gapToLeader;
  };

  const tooltipContent = (() => {

    const driver = drivers.find(
      (d) => d.name === hoveredDriver
    );

    if (!driver) {
      return '';
    }

    const tirePercent = Math.round(
      100 - driver.wear
    );

    const pitText =
      driver.pitCount === 0
        ? '0-Pit'
        : `${driver.pitCount}Pit`;

    const emoji =
      driver.isManagingTires
        ? '🧊'
        : '🔥';

    const damagePercent = Math.round(
      100 - Math.max(0, Math.min(100, driver.carDamage ?? 0))
    );

    const kers = driver.kers ?? 0;

    return `
      ${tirePercent}%🛞 |
      ${kers.toFixed(0)}%🔋 |
      ${damagePercent}%🏎️ |
      ${pitText}🧑‍🔧 |
      ${emoji}
    `;
  })();

  const flagHeader =
    raceSession?.sessionType === 'race'
      ? FLAG_HEADER_CONFIG[
          visibleFlag as keyof typeof FLAG_HEADER_CONFIG
        ]
      : null;
  const shouldShowRaceLaps =
    raceSession?.sessionType === 'race'
    && (
      visibleFlag === 'YELLOW'
      || visibleFlag === 'SAFETY'
      || visibleFlag === 'VIRTUAL_SAFETY'
    );

  const isTimedSession =
    raceSession?.sessionType === 'qualy'
    || raceSession?.sessionType === 'hard_qualy';

  const sessionTimeLeft = formatSessionTime(
    (raceSession?.totalTime ?? 0)
    - (raceSession?.currentTimePassed ?? 0)
  );
  const trainingElapsedTime = formatSessionTime(
    raceSession?.currentTimePassed ?? 0
  );
  const isQualyOvertime =
    isTimedSession
    && raceSession?.totalTime !== null
    && raceSession !== null
    && raceSession.currentTimePassed >= raceSession.totalTime;

  return (
    <div
      className="fixed right-3 top-3 z-40 h-fit w-[min(15.5rem,calc(100vw-1.5rem))] border-4 border-[#FF232B] px-0 py-0 text-sm lg:static lg:w-auto lg:border-0 lg:text-base lg:outline lg:outline-[8px] lg:outline-[#FF232B]"
      style={{
        gridArea: 'players',
        backgroundColor: '#1E1E1E',
      }}
    >

      {/* HEADER */}
      <div
        className="flex cursor-pointer items-center justify-between gap-2 px-2 py-1.5 text-center lg:block lg:px-0 lg:py-2"
        onClick={toggleMobilePanel}
        style={{
          backgroundColor:
            flagHeader?.backgroundColor
            ?? '#1E1E1E',
          color:
            flagHeader?.color
            ?? '#FFFFFF',
        }}
      >
        <div className="min-w-0 flex-1 lg:flex-none">
          <div
            className={
              visibleFlag === 'SAFETY'
                ? 'truncate text-lg font-bold leading-none lg:text-3xl'
                : 'truncate text-xl font-bold leading-none lg:text-4xl'
            }
          >
            {flagHeader?.title
              ?? raceSession?.sessionType?.toUpperCase()
              ?? 'RACE'}
          </div>

          <div className="truncate text-sm font-bold leading-tight lg:text-xl">
            {shouldShowRaceLaps ? (
              <>
                {t.players.lap}{' '}
                <strong>
                  {raceSession?.currentLap ?? 0}
                </strong>
                /
                {raceSession?.totalLaps ?? 0}
              </>
            ) : flagHeader ? (
              flagHeader.subtitle
            ) : isQualyOvertime ? (
              <span className="text-red-500">
                {t.players.overtime}
              </span>
            ) : isTimedSession ? (
              sessionTimeLeft
            ) : raceSession?.sessionType === 'training' ? (
              trainingElapsedTime
            ) : (
              <>
                {t.players.lap}{' '}
                <strong>
                  {raceSession?.currentLap ?? 0}
                </strong>
                /
                {raceSession?.totalLaps ?? 0}
              </>
            )}
          </div>
        </div>

        <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-current text-base font-black leading-none lg:hidden">
          {isCollapsed ? '+' : '-'}
        </span>
      </div>

      <div className="border-b border-white/80" />

      {/* CONTENT */}
      {!isCollapsed && (
      <div className="group/pit-drivers relative max-h-[min(58vh,460px)] min-h-[240px] overflow-y-auto px-1.5 lg:max-h-none lg:min-h-[400px] lg:overflow-visible lg:px-2">

        {/* LOADING */}
        {loading && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              h-[400px]
              gap-4
            "
          >

            <div
              className="
                w-10
                h-10
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
                text-lg
                font-bold
              "
            >
              {t.players.loading}
            </span>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            className="
              flex
              items-center
              justify-center
              h-[400px]
              text-center
              px-6
            "
          >
            <div>

              <div className="text-5xl mb-4">
                ⚠️
              </div>

              <div
                className="
                  text-red-500
                  font-bold
                  text-xl
                  mb-2
                "
              >
                {t.players.loadError}
              </div>

              <div className="text-gray-400">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          drivers.length === 0 && (
            <div
              className="
                flex
                items-center
                justify-center
                h-[400px]
                text-gray-400
                text-lg
              "
            >
              {t.players.empty}
            </div>
          )}

        {/* DRIVERS */}
        {!loading &&
          !error &&
          drivers.length > 0 && (
            <>
              {displayedDrivers.map((driver) => (
                <div
                  key={`${driver.driverNumber}-${driver.name}`}
                  onClick={(e) => {
                    setHoveredDriver((current) => (
                      current === driver.name ? null : driver.name
                    ));

                    const rect =
                      e.currentTarget.getBoundingClientRect();

                    const parentRect =
                      e.currentTarget.parentElement?.getBoundingClientRect();

                    if (parentRect) {

                      setHoveredDriverPosition(
                        rect.top -
                          parentRect.top
                      );
                    }
                  }}
                  onMouseEnter={(e) => {

                    setHoveredDriver(
                      driver.name
                    );

                    const rect =
                      e.currentTarget.getBoundingClientRect();

                    const parentRect =
                      e.currentTarget.parentElement?.getBoundingClientRect();

                    if (parentRect) {

                      setHoveredDriverPosition(
                        rect.top -
                          parentRect.top
                      );
                    }
                  }}

                  onMouseLeave={() => {

                    setHoveredDriver(
                      null
                    );

                    setHoveredDriverPosition(
                      null
                    );
                  }}
                >

                  <PlayerRow
                    driver={driver}
                    isOut={raceSession?.sessionType === 'race' && driver.isOut}
                    isFinished={raceSession?.sessionType === 'race' && driver.isFinished}
                    showSectorBars={shouldShowSectorBars}
                    gapText={getGapText(
                      driver
                    )}
                  />
                </div>
              ))}

              <HoverTooltip
                visible={
                  !!hoveredDriver
                }
                position={
                  hoveredDriverPosition
                }
                content={
                  tooltipContent
                }
              />
            </>
          )}
      </div>
      )}
    </div>
  );
}


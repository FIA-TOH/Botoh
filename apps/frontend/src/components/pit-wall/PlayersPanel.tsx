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
    title: 'SAFETY',
    subtitle: 'CAR',
    color: '#000000',
    backgroundColor: '#FFC919',
  },
  VIRTUAL_SAFETY: {
    title: 'VIRTUAL',
    subtitle: 'SAFETY CAR',
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
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

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

  const isQualifyingSession =
    raceSession?.sessionType === 'qualy'
    || raceSession?.sessionType === 'hard_qualy';

  const sortedDrivers = [...drivers].sort((a, b) => {
    if (isQualifyingSession) {
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

  const displayedDrivers = isQualifyingSession
    ? sortedDrivers.map((driver, index) => ({
        ...driver,
        position: driver.bestTime ? index + 1 : null,
      }))
    : sortedDrivers;

  const qualifyingLeader = isQualifyingSession
    ? displayedDrivers.find((driver) => !!driver.bestTime)
    : undefined;

  const getGapText = (driver: Driver) => {

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
        ? t.players.outLap
        : driver.gapToLeader;
    }

    if (
      isQualifyingSession
    ) {
      const driverLapTime =
        driver.bestTime

      if (qualifyingLeader?.name === driver.name) {
        return driverLapTime ?? t.players.noTime;
      }

      if (!driverLapTime) {
        return t.players.noTime;
      }

      const leaderLapTime =
        qualifyingLeader?.bestTime

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

    if (raceSession?.sessionType === 'training') {
      return driver.bestTime ?? t.players.noTime;
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

    return `
      ${tirePercent}% 
      ${pitText} 
      ${emoji}
    `;
  })();

  const flagHeader =
    raceSession?.sessionType === 'race'
      ? FLAG_HEADER_CONFIG[
          visibleFlag as keyof typeof FLAG_HEADER_CONFIG
        ]
      : null;

  const isTimedSession =
    raceSession?.sessionType === 'qualy'
    || raceSession?.sessionType === 'hard_qualy';

  const sessionTimeLeft = formatSessionTime(
    (raceSession?.totalTime ?? 0)
    - (raceSession?.currentTimePassed ?? 0)
  );
  const isQualyOvertime =
    isTimedSession
    && raceSession?.totalTime !== null
    && raceSession !== null
    && raceSession.currentTimePassed >= raceSession.totalTime;

  return (
    <div
      className="px-0 py-0 h-fit"
      style={{
        gridArea: 'players',
        backgroundColor: '#1E1E1E',
        outline: '8px solid #FF232B',
      }}
    >

      {/* HEADER */}
      <div
        className="py-2 text-center"
        style={{
          backgroundColor:
            flagHeader?.backgroundColor
            ?? '#1E1E1E',
          color:
            flagHeader?.color
            ?? '#FFFFFF',
        }}
      >
        <div className="text-4xl font-bold leading-none">
          {flagHeader?.title
            ?? raceSession?.sessionType?.toUpperCase()
            ?? 'RACE'}
        </div>

        <div className="text-xl font-bold leading-tight">
          {flagHeader ? (
            flagHeader.subtitle
          ) : isQualyOvertime ? (
            <span className="text-red-500">
              {t.players.overtime}
            </span>
          ) : isTimedSession ? (
            sessionTimeLeft
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

      <div className="border-b border-white" />

      {/* CONTENT */}
      <div className="px-2 relative min-h-[400px]">

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
    </div>
  );
}


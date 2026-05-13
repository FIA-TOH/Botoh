'use client';

import { useState } from 'react';

import { PlayerRow } from './PlayerRow';
import { HoverTooltip } from './HoverTooltip';

import {
  formatGap,
  lapTimeToMs,
} from '../../app/utils/race';

import { mockRaceData } from '@/mocks/raceData';

interface Props {
  drivers?: any[];

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

function timeToSeconds(time: string): number {
  const parts = time
    .split(':')
    .map(Number);

  if (
    parts.length !== 2
    || parts.some((part) => !Number.isFinite(part))
  ) {
    return 0;
  }

  return parts[0] * 60 + parts[1];
}

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
  loading = false,
  error = null,
}: Props) {
  const [hoveredDriver, setHoveredDriver] =
    useState<string | null>(null);

  const [
    hoveredDriverPosition,
    setHoveredDriverPosition,
  ] = useState<number | null>(null);

  const getGapText = (driver: any) => {

    if (driver.isOut) {
      return 'OUT';
    }

    if (driver.inPit) {
      return 'PIT';
    }

    if (
      mockRaceData.sessionType === 'RACE'
    ) {
      return driver.position === 1
        ? 'Out Lap'
        : driver.gapToLeader;
    }

    if (
      mockRaceData.sessionType === 'QUALY'
    ) {
      const driverLapTime =
        driver.bestLapTime
        ?? driver.qualyTime;

      if (driver.position === 1) {
        return driverLapTime ?? 'No Time';
      }

      if (!driverLapTime) {
        return 'No Time';
      }

      const leader = drivers.find(
        (d) => d.position === 1
      );

      const leaderLapTime =
        leader?.bestLapTime
        ?? leader?.qualyTime;

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

        return formatGap(
          driverMs - leaderMs
        );
      }

      return 'No Time';
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
      100 - driver.tireWear
    );

    const pitText =
      driver.pitCount === 0
        ? '0-Pit'
        : `${driver.pitCount}Pit`;

    const emoji =
      driver.managingTires
        ? '🧊'
        : '🔥';

    return `
      ${tirePercent}% 
      ${pitText} 
      ${emoji}
    `;
  })();

  const flagHeader =
    mockRaceData.sessionType === 'RACE'
      ? FLAG_HEADER_CONFIG[
          mockRaceData.flag as keyof typeof FLAG_HEADER_CONFIG
        ]
      : null;

  const isTimedSession =
    mockRaceData.sessionType === 'QUALY'
    || mockRaceData.sessionType === 'TRAINING';

  const sessionTimeLeft = formatSessionTime(
    timeToSeconds(mockRaceData.totalTime)
    - timeToSeconds(mockRaceData.currentTimePassed)
  );

  const sortedDrivers = [...drivers].sort((a, b) => {
    const aHasPosition = typeof a.position === 'number';
    const bHasPosition = typeof b.position === 'number';

    if (aHasPosition && bHasPosition) {
      return a.position - b.position;
    }

    if (aHasPosition) return -1;
    if (bHasPosition) return 1;

    return String(a.name ?? a.shortName ?? '')
      .localeCompare(
        String(b.name ?? b.shortName ?? ''),
        undefined,
        { sensitivity: 'base' }
      );
  });

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
            ?? mockRaceData.sessionType}
        </div>

        <div className="text-xl font-bold leading-tight">
          {flagHeader ? (
            flagHeader.subtitle
          ) : isTimedSession ? (
            sessionTimeLeft
          ) : (
            <>
              LAP{' '}
              <strong>
                {mockRaceData.currentLap}
              </strong>
              /
              {mockRaceData.totalLaps}
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
              Carregando...
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
                Erro ao carregar pilotos
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
              Nenhum tempo ainda.
            </div>
          )}

        {/* DRIVERS */}
        {!loading &&
          !error &&
          drivers.length > 0 && (
            <>
              {sortedDrivers.map((driver) => (
                <div
                  key={driver.driverNumber ?? driver.name}
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

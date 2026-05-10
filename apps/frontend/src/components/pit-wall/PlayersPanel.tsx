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

      if (driver.position === 1) {
        return driver.qualyTime;
      }

      const leader = drivers.find(
        (d) => d.position === 1
      );

      if (leader) {

        const leaderMs = lapTimeToMs(
          leader.qualyTime
        );

        const driverMs = lapTimeToMs(
          driver.qualyTime
        );

        return formatGap(
          driverMs - leaderMs
        );
      }
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

  return (
    <div
      className="px-0 py-2 h-fit"
      style={{
        gridArea: 'players',
        backgroundColor: '#1E1E1E',
        outline: '8px solid #FF232B',
      }}
    >

      {/* HEADER */}
      <div className="text-4xl font-bold text-center">
        {mockRaceData.sessionType}
      </div>

      <div className="text-xl text-center mb-2">
        LAP{' '}
        <strong>
          {mockRaceData.currentLap}
        </strong>
        /
        {mockRaceData.totalLaps}
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
              {drivers.map((driver) => (
                <div
                  key={driver.position}
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
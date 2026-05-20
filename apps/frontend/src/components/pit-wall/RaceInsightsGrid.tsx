'use client';

import { useEffect, useMemo, useState } from 'react';
import { DriverCircle } from './DriverCircle';
import { RaceSession } from '@/mocks/raceData';
import { colorNumberToHex } from '@/app/utils/race';
import { useTranslations } from '@/i18n';

interface Props {
  drivers?: any[];
  loggedUserTeam?: string | null;
  loggedUserWeatherLevel?: number;
  raceSession?: RaceSession | null;
  loading?: boolean;
  error?: string | null;
}

function RaceInsightsState({
  title,
  message,
  loading = false,
}: {
  title: string;
  message?: string;
  loading?: boolean;
}) {
  return (
    <section className="mt-8">
      <div
        style={{
          backgroundColor: '#1E1E1E',
          outline: '8px solid #FF232B',
        }}
        className="
          min-h-[260px]
          p-4
          flex
          flex-col
          items-center
          justify-center
          text-center
        "
      >
        {loading && (
          <div
            className="
              mb-4
              w-10
              h-10
              border-4
              border-white/20
              border-t-red-500
              rounded-full
              animate-spin
            "
          />
        )}

        <div className="text-2xl font-bold uppercase">
          {title}
        </div>

        {message && (
          <div className="mt-2 text-lg text-gray-300">
            {message}
          </div>
        )}
      </div>
    </section>
  );
}

function UnavailableRaceInsight({
  message,
}: {
  message: string;
}) {
  return (
    <div className="flex min-h-[180px] items-center justify-center text-center text-xl text-gray-300">
      {message}
    </div>
  );
}

export function RaceInsightsGrid({
  drivers = [],
  loggedUserTeam = null,
  loggedUserWeatherLevel = 0,
  raceSession = null,
  loading = false,
  error = null,
}: Props) {
  const { language, t } = useTranslations();
  const driverOptions = useMemo(
    () => drivers.map((driver) => driver.name),
    [drivers]
  );
  const paceDefaults = useMemo(() => {
    const teamDriverNames = drivers
      .filter((driver) => loggedUserTeam !== null && driver.leagueScuderia === loggedUserTeam)
      .map((driver) => driver.name);

    if (teamDriverNames.length >= 2) {
      return {
        pace: teamDriverNames[0],
        compare: teamDriverNames[1],
      };
    }

    if (teamDriverNames.length === 1) {
      const fallbackDriver =
        driverOptions.find((name) => name !== teamDriverNames[0])
        ?? teamDriverNames[0];

      return {
        pace: teamDriverNames[0],
        compare: fallbackDriver,
      };
    }

    const shuffledDrivers = [...driverOptions].sort(
      () => Math.random() - 0.5
    );

    return {
      pace: shuffledDrivers[0] ?? 'Joninho',
      compare: shuffledDrivers[1] ?? shuffledDrivers[0] ?? 'Nava',
    };
  }, [driverOptions, drivers, loggedUserTeam]);
  const [paceDriver, setPaceDriver] = useState(paceDefaults.pace);
  const [compareDriver, setCompareDriver] = useState(paceDefaults.compare);
  const [gapDriverA, setGapDriverA] = useState(paceDefaults.pace);
  const [gapDriverB, setGapDriverB] = useState(paceDefaults.compare);
  const [pitStopDriver, setPitStopDriver] = useState(paceDefaults.pace);
  const [now, setNow] = useState(() => Date.now());
  const hideRaceOnlyInsights =
    raceSession?.sessionType === 'training'
    || raceSession?.sessionType === 'qualy'
    || raceSession?.sessionType === 'hard_qualy';
  const unavailableRaceInsightMessage = t.insights.raceOnly;

  useEffect(() => {
    setPaceDriver((current: string) =>
      driverOptions.includes(current) ? current : paceDefaults.pace
    );
    setCompareDriver((current: string) =>
      driverOptions.includes(current) ? current : paceDefaults.compare
    );
    setGapDriverA((current: string) =>
      driverOptions.includes(current) ? current : paceDefaults.pace
    );
    setGapDriverB((current: string) =>
      driverOptions.includes(current) ? current : paceDefaults.compare
    );
    setPitStopDriver((current: string) =>
      driverOptions.includes(current) ? current : paceDefaults.pace
    );
  }, [driverOptions, paceDefaults.compare, paceDefaults.pace]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const weatherBySection = [
    {
      label: t.insights.sectors[0],
      rainChance: raceSession?.weather?.global.rain ?? 0,
      wetness: raceSession?.weather?.global.wet ?? 0,
      highlight: true,
    },
    {
      label: t.insights.sectors[1],
      rainChance: raceSession?.weather?.sectors.sector1.rain ?? 0,
      wetness: raceSession?.weather?.sectors.sector1.wet ?? 0,
      highlight: false,
    },
    {
      label: t.insights.sectors[2],
      rainChance: raceSession?.weather?.sectors.sector2.rain ?? 0,
      wetness: raceSession?.weather?.sectors.sector2.wet ?? 0,
      highlight: false,
    },
    {
      label: t.insights.sectors[3],
      rainChance: raceSession?.weather?.sectors.sector3.rain ?? 0,
      wetness: raceSession?.weather?.sectors.sector3.wet ?? 0,
      highlight: false,
    },
  ];

  const getRainEmoji = (percentage: number) => {
    if (percentage === 0) return '☀️';
    if (percentage < 50) return '🌧️';
    return '⛈️';
  };

  const getWetnessEmoji = (percentage: number) => {
    if (percentage === 0) return '☀️';
    return '💧';
  };

  const formatWeatherValue = (value: number) => Math.round(value);
  const lastWeatherAnnouncement = raceSession?.weather?.lastAnnouncement ?? null;
  const realisticWeatherLevel = Math.max(0, Math.min(5, Math.floor(loggedUserWeatherLevel ?? 0)));
  const realisticWeatherAnnouncement =
    raceSession?.weather?.realisticAnnouncementsByLevel?.[realisticWeatherLevel]
    ?? null;
  const displayedWeatherAnnouncement = raceSession?.weather?.realisticRainAnnouncer
    ? realisticWeatherAnnouncement
    : lastWeatherAnnouncement;
  const weatherAnnouncementAge = displayedWeatherAnnouncement && !raceSession?.weather?.realisticRainAnnouncer
    ? Math.max(0, Math.floor((now - displayedWeatherAnnouncement.announcedAtTimestamp) / 1000))
    : null;
  const formatAnnouncementAge = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return t.insights.minutesAgo(minutes, seconds.toString().padStart(2, '0'));
  };
  const formatGameTime = (totalSeconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  const weatherForecastTime =
    realisticWeatherAnnouncement && raceSession?.weather?.realisticRainAnnouncer
      ? realisticWeatherAnnouncement.isEstimated
        ? t.insights.estimatedForecastTime(formatGameTime(realisticWeatherAnnouncement.displayedEventGameTime))
        : t.insights.forecastTime(formatGameTime(realisticWeatherAnnouncement.displayedEventGameTime))
      : null;
  const weatherForecastIntensity =
    realisticWeatherAnnouncement?.intensity
      ? realisticWeatherAnnouncement.intensity.type === 'max'
        ? t.insights.maxRainIntensity(Math.round(realisticWeatherAnnouncement.intensity.value).toString())
        : t.insights.minRainIntensity(Math.round(realisticWeatherAnnouncement.intensity.value).toString())
      : null;

  const selectedGapDriverA = drivers.find((driver) => driver.name === gapDriverA);
  const selectedGapDriverB = drivers.find((driver) => driver.name === gapDriverB);
  const gapContext = useMemo(() => {
    if (!selectedGapDriverA || !selectedGapDriverB) return null;

    const indexA = drivers.findIndex((driver) => driver.name === selectedGapDriverA.name);
    const indexB = drivers.findIndex((driver) => driver.name === selectedGapDriverB.name);

    if (
      indexA === -1
      || indexB === -1
      || indexA === indexB
    ) {
      return {
        ahead: selectedGapDriverA,
        behind: selectedGapDriverB,
        gapSeconds: null,
        carsBetween: null,
      };
    }

    const ahead =
      indexA < indexB ? selectedGapDriverA : selectedGapDriverB;
    const behind =
      indexA < indexB ? selectedGapDriverB : selectedGapDriverA;
    const commonCheckpointKeys = Object.keys(behind.checkpointTimes ?? {})
      .filter((key) => typeof ahead.checkpointTimes?.[key] === 'number')
      .sort((left, right) => {
        const [leftLap, leftSector] = left.split(':').map(Number);
        const [rightLap, rightSector] = right.split(':').map(Number);

        if (leftLap !== rightLap) {
          return rightLap - leftLap;
        }

        return rightSector - leftSector;
      });
    const checkpointKey = commonCheckpointKeys[0];
    const aheadTimeAtCheckpoint = checkpointKey
      ? ahead.checkpointTimes?.[checkpointKey]
      : undefined;
    const behindTimeAtCheckpoint = checkpointKey
      ? behind.checkpointTimes?.[checkpointKey]
      : undefined;
    const rawGap =
      typeof aheadTimeAtCheckpoint === 'number'
      && typeof behindTimeAtCheckpoint === 'number'
        ? Math.abs(behindTimeAtCheckpoint - aheadTimeAtCheckpoint)
        : null;

    return {
      ahead,
      behind,
      gapSeconds:
        rawGap !== null && Number.isFinite(rawGap) && rawGap >= 0
          ? rawGap
          : null,
      carsBetween: Math.max(0, Math.abs(indexA - indexB) - 1),
    };
  }, [drivers, selectedGapDriverA, selectedGapDriverB]);
  const pitGapThreshold = raceSession?.pitGap?.value ?? 40;
  const isPitGapEstimated = raceSession?.pitGap?.isEstimated ?? true;
  const hasPitGap =
    gapContext?.gapSeconds !== null && gapContext?.gapSeconds !== undefined
      ? gapContext.gapSeconds > pitGapThreshold
      : null;
  const pitGapLabel =
    hasPitGap === null
      ? '—'
      : `${isPitGapEstimated ? '~' : ''}${hasPitGap ? t.insights.yes : t.insights.no}`;

  const getLatestCommonCheckpointGap = (driverA: any, driverB: any) => {
    const commonCheckpointKeys = Object.keys(driverB.checkpointTimes ?? {})
      .filter((key) => typeof driverA.checkpointTimes?.[key] === 'number')
      .sort((left, right) => {
        const [leftLap, leftSector] = left.split(':').map(Number);
        const [rightLap, rightSector] = right.split(':').map(Number);

        if (leftLap !== rightLap) {
          return rightLap - leftLap;
        }

        return rightSector - leftSector;
      });
    const checkpointKey = commonCheckpointKeys[0];
    const driverATimeAtCheckpoint = checkpointKey
      ? driverA.checkpointTimes?.[checkpointKey]
      : undefined;
    const driverBTimeAtCheckpoint = checkpointKey
      ? driverB.checkpointTimes?.[checkpointKey]
      : undefined;

    if (
      typeof driverATimeAtCheckpoint !== 'number'
      || typeof driverBTimeAtCheckpoint !== 'number'
    ) {
      return null;
    }

    const gap = Math.abs(driverBTimeAtCheckpoint - driverATimeAtCheckpoint);
    return Number.isFinite(gap) ? gap : null;
  };

  const getProjectedPitStop = (driverName: string) => {
    const currentIndex = drivers.findIndex((driver) => driver.name === driverName);
    if (currentIndex === -1) return null;

    const driver = drivers[currentIndex];
    const driversBehind = drivers.slice(currentIndex + 1);
    const overtakingDrivers = driversBehind.filter((candidate) => {
      const gap = getLatestCommonCheckpointGap(driver, candidate);
      return gap !== null && gap < pitGapThreshold;
    });
    const reorderedDrivers = drivers.filter((candidate) => candidate.name !== driver.name);
    const projectedIndex = currentIndex + overtakingDrivers.length;
    reorderedDrivers.splice(projectedIndex, 0, driver);
    const projectedPosition = projectedIndex + 1;
    const projectedAheadDriver =
      projectedIndex > 0
        ? reorderedDrivers[projectedIndex - 1]
        : null;
    const projectedGapToAhead =
      projectedAheadDriver
        ? (() => {
            if (projectedAheadDriver.name === driver.name) return 0;

            const wasOriginallyAhead =
              drivers.findIndex((candidate) => candidate.name === projectedAheadDriver.name)
              < currentIndex;

            if (wasOriginallyAhead) {
              const currentGap = getLatestCommonCheckpointGap(projectedAheadDriver, driver);
              return currentGap === null ? null : currentGap + pitGapThreshold;
            }

            const currentGap = getLatestCommonCheckpointGap(driver, projectedAheadDriver);
            return currentGap === null ? null : pitGapThreshold - currentGap;
          })()
        : null;

    return {
      driver,
      projectedPosition,
      projectedAheadDriver,
      projectedGapToAhead,
    };
  };

  const teamPitStopDrivers = drivers.filter(
    (driver) =>
      loggedUserTeam !== null
      && driver.leagueScuderia === loggedUserTeam
      && !driver.isOut
  );
  const customPitStopProjection = getProjectedPitStop(pitStopDriver);
  const formatOrdinal = (position: number) => `${position}º`;
  const formatPitStopProjection = (driverName: string) => {
    const projection = getProjectedPitStop(driverName);
    if (!projection) return null;

    if (projection.projectedPosition === 1) {
      return t.insights.projectionFirst(projection.driver.name);
    }

    if (
      !projection.projectedAheadDriver
      || projection.projectedGapToAhead === null
    ) {
      return t.insights.projectionPosition(
        projection.driver.name,
        formatOrdinal(projection.projectedPosition),
      );
    }

    return t.insights.projectionBehind(
      projection.driver.name,
      projection.projectedGapToAhead.toFixed(3),
      projection.projectedAheadDriver.name,
      formatOrdinal(projection.projectedPosition),
    );
  };

  const selectedPaceDriver = drivers.find((driver) => driver.name === paceDriver);
  const selectedCompareDriver = drivers.find((driver) => driver.name === compareDriver);
  const formatPaceTime = (time: number | null | undefined) =>
    typeof time === 'number' ? time.toFixed(3) : '---';
  const formatPaceDelta = (
    comparison: number | null | undefined,
    reference: number | null | undefined,
  ) => {
    if (typeof comparison !== 'number' || typeof reference !== 'number') {
      return null;
    }

    const delta = comparison - reference;
    return `${delta >= 0 ? '+' : ''}${delta.toFixed(3)}`;
  };
  const getDeltaClassName = (delta: string | null) => {
    if (!delta) return '';
    return delta.startsWith('-') ? 'text-green-400' : 'text-red-400';
  };
  const paceComparisonRows = [
    {
      label: t.insights.fastestLap,
      primary: selectedPaceDriver?.paceStats.fastestLap,
      comparison: selectedCompareDriver?.paceStats.fastestLap,
    },
    {
      label: t.insights.lastFiveLaps,
      primary: selectedPaceDriver?.paceStats.lastFiveAverage,
      comparison: selectedCompareDriver?.paceStats.lastFiveAverage,
    },
    {
      label: t.insights.lastLap,
      primary: selectedPaceDriver?.paceStats.lastLap,
      comparison: selectedCompareDriver?.paceStats.lastLap,
    },
    {
      label: t.insights.lastLapVsAverage,
      primary: selectedPaceDriver?.paceStats.lastLapComparedToAverage,
      comparison: selectedCompareDriver?.paceStats.lastLapComparedToAverage,
    },
  ];

  if (loading) {
    return (
      <RaceInsightsState
        title={t.insights.loadingTitle}
        message={t.insights.loadingMessage}
        loading
      />
    );
  }

  if (error) {
    return (
      <RaceInsightsState
        title={t.insights.errorTitle}
        message={error}
      />
    );
  }

  if (driverOptions.length === 0) {
    return (
      <RaceInsightsState
        title={t.insights.emptyTitle}
        message={t.insights.emptyMessage}
      />
    );
  }

  return (
    <section className="mt-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="grid gap-8">
          <div
            style={{
              backgroundColor: '#1E1E1E',
              outline: '8px solid #FF232B',
            }}
            className="p-4"
          >
            <div className="grid grid-cols-4 items-center gap-3">
              {weatherBySection.map((section) => (
                <div key={section.label} className="text-center">
                  <div
                    className={`uppercase ${
                      section.highlight ? 'text-xl font-bold' : 'text-sm'
                    }`}
                  >
                    {section.label}
                  </div>

                  <div className={`mt-2 ${section.highlight ? 'text-lg font-bold' : 'text-base'}`}>
                    {getRainEmoji(section.rainChance)} {formatWeatherValue(section.rainChance)}%
                  </div>

                  <div className={`mt-2 ${section.highlight ? 'text-lg font-bold' : 'text-base'}`}>
                    {getWetnessEmoji(section.wetness)} {formatWeatherValue(section.wetness)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1E1E1E',
              outline: '8px solid #FF232B',
            }}
            className="p-4 text-center"
          >
            <div className="text-2xl font-bold uppercase">{t.insights.forecast}</div>
            <div className="mt-3 text-xl">
              {raceSession?.weather?.realisticRainAnnouncer && realisticWeatherLevel <= 0
                ? t.insights.noWeatherAccess
                : displayedWeatherAnnouncement?.message[language] ?? t.insights.noWeather}
            </div>
            {weatherForecastTime && (
              <div className="mt-2 text-base text-gray-300">
                {weatherForecastTime}
              </div>
            )}
            {weatherForecastIntensity && (
              <div className="mt-1 text-base text-gray-300">
                {weatherForecastIntensity}
              </div>
            )}
            {weatherAnnouncementAge !== null && (
              <div className="mt-2 text-base text-gray-300">
                {formatAnnouncementAge(weatherAnnouncementAge)}
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: '#1E1E1E',
              outline: '8px solid #FF232B',
            }}
            className="p-4"
          >
            {hideRaceOnlyInsights ? (
              <UnavailableRaceInsight message={unavailableRaceInsightMessage} />
            ) : (
              <>
                <div className="flex items-center gap-2 text-2xl font-bold uppercase">
              <span>{t.insights.pace}:</span>
              <div className="relative">
                <select
                  value={paceDriver}
                  onChange={(event) => setPaceDriver(event.target.value)}
                  className="appearance-none bg-transparent pr-6 font-normal uppercase outline-none"
                >
                  {driverOptions.map((name) => (
                    <option key={name} value={name} className="text-black">
                      {name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-sm">
                  ▼
                </span>
              </div>
            </div>
            <div className="mt-2 space-y-1 text-xl">
              {paceComparisonRows.map((row) => (
                <div key={`pace-primary-${row.label}`}>
                  <span className="font-bold">{row.label}:</span> {formatPaceTime(row.primary)}
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 text-2xl font-bold uppercase">
              <span>{t.insights.compare}:</span>
              <div className="relative">
                <select
                  value={compareDriver}
                  onChange={(event) => setCompareDriver(event.target.value)}
                  className="appearance-none bg-transparent pr-6 font-normal uppercase outline-none"
                >
                  {driverOptions.map((name) => (
                    <option key={name} value={name} className="text-black">
                      {name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-sm">
                  ▼
                </span>
              </div>
            </div>
            <div className="mt-2 space-y-1 text-xl">
              {paceComparisonRows.map((row) => {
                const delta = formatPaceDelta(row.comparison, row.primary);

                return (
                  <div key={`pace-compare-${row.label}`}>
                    <span className="font-bold">{row.label}:</span>{' '}
                    <span className={getDeltaClassName(delta)}>
                      {formatPaceTime(row.comparison)}
                      {delta ? ` (${delta})` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-8">
          <div
            style={{
              backgroundColor: '#1E1E1E',
              outline: '8px solid #FF232B',
              alignContent: 'center',
            }}
            className="p-4"
          >
            {hideRaceOnlyInsights ? (
              <UnavailableRaceInsight message={unavailableRaceInsightMessage} />
            ) : (
              <>
                <div className="text-center text-3xl font-bold uppercase">{t.insights.gap}</div>
            <div className="mt-2 flex items-center justify-center gap-2 text-xl font-bold uppercase">
              <div className="relative">
                <select
                  value={gapDriverA}
                  onChange={(event) => setGapDriverA(event.target.value)}
                  className="appearance-none bg-transparent pl-6 pr-1 font-normal uppercase outline-none"
                >
                  {driverOptions.map((name) => (
                    <option key={`gap-a-${name}`} value={name} className="text-black">
                      {name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-sm">
                  ▼
                </span>
              </div>
              <span>vs</span>
              <div className="relative">
                <select
                  value={gapDriverB}
                  onChange={(event) => setGapDriverB(event.target.value)}
                  className="appearance-none bg-transparent pr-6 font-normal uppercase outline-none"
                >
                  {driverOptions.map((name) => (
                    <option key={`gap-b-${name}`} value={name} className="text-black">
                      {name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-sm">
                  ▼
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[150px_1fr_150px] gap-2">
              <div className="flex items-center justify-end pt-1">
                {gapContext?.ahead && (
                  <DriverCircle
                    number={gapContext.ahead.driverNumber}
                    color={colorNumberToHex(gapContext.ahead.scuderiaColor)}
                  />
                )}
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mt-10">
                  <div className="h-px w-full bg-gray-300/80" />
                  <div className="text-3xl font-bold">
                    {gapContext?.gapSeconds !== null && gapContext?.gapSeconds !== undefined
                      ? `${gapContext.gapSeconds.toFixed(3)}s`
                      : '—'}
                  </div>
                  <div className="h-px w-full bg-gray-300/80" />
                </div>
                <div className="mt-1 text-xl">
                  {gapContext?.carsBetween !== null && gapContext?.carsBetween !== undefined
                    ? `${gapContext.carsBetween} ${t.insights.carsBetween}`
                    : '— ${t.insights.carsBetween}'}
                </div>
                <div className="mt-1 text-xl">{t.insights.pitGap}: {pitGapLabel}</div>
              </div>

              <div className="flex items-center justify-start pt-1">
                {gapContext?.behind && (
                  <DriverCircle
                    number={gapContext.behind.driverNumber}
                    color={colorNumberToHex(gapContext.behind.scuderiaColor)}
                  />
                )}
              </div>
            </div>
              </>
            )}
          </div>

          <div
            style={{
              backgroundColor: '#1E1E1E',
              outline: '8px solid #FF232B',
              alignContent: 'center',
            }}
            className="p-4"
          >
            {hideRaceOnlyInsights ? (
              <UnavailableRaceInsight message={unavailableRaceInsightMessage} />
            ) : (
              <>
                <div className="text-center text-3xl font-bold uppercase">{t.insights.pitStops}</div>

                <div className="mt-3 space-y-1 text-center text-xl">
                  {teamPitStopDrivers.length === 0 ? (
                    <div>{t.insights.noTeamDrivers}</div>
                  ) : (
                    teamPitStopDrivers.map((driver) => (
                      <div key={`team-pit-${driver.name}`}>
                        {formatPitStopProjection(driver.name)}
                      </div>
                    ))
                  )}

                  <div className="pt-3 font-bold">
                    <span>{t.insights.if} </span>
                    <select
                      value={pitStopDriver}
                      onChange={(event) => setPitStopDriver(event.target.value)}
                      className="bg-transparent font-bold uppercase outline-none"
                    >
                      {drivers
                        .filter((driver) => !driver.isOut)
                        .map((driver) => (
                          <option key={`pit-driver-${driver.name}`} value={driver.name} className="text-black">
                            {driver.name}
                          </option>
                        ))}
                    </select>
                    <span> {t.insights.stopNow} </span>
                    {customPitStopProjection?.projectedPosition === 1 ? (
                      <span>{t.insights.first}</span>
                    ) : customPitStopProjection?.projectedAheadDriver
                      && customPitStopProjection.projectedGapToAhead !== null ? (
                        <span>
                          {t.insights.exitsBehind(
                            customPitStopProjection.projectedGapToAhead.toFixed(3),
                            customPitStopProjection.projectedAheadDriver.name,
                            formatOrdinal(customPitStopProjection.projectedPosition),
                          )}
                        </span>
                      ) : customPitStopProjection ? (
                        <span>{t.insights.exits} {formatOrdinal(customPitStopProjection.projectedPosition)}</span>
                      ) : (
                        <span>{t.insights.noData}</span>
                      )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}







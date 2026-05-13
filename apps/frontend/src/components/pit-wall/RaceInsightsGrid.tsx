'use client';

import { useEffect, useMemo, useState } from 'react';
import { mockRaceData } from '@/mocks/raceData';
import { DriverCircle } from './DriverCircle';

interface Props {
  drivers?: any[];
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

export function RaceInsightsGrid({
  drivers = mockRaceData.drivers,
  loading = false,
  error = null,
}: Props) {
  const driverOptions = useMemo(
    () => drivers.map((driver) => driver.name),
    [drivers]
  );
  const paceDefaults = useMemo(() => {
    const teamDriverNames = drivers
      .filter((driver) => driver.team === mockRaceData.loggedUserTeam)
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
  }, [driverOptions, drivers]);
  const [paceDriver, setPaceDriver] = useState(paceDefaults.pace);
  const [compareDriver, setCompareDriver] = useState(paceDefaults.compare);
  const [gapDriverA, setGapDriverA] = useState(paceDefaults.pace);
  const [gapDriverB, setGapDriverB] = useState(paceDefaults.compare);
  const hasPitGap = true;

  useEffect(() => {
    setPaceDriver(paceDefaults.pace);
    setCompareDriver(paceDefaults.compare);
    setGapDriverA(paceDefaults.pace);
    setGapDriverB(paceDefaults.compare);
  }, [paceDefaults]);

  const weatherBySection = [
    { label: 'Global', rainChance: 49, wetness: 20, highlight: true },
    { label: 'Sector 1', rainChance: 51, wetness: 80, highlight: false },
    { label: 'Sector 2', rainChance: 1, wetness: 10, highlight: false },
    { label: 'Sector 3', rainChance: 1, wetness: 0, highlight: false },
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

  if (loading) {
    return (
      <RaceInsightsState
        title="Carregando visualizacao"
        message="Buscando dados da corrida."
        loading
      />
    );
  }

  if (error) {
    return (
      <RaceInsightsState
        title="Erro ao carregar visualizacao"
        message={error}
      />
    );
  }

  if (driverOptions.length === 0) {
    return (
      <RaceInsightsState
        title="Sem dados"
        message="Nenhum piloto disponivel para montar a visualizacao."
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

                  <div className={`mt-2 ${section.highlight ? 'text-2xl font-bold' : 'text-base'}`}>
                    {getRainEmoji(section.rainChance)} {section.rainChance}%
                  </div>

                  <div className={`mt-2 ${section.highlight ? 'text-xl font-bold' : 'text-base'}`}>
                    {getWetnessEmoji(section.wetness)} {section.wetness}%
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
            <div className="text-2xl font-bold uppercase">Previsão do tempo</div>
            <div className="mt-3 text-xl">Chuva deve parar em 2 minutos</div>
          </div>

          <div
            style={{
              backgroundColor: '#1E1E1E',
              outline: '8px solid #FF232B',
            }}
            className="p-4"
          >
            <div className="flex items-center gap-2 text-2xl font-bold uppercase">
              <span>Pace:</span>
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
              <div>Fastest Lap: 34.543</div>
              <div>Ultimas 5 voltas: 36.546</div>
              <div>Ultima volta: -37.236</div>
              <div>Ultima volta comparado a media: -02.345</div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-2xl font-bold uppercase">
              <span>Comparar:</span>
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
              <div>
                Fastest Lap: <span className="text-green-400">34.500 (+0.043)</span>
              </div>
              <div>
                Ultimas 5 voltas: <span className="text-red-400">36.645 (-0.100)</span>
              </div>
              <div>
                Ultima volta: <span className="text-green-400">+1.594</span>
              </div>
              <div>
                Media: <span className="text-green-400">+01.345</span>
              </div>
            </div>
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
            <div className="text-center text-3xl font-bold uppercase">Gap</div>
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
                <DriverCircle number={43} color="#617BE0" />
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mt-10">
                  <div className="h-px w-full bg-gray-300/80" />
                  <div className="text-3xl font-bold">10.546s</div>
                  <div className="h-px w-full bg-gray-300/80" />
                </div>
                <div className="mt-1 text-xl">3 carros entre os pilotos</div>
                <div className="mt-1 text-xl">Pit Gap: {hasPitGap ? '✅' : '❌'}</div>
              </div>

              <div className="flex items-center justify-start pt-1">
                <DriverCircle number={52} color="#617BE0" />
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#1E1E1E',
              outline: '8px solid #FF232B',
              alignContent: 'center',
            }}
            className="p-4"
          >
            <div className="text-center text-3xl font-bold uppercase">Pit-Stops</div>

            <div className="mt-3 space-y-1 text-center text-xl">
              <div>Se NAVA parar agora sai 10.456s atras de XIMB, em 2</div>
              <div className="font-bold">Se JONINHO parar agora saira em primeiro</div>
              <div>Se XIMB parar agora sai 03.549 atras de JONINHO, em 3</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

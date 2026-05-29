// DriverHud.tsx
import { useEffect, useState } from 'react';
import { Teams, Tires } from '@/types/game';
import { FtohButton } from '@/components/FtohButton';

import {
  colorNumberToHex,
  getTireAbbr,
  getTireColor,
} from '../../app/utils/race';

import { DriverCircle } from './DriverCircle';
import { TelemetryBar } from './TelemetryBar';
import { Driver } from '@/mocks/raceData';
import { useTranslations } from '@/i18n';

interface Props {
  driver?: Driver;
  align: 'left' | 'right';
  onPitCall?: (driver: Driver) => void;
  onPitTyrePrepare?: (driver: Driver, tyre: Tires | null) => void;
}

type PitTyreOption = 'none' | 'soft' | 'medium' | 'hard' | 'inter' | 'wet' | 'train';
type SelectablePitTyreOption = Exclude<PitTyreOption, 'none'>;

const pitTyreStyles: Record<PitTyreOption, {
  letter: string;
  backgroundColor: string;
  borderColor: string;
  color: string;
}> = {
  none: {
    letter: '-',
    backgroundColor: '#9CA3AF',
    borderColor: '#6B7280',
    color: '#000000',
  },
  soft: {
    letter: 'S',
    backgroundColor: '#EF4444',
    borderColor: '#7F1D1D',
    color: '#000000',
  },
  medium: {
    letter: 'M',
    backgroundColor: '#FACC15',
    borderColor: '#854D0E',
    color: '#000000',
  },
  hard: {
    letter: 'H',
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    color: '#000000',
  },
  inter: {
    letter: 'I',
    backgroundColor: '#22C55E',
    borderColor: '#14532D',
    color: '#000000',
  },
  wet: {
    letter: 'W',
    backgroundColor: '#3B82F6',
    borderColor: '#1E3A8A',
    color: '#000000',
  },
  train: {
    letter: 'T',
    backgroundColor: '#A855F7',
    borderColor: '#581C87',
    color: '#2E1065',
  },
};

const pitTyreOptions: SelectablePitTyreOption[] = [
  'soft',
  'medium',
  'hard',
  'inter',
  'wet',
  'train',
];

const pitTyreToGameTyre: Record<SelectablePitTyreOption, Tires> = {
  soft: Tires.SOFT,
  medium: Tires.MEDIUM,
  hard: Tires.HARD,
  inter: Tires.INTER,
  wet: Tires.WET,
  train: Tires.TRAIN,
};

const gameTyreToPitTyre: Partial<Record<Tires, PitTyreOption>> = {
  [Tires.SOFT]: 'soft',
  [Tires.MEDIUM]: 'medium',
  [Tires.HARD]: 'hard',
  [Tires.INTER]: 'inter',
  [Tires.WET]: 'wet',
  [Tires.TRAIN]: 'train',
};

function PitTyreCircle({
  tyre,
  className = '',
}: {
  tyre: PitTyreOption;
  className?: string;
}) {
  const style = pitTyreStyles[tyre];

  return (
    <span
      className={`
        inline-flex
        h-[30px]
        w-[30px]
        items-center
        justify-center
        rounded-full
        border-2
        text-[16px]
        font-black
        leading-none
        ${className}
      `}
      style={{
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.color,
      }}
    >
      {style.letter}
    </span>
  );
}

export function DriverHud({
  driver,
  align,
  onPitCall,
  onPitTyrePrepare,
}: Props) {
  const [selectedPitTyre, setSelectedPitTyre] = useState<PitTyreOption>('none');
  const [isPitTyreModalOpen, setIsPitTyreModalOpen] = useState(false);
  const { t } = useTranslations();
  const isOut = !driver || !driver.isInTheRoom || driver.team !== Teams.RUNNERS;
  const showTelemetry = !!driver && !isOut;
  const pitDisabled = !driver || isOut || driver.inPitLane;
  const tyreSelectorDisabled = !driver || isOut;
  const driverVisualOpacity = isOut
    ? 0.5
    : 1;
  const driverName = driver?.name ?? t.common.noDriver;
  const driverNumber = driver?.driverNumber ?? '??';
  const driverPosition = driver?.position ?? '-';
  const gapToLeader = driver?.gapToLeader ?? '';
  const teamColor = colorNumberToHex(driver?.scuderiaColor);

  useEffect(() => {
    setSelectedPitTyre(
      driver?.nextPitTires
        ? gameTyreToPitTyre[driver.nextPitTires] ?? 'none'
        : 'none',
    );
  }, [driver?.name, driver?.nextPitTires]);

  const info = (
    <div
      style={{
        opacity: driverVisualOpacity,
      }}
    >
      {/* NAME */}
      <div
        className={`
          text-[24px]
          font-bold
          flex
          items-center
          gap-2
          ${
            align === 'right'
              ? 'justify-end'
              : ''
          }
        `}
      >
        <span>
          {driverName}
        </span>

        {driver && (
          <span
            style={{
              color: getTireColor(
                driver.tires
              ),
            }}
          >
            {getTireAbbr(
              driver.tires
            )}
          </span>
        )}
      </div>

      {/* POSITION */}
     <div
        className={`
          text-[18px]
          ${
            align === 'right'
              ? 'text-right'
              : 'text-left'
          }
        `}
      >
       {align === 'left' ? (
          <>
            <strong>{driverPosition}º</strong>{' '}
            {gapToLeader}
          </>
        ) : (
          <>
            {gapToLeader}{' '}
            <strong>{driverPosition}º</strong>
          </>
        )}
      </div>
    </div>
  );

  const telemetryBars = driver ? [

    // CAR
    <TelemetryBar
    key="car"
    value={100 - driver.carDamage}
    icon="🏎️"
    dynamicDamage
    align={align}
    />,

    // ERS
    <TelemetryBar
      key="kers"
      value={driver.kers}
      color="#3BA7FF"
      icon="🔋"
      align={align}
    />,

    // TYRE
    <TelemetryBar
      key="tyre"
      value={
        100 - driver.wear
      }
      icon="🛞"
      warning={
        driver.tireBlowWarning
      }
      burst={
        driver.isTyreBlowed
      }
      managingTyres={
        driver.isManagingTires
      }
      dynamicTyre={true}
      align={align}
    />,
  ] : [];

  const telemetry = (
    <div className="flex items-end gap-2">
      {align === 'right'
        ? [...telemetryBars].reverse()
        : telemetryBars}
    </div>
  );

  const circle = (
    <div
      style={{
        opacity: driverVisualOpacity,
      }}
    >
      <DriverCircle
        number={
          driverNumber
        }
        color={teamColor}
      />
    </div>
  );

  const pit = (
    <>
      <div className="mt-4 flex w-full items-center justify-center gap-2">
        <FtohButton
          disabled={pitDisabled}
          onClick={() => {
            if (driver) {
              onPitCall?.(driver);
            }
          }}
          className="
            flex-1
            text-[16px]
            py-[12px]
            leading-none
          "
          style={{
            backgroundColor: pitDisabled
              ? '#5A5A5A'
              : '#FF232B',
          }}
        >
          PIT
        </FtohButton>

        <button
          type="button"
          disabled={tyreSelectorDisabled}
          aria-label={t.pitWall.selectPitTyre}
          onClick={() => setIsPitTyreModalOpen(true)}
          className={`
            rounded-full
            transition
            ${tyreSelectorDisabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110'}
          `}
        >
          <PitTyreCircle tyre={selectedPitTyre} />
        </button>
      </div>

      {isPitTyreModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            px-4
          "
          onClick={() => setIsPitTyreModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.pitWall.selectPitTyre}
            className="
              w-full
              max-w-sm
              border-4
              border-[#FF232B]
              bg-[#1E1E1E]
              p-5
              text-white
              shadow-2xl
            "
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 text-center text-2xl font-bold uppercase">
              {t.pitWall.selectPitTyre}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {pitTyreOptions.map((tyre) => (
                <button
                  key={tyre}
                  type="button"
                  onClick={() => {
                    setSelectedPitTyre(tyre);
                    if (driver) {
                      onPitTyrePrepare?.(driver, pitTyreToGameTyre[tyre]);
                    }
                    setIsPitTyreModalOpen(false);
                  }}
                  className="
                    flex
                    items-center
                    gap-3
                    border-2
                    border-white/30
                    bg-black/20
                    px-3
                    py-2
                    text-left
                    text-lg
                    font-bold
                    uppercase
                    transition
                    hover:border-white
                    hover:bg-white/10
                  "
                >
                  <PitTyreCircle tyre={tyre} />
                  <span>{t.pitWall.pitTyres[tyre]}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedPitTyre('none');
                if (driver) {
                  onPitTyrePrepare?.(driver, null);
                }
                setIsPitTyreModalOpen(false);
              }}
              className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                gap-3
                border-2
                border-white/30
                bg-black/20
                px-3
                py-2
                text-lg
                font-bold
                uppercase
                transition
                hover:border-white
                hover:bg-white/10
              "
            >
              <PitTyreCircle tyre="none" />
              <span>{t.pitWall.noPitTyre}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col">

      {info}

      <div className="flex items-end gap-6">

        {align === 'left' ? (
          <>
            <div className="flex flex-col items-center">
              {circle}
              {pit}
            </div>

            {showTelemetry && (
              <div className="mr-4">
                {telemetry}
              </div>
            )}
          </>
        ) : (
          <>
            {showTelemetry && (
              <div className="ml-4">
                {telemetry}
              </div>
            )}

            <div className="flex flex-col items-center">
              {circle}
              {pit}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

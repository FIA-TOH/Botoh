// DriverHud.tsx
import { Teams } from '@/types/game';
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
}

export function DriverHud({
  driver,
  align,
  onPitCall,
}: Props) {
  const { t } = useTranslations();
  const isOut = !driver || !driver.isInTheRoom || driver.team !== Teams.RUNNERS;
  const showTelemetry = !!driver && !isOut;
  const pitDisabled = !driver || isOut || driver.inPitLane;
  const driverVisualOpacity = isOut
    ? 0.5
    : 1;
  const driverName = driver?.name ?? t.common.noDriver;
  const driverNumber = driver?.driverNumber ?? '??';
  const driverPosition = driver?.position ?? '-';
  const gapToLeader = driver?.gapToLeader ?? '';
  const teamColor = colorNumberToHex(driver?.scuderiaColor);

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
    <FtohButton
      disabled={pitDisabled}
      onClick={() => {
        if (driver) {
          onPitCall?.(driver);
        }
      }}
      className="
        mt-4
        text-[24px]
        w-24
        py-0
      "
      style={{
        backgroundColor: pitDisabled
          ? '#5A5A5A'
          : '#FF232B',
      }}
    >
      PIT
    </FtohButton>
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


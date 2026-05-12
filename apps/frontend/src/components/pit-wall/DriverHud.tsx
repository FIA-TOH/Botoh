// DriverHud.tsx

import { FtohButton } from '@/components/FtohButton';

import {
  getTireAbbr,
  getTireColor,
} from '../../app/utils/race';

import { DriverCircle } from './DriverCircle';
import { TelemetryBar } from './TelemetryBar';

interface Props {
  driver: any;
  align: 'left' | 'right';
}

export function DriverHud({
  driver,
  align,
}: Props) {

  const info = (
    <>
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
          {driver.name}
        </span>

        <span
          style={{
            color: getTireColor(
              driver.tire
            ),
          }}
        >
          {getTireAbbr(
            driver.tire
          )}
        </span>
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
            <strong>{driver.position}º</strong>{' '}
            {driver.gapToLeader}
          </>
        ) : (
          <>
            {driver.gapToLeader}{' '}
            <strong>{driver.position}º</strong>
          </>
        )}
      </div>
    </>
  );

  const telemetryBars = [

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
      key="ers"
      value={driver.ers}
      color="#3BA7FF"
      icon="🔋"
      align={align}
    />,

    // TYRE
    <TelemetryBar
      key="tyre"
      value={
        100 - driver.tireWear
      }
      icon="🛞"
      warning={
        driver.tireWarning
      }
      burst={
        driver.tireBurst
      }
      managingTyres={
        driver.managingTires
      }
      dynamicTyre={true}
      align={align}
    />,
  ];

  const telemetry = (
    <div className="flex items-end gap-2">
      {align === 'right'
        ? [...telemetryBars].reverse()
        : telemetryBars}
    </div>
  );

  const circle = (
    <DriverCircle
      number={
        driver.driverNumber
      }
      color={driver.teamColor}
    />
  );

  const pit = (
    <FtohButton
      className="
        mt-4
        text-[24px]
        w-24
        py-0
      "
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

            <div className="mr-4">
              {telemetry}
            </div>
          </>
        ) : (
          <>
            <div className="ml-4">
              {telemetry}
            </div>

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
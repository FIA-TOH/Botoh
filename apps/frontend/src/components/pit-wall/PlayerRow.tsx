import { Driver } from '@/mocks/raceData';
import {
  colorNumberToHex,
  getTireAbbr,
  getTireColor,
} from '../../app/utils/race';

interface Props {
  driver: Driver;
  gapText: string;
  isOut?: boolean;
  isFinished?: boolean;
}

export function PlayerRow({
  driver,
  gapText,
  isOut = false,
  isFinished = false,
}: Props) {
  const textOpacity = isOut && !isFinished
    ? 0.5
    : 1;

  return (
    <div className="relative flex items-center justify-between py-px text-xs lg:py-0.5 lg:text-base">

      {/* LEFT SIDE */}
      <div
        className="flex min-w-0 items-center gap-1.5 lg:gap-2"
        style={{
          opacity: textOpacity,
        }}
      >

        {/* POSITION */}
        <div className="w-3.5 text-center font-bold lg:w-4">
          {driver.position ?? '-'}
        </div>

        {/* TEAM COLOR */}
        <div
          style={{
            width: '5px',
            alignSelf: 'stretch',
            backgroundColor: colorNumberToHex(driver.scuderiaColor),
          }}
        />

        {/* DRIVER NAME */}
        <div className="truncate font-bold">
          {driver.shortName}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="flex items-center justify-end"
        style={{ marginLeft: 'auto' }}
      >
        <div
          className="grid grid-cols-[62px_20px] items-center font-bold lg:grid-cols-[88px_24px]"
          style={{
            opacity: textOpacity,
          }}
        >

          <span className="text-center">
            {isFinished ? '🏁' : gapText}
          </span>

          {/* TIRE */}
          <span className="text-center">
            {!isOut && !isFinished && (
              <span
                style={{
                  color: getTireColor(driver.tires),
                }}
              >
                {getTireAbbr(driver.tires)}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

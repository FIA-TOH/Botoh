import { Driver } from '@/mocks/raceData';
import {
  colorNumberToHex,
  getTireAbbr,
  getTireColor,
} from '../../app/utils/race';
import { SectorBars } from './SectorBars';

interface Props {
  driver: Driver;
  gapText: string;
  isOut?: boolean;
  isFinished?: boolean;
  showSectorBars?: boolean;
}

export function PlayerRow({
  driver,
  gapText,
  isOut = false,
  isFinished = false,
  showSectorBars = false,
}: Props) {
  const textOpacity = isOut && !isFinished
    ? 0.5
    : 1;
  const sectorStatuses: Driver['currentLapSectorStatus'] =
    driver.currentLapSectorStatus ?? ['none', 'none', 'none'];

  return (
    <div className="relative py-px text-xs lg:py-0.5 lg:text-base">
      <div className="flex items-center justify-between gap-1.5">

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
        <div className="shrink-0 whitespace-nowrap font-bold">
          {driver.shortName}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="flex shrink-0 items-center justify-end"
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

      {showSectorBars && !isOut && !isFinished && (
        <div className="ml-[1.65rem] hidden pr-[84px] group-hover/pit-drivers:block lg:ml-[1.9rem] lg:pr-[116px]">
          <SectorBars
            statuses={sectorStatuses}
            barClassName="h-0.5"
          />
        </div>
      )}
    </div>
  );
}

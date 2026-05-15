import { Driver } from '@/mocks/raceData';
import {
  getTireAbbr,
  getTireColor,
} from '../../app/utils/race';
import { Teams } from '../../../../../Botoh/src/features/changeGameState/teams';

interface Props {
  driver: Driver;
  gapText: string;
}

export function PlayerRow({
  driver,
  gapText,
}: Props) {
  const textOpacity = !driver.isInTheRoom || driver.team !== Teams.RUNNERS 
    ? 0.5
    : 1;

  return (
    <div className="flex items-center justify-between py-0.5 relative">

      {/* LEFT SIDE */}
      <div
        className="flex items-center gap-2"
        style={{
          opacity: textOpacity,
        }}
      >

        {/* POSITION */}
        <div className="font-bold w-4 text-center">
          {driver.position ?? '-'}
        </div>

        {/* TEAM COLOR */}
        <div
          style={{
            width: '5px',
            alignSelf: 'stretch',
            //Todo botar logica de time e cor
            backgroundColor: '#ffffff',
          }}
        />

        {/* DRIVER NAME */}
        <div className="font-bold">
          {driver.shortName}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="flex items-center justify-end"
        style={{ marginLeft: 'auto' }}
      >
        <div
          className="font-bold grid grid-cols-[88px_24px] items-center"
          style={{
            opacity: textOpacity,
          }}
        >

          <span className="text-center">
            {gapText}
          </span>

          {/* TIRE */}
          <span className="text-center">
            {!(!driver.isInTheRoom || driver.team !== Teams.RUNNERS) && (
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

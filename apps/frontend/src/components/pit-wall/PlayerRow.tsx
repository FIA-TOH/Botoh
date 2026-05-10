import {
  getTireAbbr,
  getTireColor,
} from '../../app/utils/race';

interface Props {
  driver: any;
  gapText: string;
}

export function PlayerRow({
  driver,
  gapText,
}: Props) {
  return (
    <div className="flex items-center justify-between py-0.5 relative">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-2">

        {/* POSITION */}
        <div className="font-bold w-4 text-center">
          {driver.position}
        </div>

        {/* TEAM COLOR */}
        <div
          style={{
            width: '5px',
            alignSelf: 'stretch',
            backgroundColor: driver.teamColor,
          }}
        />

        {/* DRIVER NAME */}
        <div className="font-bold">
          {driver.shortName}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="flex items-center"
        style={{ marginLeft: 'auto' }}
      >
        <div className="font-bold flex items-center gap-2">

          {gapText}

          {/* TIRE */}
          <span
            className="ml-2"
            style={{
              color: getTireColor(driver.tire),
            }}
          >
            {getTireAbbr(driver.tire)}
          </span>
        </div>
      </div>
    </div>
  );
}
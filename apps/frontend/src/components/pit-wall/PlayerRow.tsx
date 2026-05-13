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
  const textOpacity = driver.isOut
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
            {!driver.isOut && (
              <span
                style={{
                  color: getTireColor(driver.tire),
                }}
              >
                {getTireAbbr(driver.tire)}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

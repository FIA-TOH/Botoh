import { Driver } from '@/mocks/raceData';
import { getTireAbbr, getTireColor } from '../../app/utils/race';

interface Props {
  driver: Driver;
  align: 'left' | 'right';
}

export function DriverDisplay({ driver, align }: Props) {
  return (
    <div
      style={{
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: align,
      }}
    >
      {driver?.name || 'Piloto'}

      <span
        style={{
          marginLeft: 8,
          fontWeight: 'normal',
          color: getTireColor(driver?.tires),
        }}
      >
        {getTireAbbr(driver?.tires)}
      </span>
    </div>
  );
}
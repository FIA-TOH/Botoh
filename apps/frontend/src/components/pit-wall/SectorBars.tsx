import { Driver } from '@/mocks/raceData';

const SECTOR_STATUS_COLORS = {
  none: 'rgba(255,255,255,0.16)',
  yellow: '#FFC919',
  green: '#2DBE20',
  purple: '#B967FF',
};

interface Props {
  statuses?: Driver['currentLapSectorStatus'];
  barClassName?: string;
  className?: string;
}

export function SectorBars({
  statuses = ['none', 'none', 'none'],
  barClassName = 'h-1',
  className = '',
}: Props) {
  return (
    <div
      className={`flex min-w-[48px] flex-1 items-center gap-0.5 ${className}`}
    >
      {statuses.map((status, index) => (
        <span
          key={index}
          className={`${barClassName} flex-1`}
          style={{
            backgroundColor:
              SECTOR_STATUS_COLORS[status ?? 'none'],
          }}
        />
      ))}
    </div>
  );
}

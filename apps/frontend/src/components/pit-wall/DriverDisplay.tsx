import { Driver } from '@/mocks/raceData';
import { getTireAbbr, getTireColor } from '../../app/utils/race';
import { useTranslations } from '@/i18n';

interface Props {
  driver: Driver;
  align: 'left' | 'right';
}

export function DriverDisplay({ driver, align }: Props) {
  const { t } = useTranslations();
  return (
    <div
      style={{
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: align,
      }}
    >
      {driver?.name || t.common.defaultDriver}

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
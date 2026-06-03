import { isLightColor } from '@/app/utils/race';

interface Props {
  number: number | string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export function DriverCircle({
  number,
  color,
  size = 'lg',
}: Props) {
  const numberColor = isLightColor(color)
    ? '#000000'
    : '#FFFFFF';

  const sizeClass = {
    sm: 'h-[clamp(72px,18vw,96px)] w-[clamp(72px,18vw,96px)] text-[clamp(30px,8vw,36px)]',
    md: 'h-[clamp(84px,20vw,112px)] w-[clamp(84px,20vw,112px)] text-[clamp(36px,9vw,48px)]',
    lg: 'h-[clamp(92px,10vw,140px)] w-[clamp(92px,10vw,140px)] text-[clamp(38px,5vw,64px)]',
  }[size];

  return (
    <div
      className={`
        ${sizeClass}
        rounded-full
        border-[8px]
        border-black
        flex
        items-center
        justify-center
        font-bold
      `}
      style={{
        backgroundColor: color,
        color: numberColor,
      }}
    >
      {number}
    </div>
  );
}

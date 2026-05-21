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
    sm: 'h-24 w-24 text-4xl',
    md: 'h-28 w-28 text-5xl',
    lg: 'h-[10vw] w-[10vw] max-h-[140px] max-w-[140px] text-[min(64px,5vw)]',
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

import { isLightColor } from '@/app/utils/race';

interface Props {
  number: number | string;
  color: string;
}

export function DriverCircle({
  number,
  color,
}: Props) {
  const numberColor = isLightColor(color)
    ? '#000000'
    : '#FFFFFF';

  return (
    <div
      className="
        w-[10vw]
        h-[10vw]
        max-w-[140px]
        max-h-[140px]
        rounded-full
        border-[8px]
        border-black
        flex
        items-center
        justify-center
        text-[4vw]
        text-[min(64px,5vw)]
        font-bold
      "
      style={{
        backgroundColor: color,
        color: numberColor,
      }}
    >
      {number}
    </div>
  );
}

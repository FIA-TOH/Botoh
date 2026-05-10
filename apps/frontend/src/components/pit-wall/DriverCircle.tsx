interface Props {
  number: number;
  color: string;
}

export function DriverCircle({
  number,
  color,
}: Props) {
  return (
    <div
      className="
        w-[140px]
        h-[140px]
        rounded-full
        border-[8px]
        border-black
        flex
        items-center
        justify-center
        text-[64px]
        font-bold
      "
      style={{
        backgroundColor: color,
      }}
    >
      {number}
    </div>
  );
}
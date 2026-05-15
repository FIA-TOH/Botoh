import { Tires } from "../../../../../Botoh/src/features/tires&pits/tires";

export function lapTimeToMs(timeStr: string): number {
  const [minutesPart, secondsPart] = timeStr.split(':');
  const [seconds, milliseconds] = secondsPart.split('.');

  return (
    parseInt(minutesPart) * 60000 +
    parseInt(seconds) * 1000 +
    parseInt(milliseconds)
  );
}

export function formatGap(gapMs: number) {
  const seconds = Math.floor(gapMs / 1000);
  const ms = gapMs % 1000;

  return `+${seconds}.${ms.toString().padStart(3, '0')}`;
}

export function getTireColor(tires: Tires) {
  switch (tires) {
    case Tires.SOFT:
      return '#FF0000';

    case Tires.MEDIUM:
      return '#FFC919';

    case Tires.HARD:
      return '#FFFFFF';

    case Tires.INTER:
      return '#15FF00';

    case Tires.WET:
      return '#19A7FF';

    case Tires.FLAT:
      return '#000000';

    case Tires.TRAIN:
      return '#9900ff';

    default:
      return '#6E6E6E';
  }
}

export function getTireAbbr(tires: Tires) {
  switch (tires) {
    case Tires.SOFT:
      return 'S';

    case Tires.MEDIUM:
      return 'M';

    case Tires.HARD:
      return 'H';

    case Tires.INTER:
      return 'I';

    case Tires.WET:
      return 'W';

    case Tires.FLAT:
      return 'B';

    case Tires.TRAIN:
      return 'T';

    default:
      return 'B';
  }
}
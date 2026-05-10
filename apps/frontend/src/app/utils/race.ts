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

export function getTireColor(tire: string) {
  switch (tire) {
    case 'SOFT':
      return '#FF0000';

    case 'MEDIUM':
      return '#FFC919';

    case 'HARD':
      return '#FFFFFF';

    case 'INTERMEDIATE':
      return '#15FF00';

    case 'WET':
      return '#19A7FF';

    default:
      return '#6E6E6E';
  }
}

export function getTireAbbr(tire: string) {
  switch (tire) {
    case 'SOFT':
      return 'S';

    case 'MEDIUM':
      return 'M';

    case 'HARD':
      return 'H';

    case 'INTERMEDIATE':
      return 'I';

    case 'WET':
      return 'W';

    default:
      return 'B';
  }
}
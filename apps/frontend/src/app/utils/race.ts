import { Tires } from '@/types/game';

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
  const safeGapMs = Math.max(0, gapMs);
  const seconds = Math.floor(safeGapMs / 1000);
  const ms = safeGapMs % 1000;

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

export function colorNumberToHex(color: number | null | undefined): string {
  if (typeof color !== 'number' || !Number.isFinite(color)) {
    return '#FFFFFF';
  }

  return `#${Math.max(0, color)
    .toString(16)
    .padStart(6, '0')
    .slice(-6)
    .toUpperCase()}`;
}

export function isLightColor(color: string): boolean {
  const normalizedColor = color.replace('#', '');

  if (!/^[0-9a-fA-F]{6}$/.test(normalizedColor)) {
    return false;
  }

  const red = parseInt(normalizedColor.slice(0, 2), 16);
  const green = parseInt(normalizedColor.slice(2, 4), 16);
  const blue = parseInt(normalizedColor.slice(4, 6), 16);
  const luminance =
    (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return luminance >= 0.72;
}

export function isDarkColor(color: string): boolean {
  const normalizedColor = color.replace('#', '');

  if (!/^[0-9a-fA-F]{6}$/.test(normalizedColor)) {
    return false;
  }

  const red = parseInt(normalizedColor.slice(0, 2), 16);
  const green = parseInt(normalizedColor.slice(2, 4), 16);
  const blue = parseInt(normalizedColor.slice(4, 6), 16);
  const luminance =
    (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  return luminance <= 0.18;
}

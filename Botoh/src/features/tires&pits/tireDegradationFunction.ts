import { TireDurability, Tires } from "./tires";

export function applyDegradationPercent(base: number, percent?: number) {
  if (base === Infinity) return Infinity;
  if (!percent || percent === 0) return base;
  const multiplier = 1 - percent / 100;
  const adjusted = base * multiplier;
  return Math.max(1, adjusted);
}

export function applyTrackTireDegradation(
  base: TireDurability,
  trackPercent?: number
): TireDurability {
  if (trackPercent === undefined || trackPercent === 0) return { ...base };
  const result: Partial<TireDurability> = {};
  (Object.keys(base) as Tires[]).forEach((t) => {
    const v = base[t];
    result[t] =
      v === Infinity
        ? Infinity
        : applyDegradationPercent(v as number, trackPercent);
  });
  return result as TireDurability;
}

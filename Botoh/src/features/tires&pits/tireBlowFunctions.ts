export function getBlowoutChance(remaining: number): number {
  if (remaining <= 0) return 1;
  if (remaining <= 5) return 0.000621; // 100% per minute
  if (remaining <= 10) return 0.000285; // 80%
  if (remaining <= 20) return 0.000141; // 60%
  if (remaining <= 30) return 0.000099; // 40%
  if (remaining <= 40) return 0.000029; // 30%
  if (remaining <= 50) return 0.000014; // 10%
  if (remaining <= 60) return 0.00000278; // 5%
  if (remaining <= 70) return 0.000000139; // 0.05%
  if (remaining <= 80) return 0.0000000278; // 0.01%
  return 0;
}

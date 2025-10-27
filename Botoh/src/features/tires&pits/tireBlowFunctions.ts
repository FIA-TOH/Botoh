export function getBlowoutChance(remaining: number): number {
  //NOW THE CHANCE TO BLOWN IS 50% LESS, SO IN REMAINING 10 IT ISNT 80%, BUT 40%
  const reductionFactor = 50;

  const multiplier = 1 - reductionFactor / 100;

  let baseChance = 0;

  if (remaining <= 0) baseChance = 1;
  else if (remaining <= 5) baseChance = 0.000621; // 100% per minute
  else if (remaining <= 10) baseChance = 0.000285; // 80%
  else if (remaining <= 20) baseChance = 0.000141; // 60%
  else if (remaining <= 30) baseChance = 0.000099; // 40%
  else if (remaining <= 40) baseChance = 0.000029; // 30%
  else if (remaining <= 50) baseChance = 0.000014; // 10%
  else if (remaining <= 60) baseChance = 0.00000278; // 5%
  else if (remaining <= 70) baseChance = 0.000000139; // 0.05%
  else if (remaining <= 80) baseChance = 0.0000000278; // 0.01%

  return baseChance * multiplier;
}

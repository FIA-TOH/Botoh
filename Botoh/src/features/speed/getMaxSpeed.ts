export const BASE_MAX_SPEED = 93;

export function maxSpeedFromGrip(grip: number) {
  const coef = 1905.74;
  const intercept = -1812.81;

  return coef * grip + intercept;
}

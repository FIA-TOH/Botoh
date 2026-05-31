import { GearSpec, TransmissionConfig } from "./types";

/** Reference top speed used to convert `maxSpeedFactor` (0..1) into a real speed. */
export const BASE_TOP_SPEED = 94;

/**
 * Linear virtual RPM:
 *   rpm = rpmMin + (speed / maxSpeedOfGear) * (rpmMax - rpmMin)
 * Clamped to [rpmMin, redline].
 */
export function computeVirtualRpm(
  speed: number,
  gearSpec: GearSpec,
  config: TransmissionConfig,
): number {
  const [rpmMin, rpmMax] = gearSpec.rpmRange;
  const maxSpeedOfGear = gearSpec.maxSpeedFactor * BASE_TOP_SPEED;
  if (maxSpeedOfGear <= 0) return rpmMin;
  const ratio = speed / maxSpeedOfGear;
  const raw = rpmMin + ratio * (rpmMax - rpmMin);
  if (raw < rpmMin) return rpmMin;
  if (raw > config.redline + 500) return config.redline + 500;
  return raw;
}

/**
 * Soft limiter – returns `active=true` once RPM enters the redline zone so the
 * HUD/avatar can react. Does NOT cut torque: speed pinning is done entirely
 * by per-gear `speedCapDamping` so the car holds a constant top speed with
 * zero jerk and no speed reduction.
 */
export function applyRpmLimiter(
  rpm: number,
  config: TransmissionConfig,
): { multiplier: number; active: boolean } {
  const softZone = 600;
  const taperStart = config.redline - softZone;
  return { multiplier: 1, active: rpm > taperStart };
}

/**
 * Engine-brake magnitude when throttle is released.
 * Stronger in low gears (short ratios), softer in high gears.
 * Returns a positive force to be applied opposite the velocity vector.
 */
export function computeEngineBrake(
  gear: number,
  throttleReleased: boolean,
  speed: number,
  config: TransmissionConfig,
): number {
  if (!throttleReleased) return 0;
  if (speed <= 0) return 0;
  // 1st gear → full base; higher gears decay roughly with 1/(gear+1).
  const gearFactor = 2 / (gear + 1);
  return config.engineBrakeBase * gearFactor;
}

/**
 * Per-gear top-speed enforcement – torque MULTIPLIER that fades 1→0 as the
 * car nears the gear's speed cap.
 *
 *   speed ≤ 95% of cap → 1.0 (full torque)
 *   speed = 100% of cap → 0.0
 */
export function computeSpeedCapTorqueScale(
  speed: number,
  gearSpec: GearSpec,
): number {
  const cap = gearSpec.maxSpeedFactor * BASE_TOP_SPEED;
  if (cap <= 0) return 1;
  const ratio = speed / cap;
  if (ratio <= 0.95) return 1;
  if (ratio >= 1.00) return 0;
  // Linear ramp 1→0 over the top 5% of the gear's speed band.
  return (1 - ratio) / 0.05;
}

/**
 * Overrev + underrev brake – the single function responsible for making gears
 * feel distinctly different from each other.
 *
 * OVERREV  (speed > cap):
 *   Force proportional to how far above the gear’s top speed the car is.
 *   Being in 1st at 94 u/s is brutal; in 4th at 94 u/s = nothing.
 *
 * UNDERREV  (speed < minSpeed, i.e. previous gear’s cap):
 *   Lug drag: the car resists acceleration as if the engine is bogged down.
 *   Trying to pull away from a hairpin in 4th feels like driving through mud.
 *   Gear 1 has no underrev minimum (minSpeed = 0).
 */
export function computeGearBrake(
  speed: number,
  gearSpec: GearSpec,
  minSpeed: number,
): number {
  const cap = gearSpec.maxSpeedFactor * BASE_TOP_SPEED;

  if (speed > cap) {
    // Overrev: strong drag above cap
    const overshoot = (speed - cap) / cap;
    return Math.min(0.70, overshoot * 0.50);
  }

  if (minSpeed > 0 && speed < minSpeed) {
    // Underrev: lug drag below previous-gear's cap (engine bogging)
    const undershoot = (minSpeed - speed) / minSpeed;
    return Math.min(0.50, undershoot * 0.35);
  }

  return 0;
}

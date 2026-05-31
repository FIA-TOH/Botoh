import { GearboxType, GearSpec, TransmissionConfig } from "./types";

/**
 * Default transmission tuning shared by every league scuderia that doesn't
 * override it. All magic numbers live here so balancing is one-file.
 *
 * Speed reference: the bot's BASE_MAX_SPEED is ~94 (see speed/getMaxSpeed.ts).
 * `maxSpeedFactor` is a fraction of that effective top speed.
 */

const IDLE_RPM = 1000;
const REDLINE_RPM = 8000;
const SHIFT_RPM = 7200; // target rpm where you should be upshifting

/**
 * Default 4-gear sequential setup.
 *
 * Design intent:
 *   – Gear 1: tight hairpins / very slow corners (heavy torque, early cap).
 *   – Gear 2: medium corners.
 *   – Gear 3: fast corners / mid-speed stretches.
 *   – Gear 4: overdrive – straights / top speed, low torque.
 *
 *   Speed caps are evenly spaced so each gear covers a meaningful speed band.
 *   Torque spread 1st/4th ≈ 4× so staying in 4th out of a hairpin is painful.
 */
const DEFAULT_GEARS: GearSpec[] = [
  { gear: 1, torqueMultiplier: 4.00, maxSpeedFactor: 0.22, rpmRange: [IDLE_RPM, REDLINE_RPM] },
  { gear: 2, torqueMultiplier: 2.20, maxSpeedFactor: 0.48, rpmRange: [IDLE_RPM, REDLINE_RPM] },
  { gear: 3, torqueMultiplier: 1.15, maxSpeedFactor: 0.74, rpmRange: [IDLE_RPM, REDLINE_RPM] },
  { gear: 4, torqueMultiplier: 0.45, maxSpeedFactor: 1.00, rpmRange: [IDLE_RPM, REDLINE_RPM] },
];

export const DEFAULT_TRANSMISSION: TransmissionConfig = {
  type: GearboxType.MANUAL_SEQUENTIAL,
  gears: DEFAULT_GEARS,
  finalDrive: 1.00,        // 1.0 = natural; transmission torques applied as-is
  drivetrainLoss: 0.92,
  shiftTimeMs: 220,
  idleRpm: IDLE_RPM,
  redline: REDLINE_RPM,
  rpmCutFactor: 0.35,
  engineBrakeBase: 0.012,
  kersTorqueMultiplier: 1.30,
  autoUpshiftRpm: SHIFT_RPM,
  autoDownshiftRpm: 3200,
  speedCapDampingBoost: 0, // legacy; the speed cap is now a torque falloff
  shiftSpeedLoss: 1.0,
  shiftTorqueFactor: 0,    // 0 = full neutral glide during shift (no jerk)
  shiftHintRpm: 6400,
  downshiftSpeedTolerance: 1.02,
};

/** Cooldown between shifts (ms) – also acts as the inter-shift lockout. */
export const SHIFT_COOLDOWN_MS = 120;

/** Magnitude under which the accelerator gravity is treated as "released". */
export const THROTTLE_RELEASED_EPSILON = 1e-4;

/** Min ticks the limiter must be hot before we warn the player in chat. */
export const LIMITER_WARN_INTERVAL_MS = 3000;

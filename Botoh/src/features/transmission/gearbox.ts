import { PlayerInfo } from "../changePlayerState/playerList";
import { THROTTLE_RELEASED_EPSILON } from "./defaults";
import {
  BASE_TOP_SPEED,
  applyRpmLimiter,
  computeEngineBrake,
  computeGearBrake,
  computeSpeedCapTorqueScale,
  computeVirtualRpm,
} from "./engine";
import { tryAutoShift, updateShiftState } from "./shifter";
import { TransmissionOutput } from "./types";
import { ensureTransmissionState } from "./state";

/**
 * Single per-tick entry point for the transmission subsystem.
 *
 * Returns the four numbers the speed pipeline needs:
 *   - torqueMultiplier: multiply onto (xgravity, ygravity)
 *   - dampingBoost:     add to disc.damping to enforce per-gear speed cap
 *   - brakeForce:       magnitude to apply opposite the velocity vector
 *   - rpm, limiterActive, gearChangedTo: telemetry/HUD
 *
 * Returns null when the player is not a league driver – speed pipeline then
 * runs exactly as before (no regression for public players).
 */
export function updateTransmissionForPlayer(
  playerInfo: PlayerInfo,
  currentSpeed: number,
  appliedGravityMagnitude: number,
  kersActive: boolean,
  now: number,
): TransmissionOutput | null {
  const tx = ensureTransmissionState(playerInfo);
  if (!tx) return null;
  const { state, config } = tx;

  // 1. Throttle detection.
  state.throttleReleased = appliedGravityMagnitude < THROTTLE_RELEASED_EPSILON;

  // 2. Finalise any in-flight shift (capture direction *before* reset).
  const directionAtShiftEnd = state.pendingShiftDirection;
  const gearChangedTo = updateShiftState(state, config, now);

  // 3. Current gear spec + virtual RPM.
  const gearSpec = config.gears[state.currentGear - 1];
  let rpm = computeVirtualRpm(currentSpeed, gearSpec, config);

  // 4. Automatic gearboxes evaluate the RPM and may queue a shift here.
  tryAutoShift(state, rpm, currentSpeed, config, now);

  // 5. Build the torque multiplier from gear + final drive + drivetrain loss.
  let torque = gearSpec.torqueMultiplier * config.finalDrive * config.drivetrainLoss;

  // 6. While shifting: zero ALL engine forces so the car coasts neutrally.
  //    - torque = 0    → no push (shiftTorqueFactor defaults to 0)
  //    - speed cap     → suppressed (no braking spike at gear boundary)
  //    - engine brake  → suppressed (throttle is cut in a real shift too)
  //    Result: the car holds its current speed without any jerk.
  if (state.isShifting) {
    torque *= config.shiftTorqueFactor; // 0 by default → neutral glide
    state.shiftLossApplied = true;
  }

  // 7. KERS boost: multiplies torque, but redline cut applies AFTER it.
  if (kersActive) torque *= config.kersTorqueMultiplier;

  // 8. Per-gear top-speed cap: the ONLY mechanism that limits speed.
  //    Implemented as a smooth torque falloff between 90% and 100% of the
  //    gear's cap. NO damping, NO brake – acceleration simply fades to 0,
  //    so the car asymptotes onto its top speed with no jerk and no
  //    deceleration. Suppressed mid-shift so the player coasts freely.
  if (!state.isShifting) {
    torque *= computeSpeedCapTorqueScale(currentSpeed, gearSpec);
  }

  // 9. RPM limiter – HUD/telemetry flag only. Speed is already capped above.
  const limiter = applyRpmLimiter(rpm, config);
  state.limiterActive = limiter.active;
  const extraDamping = 0; // never used – see step 8.

  // 10. Engine braking (throttle released) + overrev/underrev brake.
  //     Suppressed mid-shift (neutral coast).
  //     Overrev: drag when speed > this gear’s cap.
  //     Underrev: lug drag when speed < previous gear’s cap (engine bogging).
  const minSpeedForGear = state.currentGear > 1
    ? config.gears[state.currentGear - 2].maxSpeedFactor * BASE_TOP_SPEED
    : 0;
  const engineBrake = state.isShifting ? 0 : computeEngineBrake(
    state.currentGear,
    state.throttleReleased,
    currentSpeed,
    config,
  );
  const gearBrake = state.isShifting ? 0 : computeGearBrake(currentSpeed, gearSpec, minSpeedForGear);
  const brakeForce = engineBrake + gearBrake;

  // 11. Hooks (optional integrations: temp, wear, telemetry).
  if (config.hooks?.onRpmTick) config.hooks.onRpmTick(-1, rpm, state.currentGear);
  if (limiter.active && config.hooks?.onLimiter) config.hooks.onLimiter(-1, rpm);
  if (gearChangedTo !== null && config.hooks?.onShift) {
    config.hooks.onShift(-1, state.currentGear - directionAtShiftEnd, gearChangedTo);
  }

  state.rpm = rpm;

  // 12. Early upshift hint: fires a bit before the optimal shift point so the
  //     player can react without delay. Suppressed in the top gear and during
  //     an in-flight shift.
  const isTopGear = state.currentGear >= config.gears.length;
  const hintThreshold =
    config.shiftHintRpm ??
    (config.autoUpshiftRpm !== undefined
      ? config.autoUpshiftRpm - 600
      : config.redline - 1200);
  const shouldHintShift =
    !isTopGear && !state.isShifting && rpm >= hintThreshold;

  return {
    torqueMultiplier: torque,
    dampingBoost: extraDamping,
    brakeForce,
    rpm,
    limiterActive: limiter.active,
    gearChangedTo,
    shiftDirection: gearChangedTo !== null ? directionAtShiftEnd : 0,
    shouldHintShift,
  };
}

import { SHIFT_COOLDOWN_MS } from "./defaults";
import { BASE_TOP_SPEED } from "./engine";
import {
  GearboxType,
  TransmissionConfig,
  TransmissionState,
} from "./types";

/**
 * Result of an attempted gear change.
 * - "started": shift accepted, isShifting now true.
 * - "rejected_cooldown" / "rejected_range" / "rejected_overspeed": no-op.
 */
export type ShiftResult =
  | "started"
  | "rejected_cooldown"
  | "rejected_range"
  | "rejected_overspeed"
  | "rejected_shifting";

/**
 * Attempt to start a gear change.
 * `direction` is +1 for upshift, -1 for downshift.
 * `now` is the current room time in ms (from `room.getScores().time * 1000`
 * or `Date.now()`; only relative deltas matter).
 */
export function tryShift(
  state: TransmissionState,
  direction: 1 | -1,
  currentSpeed: number,
  config: TransmissionConfig,
  now: number,
): ShiftResult {
  if (state.isShifting) return "rejected_shifting";
  if (now - state.lastShiftTime < SHIFT_COOLDOWN_MS) return "rejected_cooldown";

  const targetGear = state.currentGear + direction;
  if (targetGear < 1 || targetGear > config.gears.length) {
    return "rejected_range";
  }

  // Downshift overspeed protection: refuse if current speed would exceed
  // the target gear's cap by more than `downshiftSpeedTolerance`.
  if (direction === -1) {
    const targetSpec = config.gears[targetGear - 1];
    const targetCap = targetSpec.maxSpeedFactor * BASE_TOP_SPEED;
    if (currentSpeed > targetCap * config.downshiftSpeedTolerance) {
      return "rejected_overspeed";
    }
  }

  state.isShifting = true;
  state.shiftEndTime = now + config.shiftTimeMs;
  state.pendingShiftDirection = direction;
  state.pendingGear = targetGear;
  state.shiftLossApplied = false;
  return "started";
}

/**
 * Called every tick. If the shift window has elapsed, finalises the gear
 * change and returns the new gear (or null if nothing changed this tick).
 */
export function updateShiftState(
  state: TransmissionState,
  config: TransmissionConfig,
  now: number,
): number | null {
  if (!state.isShifting) return null;
  if (now < state.shiftEndTime) return null;

  const from = state.currentGear;
  state.currentGear = state.pendingGear;
  state.isShifting = false;
  state.lastShiftTime = now;
  state.pendingShiftDirection = 0;
  state.shiftLossApplied = false;
  return state.currentGear !== from ? state.currentGear : null;
}

/**
 * Automatic-mode helper. Decides whether to fire an upshift/downshift based
 * on current RPM. Only meaningful for AUTOMATIC / CVT_FAKE; manual modes
 * should skip the call.
 */
export function tryAutoShift(
  state: TransmissionState,
  rpm: number,
  currentSpeed: number,
  config: TransmissionConfig,
  now: number,
): ShiftResult | null {
  if (state.mode !== GearboxType.AUTOMATIC && state.mode !== GearboxType.CVT_FAKE) {
    return null;
  }
  if (state.isShifting) return null;

  if (config.autoUpshiftRpm !== undefined && rpm >= config.autoUpshiftRpm) {
    return tryShift(state, 1, currentSpeed, config, now);
  }
  if (config.autoDownshiftRpm !== undefined && rpm <= config.autoDownshiftRpm) {
    return tryShift(state, -1, currentSpeed, config, now);
  }
  return null;
}

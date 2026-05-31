import { COLORS, FONTS, sendMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { LIMITER_WARN_INTERVAL_MS } from "./defaults";
import { TransmissionConfig, TransmissionState } from "./types";

/**
 * Private chat feedback for transmission events.
 *
 * Per the spec we DO NOT touch the player's avatar; everything goes through
 * private chat announcements so the avatar slot remains free for tires/DRS/etc.
 */

/**
 * Called whenever a gear change just completed.
 * direction +1 = upshift, -1 = downshift.
 */
export function notifyGearChanged(
  room: RoomObject,
  playerId: number,
  newGear: number,
  rpm: number,
  direction: number,
): void {
  const arrow = direction > 0 ? "▲" : "▼";
  const colour = direction > 0 ? COLORS.LIGHT_GREEN : COLORS.CYAN;
  sendMessage(
    room,
    MESSAGES.GEAR_CHANGED(arrow, String(newGear), String(Math.round(rpm))),
    playerId,
    colour,
    FONTS.SMALL_BOLD,
  );
}

/**
 * Throttled rev-limiter warning. Will fire at most once per
 * LIMITER_WARN_INTERVAL_MS while the limiter is hot.
 */
export function notifyLimiterIfDue(
  room: RoomObject,
  playerId: number,
  state: TransmissionState,
  now: number,
): void {
  if (!state.limiterActive) return;
  if (now - state.lastLimiterWarnTime < LIMITER_WARN_INTERVAL_MS) return;
  state.lastLimiterWarnTime = now;
  sendMessage(
    room,
    MESSAGES.RPM_LIMITER_HIT(),
    playerId,
    COLORS.RED,
    FONTS.SMALL_BOLD,
  );
}

/**
 * Builds a one-shot diagnostic line for the `/gear` command.
 * No room state mutation – just a string sender.
 */
export function reportGearInfo(
  room: RoomObject,
  playerId: number,
  state: TransmissionState,
  config: TransmissionConfig,
): void {
  sendMessage(
    room,
    MESSAGES.GEAR_INFO(
      String(state.currentGear),
      String(config.gears.length),
      String(Math.round(state.rpm)),
      String(config.redline),
      state.mode,
    ),
    playerId,
    COLORS.WHITE,
    FONTS.SMALL,
  );
}

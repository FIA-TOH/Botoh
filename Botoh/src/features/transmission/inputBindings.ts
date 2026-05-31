import { playerList } from "../changePlayerState/playerList";
import { COLORS, FONTS, sendMessage } from "../chat/chat";
import { onExternalKeyDown } from "../playerInput/playerInputServer";
import { vectorSpeed } from "../utils";
import { tryShift, ShiftResult } from "./shifter";
import { ensureTransmissionState } from "./state";
import { MESSAGES } from "../chat/messages";

const KEY_UPSHIFT = "k";
const KEY_DOWNSHIFT = "j";

/**
 * Registers J / K key bindings for sequential gear changes.
 *
 * - K = upshift
 * - J = downshift
 *
 * Only league players (with a transmission state) react; everyone else
 * gets a silent no-op so the binding doesn't interfere with public usage.
 */
export function registerTransmissionInput(room: RoomObject): void {
  onExternalKeyDown((playerId, key) => {
    const lower = key.toLowerCase();
    if (lower !== KEY_UPSHIFT && lower !== KEY_DOWNSHIFT) return;

    const playerInfo = playerList[playerId];
    if (!playerInfo) return;
    const tx = ensureTransmissionState(playerInfo);
    if (!tx) return;

    const disc = room.getPlayerDiscProperties(playerId);
    const currentSpeed = disc ? vectorSpeed(disc.xspeed, disc.yspeed) : 0;
    const now = nowMs(room);

    const direction = lower === KEY_UPSHIFT ? 1 : -1;
    const result = tryShift(tx.state, direction as 1 | -1, currentSpeed, tx.config, now);
    reportShiftAttempt(room, playerId, direction, result, tx.state.currentGear);
  });
}

function reportShiftAttempt(
  room: RoomObject,
  playerId: number,
  direction: number,
  result: ShiftResult,
  currentGear: number,
): void {
  // Successful shifts are reported when they *complete* (handleSpeed pipeline);
  // here we only surface user-facing rejections so the driver knows why.
  if (result === "started" || result === "rejected_cooldown" || result === "rejected_shifting") {
    return;
  }
  if (result === "rejected_range") {
    sendMessage(
      room,
      MESSAGES.GEAR_REJECTED_RANGE(String(currentGear)),
      playerId,
      COLORS.ORANGE,
      FONTS.SMALL_BOLD,
    );
    return;
  }
  if (result === "rejected_overspeed") {
    sendMessage(
      room,
      MESSAGES.GEAR_REJECTED_OVERSPEED(),
      playerId,
      COLORS.ORANGE,
      FONTS.SMALL_BOLD,
    );
    return;
  }
}

/** Room time in ms. Uses scoreboard time if available, else Date.now(). */
export function nowMs(room: RoomObject): number {
  const t = room.getScores()?.time;
  if (typeof t === "number" && t > 0) return t * 1000;
  return Date.now();
}

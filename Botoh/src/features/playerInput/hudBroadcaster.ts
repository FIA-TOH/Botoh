import { playerList } from "../changePlayerState/playerList";
import { DEFAULT_TRANSMISSION } from "../transmission/defaults";
import { isPlayerConnected, sendToPlayer } from "./playerInputServer";

/** JSON shape sent over WS as `{ type: "hud", ... }`. */
export interface HudPayload {
  type: "hud";
  /** Current gear (0 = neutral, 1..N). */
  gear: number;
  /** Virtual RPM and the bounds the userscript uses to render the bar. */
  rpm: number;
  rpmMin: number;
  rpmRedline: number;
  /** True while the rev limiter is hitting. */
  limiterActive: boolean;
  /** ERS / KERS battery, 0..100. */
  ers: number;
  /** Tire compound id (matches the Tires enum keys). */
  tire: string;
  /** Tire wear 0..100 (100 = fully worn). */
  wear: number;
}

/**
 * Build and push the HUD payload for one player. No-op when the player has no
 * authenticated userscript socket.
 */
export function pushHudForPlayer(playerId: number): void {
  if (!isPlayerConnected(playerId)) return;

  const info = playerList[playerId];
  if (!info) return;

  const tx = info.transmission;
  const payload: HudPayload = {
    type: "hud",
    gear: tx?.currentGear ?? 0,
    rpm: tx?.rpm ?? DEFAULT_TRANSMISSION.idleRpm,
    rpmMin: DEFAULT_TRANSMISSION.idleRpm,
    rpmRedline: DEFAULT_TRANSMISSION.redline,
    limiterActive: tx?.limiterActive ?? false,
    ers: info.kers ?? 0,
    tire: String(info.tires ?? ""),
    wear: info.wear ?? 0,
  };

  sendToPlayer(playerId, payload);
}

import { PlayerInfo } from "../changePlayerState/playerList";
import { leagueScuderia } from "../scuderias/scuderias";
import { DEFAULT_TRANSMISSION } from "./defaults";
import { TransmissionConfig, TransmissionState } from "./types";

/**
 * Returns the active transmission config for a player.
 * League player → scuderia override if any, else DEFAULT_TRANSMISSION.
 * Non-league player → null (system inactive).
 */
export function getTransmissionConfig(
  playerInfo: PlayerInfo,
): TransmissionConfig | null {
  if (!playerInfo.leagueScuderia) return null;
  const scuderia = leagueScuderia[playerInfo.leagueScuderia];
  if (!scuderia) return null;
  return scuderia.transmission ?? DEFAULT_TRANSMISSION;
}

/**
 * Builds a fresh state struct. Called the first tick a league player needs one
 * and whenever the player should be re-initialised (grid start, pit out, etc.).
 */
export function createTransmissionState(
  config: TransmissionConfig,
): TransmissionState {
  return {
    currentGear: 1,
    rpm: config.idleRpm,
    isShifting: false,
    shiftEndTime: 0,
    lastShiftTime: 0,
    throttleReleased: true,
    limiterActive: false,
    lastLimiterWarnTime: 0,
    mode: config.type,
    pendingShiftDirection: 0,
    pendingGear: 1,
    shiftLossApplied: false,
    shiftHintActive: false,
  };
}

/**
 * Ensures `playerInfo.transmission` exists and matches the current config.
 * Returns the state or null if the player isn't a league driver.
 */
export function ensureTransmissionState(
  playerInfo: PlayerInfo,
): { state: TransmissionState; config: TransmissionConfig } | null {
  const config = getTransmissionConfig(playerInfo);
  if (!config) return null;
  if (!playerInfo.transmission) {
    playerInfo.transmission = createTransmissionState(config);
  }
  return { state: playerInfo.transmission, config };
}

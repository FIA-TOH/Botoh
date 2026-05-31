import { isXKeyPressed } from "./dampingValues";
import { checkXKeyMultiplePress, initializeXKeyState } from "./xKeyTracker";
import { playerList } from "../changePlayerState/playerList";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { isManageTyresEnabled } from "../commands/adminThings/handleManageTyresCommand";
import { ensureTransmissionState } from "../transmission/state";
import { tryShift } from "../transmission/shifter";
import { GearboxType } from "../transmission/types";
import { vectorSpeed } from "../utils";

export function handleManageTyreXKeyDetection(
  playerId: number,
  damping: number,
  currentTime: number,
  room: RoomObject,
  requiredPresses: number = 2
): boolean {
  if (!isManageTyresEnabled()) {
    return false;
  }
  
  const isPressed = isXKeyPressed(damping);
  
  if (checkXKeyMultiplePress(playerId, isPressed, currentTime, requiredPresses)) {
    const player = playerList[playerId];
    if (!player) return false;
    
    if (player.isTyreBlowed && player.isManagingTyres) {
      return false;
    }
    
    if (!player.isManagingTyres) {
      player.isManagingTyres = true;
      handleAvatar(Situacions.ManagingTyresOn, { id: playerId } as PlayerObject, room);
    } else {
      player.isManagingTyres = false;
      handleAvatar(Situacions.ManagingTyresOff, { id: playerId } as PlayerObject, room);
    }
    
    return true;
  }
  
  return false;
}

/**
 * TEMPORARY – X once = upshift, X twice (< 1.5 s) = downshift.
 * Only active for league drivers in MANUAL_SEQUENTIAL mode.
 * Must be called BEFORE handleManageTyreXKeyDetection each tick so it
 * gets first access to the shared xKeyState.
 */
export function handleTransmissionXKeyDetection(
  playerId: number,
  disc: DiscPropertiesObject,
  currentTime: number,
): void {
  const info = playerList[playerId];
  if (!info) return;
  const txInfo = ensureTransmissionState(info);
  if (!txInfo) return;
  if (txInfo.state.mode !== GearboxType.MANUAL_SEQUENTIAL) return;

  const isPressed = isXKeyPressed(disc.damping ?? 0);
  const speed = vectorSpeed(disc.xspeed ?? 0, disc.yspeed ?? 0);
  const nowMs = currentTime * 1000;

  // Double tap detected → downshift
  if (checkXKeyMultiplePress(playerId, isPressed, currentTime, 2)) {
    tryShift(txInfo.state, -1, speed, txInfo.config, nowMs);
    return;
  }

  // Single tap: 1 press in buffer, older than 0.3 s (no 2nd press came)
  const xState = info.xKeyState;
  if (xState && xState.pressTimes.length === 1) {
    const pressAge = currentTime - xState.pressTimes[0];
    if (pressAge >= 0.3) {
      initializeXKeyState(playerId);
      tryShift(txInfo.state, 1, speed, txInfo.config, nowMs);
    }
  }
}


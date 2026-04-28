import { isXKeyPressed } from "./dampingValues";
import { checkXKeyMultiplePress } from "./xKeyTracker";
import { playerList } from "../changePlayerState/playerList";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { isManageTyresEnabled } from "../commands/adminThings/handleManageTyresCommand";

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


import { playerList } from "../changePlayerState/playerList";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";

let wecModeEnabled = false;

export function isWECModeEnabled(): boolean {
  return wecModeEnabled;
}

export function setWECModeEnabled(enabled: boolean, room: RoomObject): void {
  wecModeEnabled = enabled;
  if (enabled) return;

  const clearedPlayers = new Set<number>();
  Object.entries(playerList).forEach(([id, player]) => {
    if (!player || player.category == null) return;
    player.category = null;
    clearedPlayers.add(Number(id));
  });
  room.getPlayerList().forEach((player) => {
    if (clearedPlayers.has(player.id)) {
      handleAvatar(Situacions.Category, player, room);
    }
  });
}

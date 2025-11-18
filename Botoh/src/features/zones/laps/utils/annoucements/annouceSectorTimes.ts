import { PlayerInfo } from "../../../../changePlayerState/playerList";

export function announceSectorTimes(
  room: RoomObject,
  playerId: number,
  playerData: PlayerInfo
) {
  room.sendAnnouncement(
    `Sector 1: ${playerData.sectorTime[0]} | Sector 2: ${playerData.sectorTime[1]} | Sector 3: ${playerData.sectorTime[2]}`,
    playerId,
    0xff8f00
  );
}

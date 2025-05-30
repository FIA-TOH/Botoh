import { getRunningPlayers } from "../utils";

export function updatePlayerCollision(
  room: RoomObject,
  playersAndDiscs: any[],
  collisionGroup: number
) {
  const players = getRunningPlayers(playersAndDiscs);
  players.forEach((pad) => {
    room.setPlayerDiscProperties(pad.p.id, { cGroup: collisionGroup });
  });
}

import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../utils";

export let ghostMode = false;

function updatePlayerCollision(
  room: RoomObject,
  playersAndDiscs: any[],
  collisionGroup: number
) {
  const players = getRunningPlayers(playersAndDiscs);
  players.forEach((pad) => {
    room.setPlayerDiscProperties(pad.p.id, { cGroup: collisionGroup });
  });
}

export function setGhostMode(room: RoomObject, enable: boolean) {
  ghostMode = enable;

  const message = ghostMode ? "Ghost mode enabled" : "Ghost mode disabled";
  const collisionGroup = ghostMode
    ? room.CollisionFlags.c0 | room.CollisionFlags.redKO
    : room.CollisionFlags.red | room.CollisionFlags.redKO;

  room.sendAnnouncement(message);

  if (room.getScores() != null) {
    const playersAndDiscs = getPlayerAndDiscs(room);
    updatePlayerCollision(room, playersAndDiscs, collisionGroup);
  }
}

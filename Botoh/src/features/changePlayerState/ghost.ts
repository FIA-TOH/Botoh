import { log } from "../discord/logger";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import { updatePlayerCollision } from "./updatePlayerCollision";

export let ghostMode = false;

export function setGhostMode(
  room: RoomObject,
  enable: boolean,
  playerId?: number
) {
  ghostMode = enable;
  const message = ghostMode ? "Ghost mode enabled" : "Ghost mode disabled";
  if (playerId) {
    log(message);
    room.sendAnnouncement(message);
  }

  const collisionGroup = ghostMode
    ? room.CollisionFlags.c0 | room.CollisionFlags.redKO
    : room.CollisionFlags.red | room.CollisionFlags.redKO;

  const playersAndDiscs = getPlayerAndDiscs(room);
  updatePlayerCollision(room, playersAndDiscs, collisionGroup);
}

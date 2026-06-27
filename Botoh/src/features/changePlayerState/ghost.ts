import { COLORS } from "../chat/chat";
import { log } from "../discord/logger";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import {
  applyPlayersCollision,
  setGhostCollisionMode,
} from "./playerCollision";

export let ghostMode = false;

export function setGhostMode(
  room: RoomObject,
  enable: boolean,
  playerId?: number
) {
  ghostMode = enable;
  setGhostCollisionMode(enable);
  const message = ghostMode ? "Ghost mode enabled" : "Ghost mode disabled";
  if (playerId) {
    log(message);
    room.sendAnnouncement(message, playerId, COLORS.GREEN);
  }

  const playersAndDiscs = getPlayerAndDiscs(room);
  applyPlayersCollision(room, playersAndDiscs);
}

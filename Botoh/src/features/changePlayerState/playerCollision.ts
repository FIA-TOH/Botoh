import { playerList } from "./playerList";
import { getRunningPlayers } from "../utils";

let ghostModeEnabled = false;

export function setGhostCollisionMode(enable: boolean) {
  ghostModeEnabled = enable;
}

export function isGhostCollisionModeEnabled() {
  return ghostModeEnabled;
}

export function getGhostCollisionGroup(room: RoomObject) {
  return room.CollisionFlags.c0 | room.CollisionFlags.redKO;
}

export function getDefaultCollisionGroup(room: RoomObject) {
  return room.CollisionFlags.red | room.CollisionFlags.redKO;
}

export function getPlayerCollisionGroup(room: RoomObject, playerId: number) {
  return ghostModeEnabled || playerList[playerId]?.inPitlane
    ? getGhostCollisionGroup(room)
    : getDefaultCollisionGroup(room);
}

export function applyPlayerCollision(room: RoomObject, playerId: number) {
  room.setPlayerDiscProperties(playerId, {
    cGroup: getPlayerCollisionGroup(room, playerId),
  });
}

export function applyPlayersCollision(
  room: RoomObject,
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
) {
  const players = getRunningPlayers(playersAndDiscs);
  players.forEach((pad) => {
    applyPlayerCollision(room, pad.p.id);
  });
}

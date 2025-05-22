import { CIRCUITS } from "./zones/maps";
import { Direction, HitboxBounds } from "../circuits/Circuit";
import { Teams } from "./changeGameState/teams";

export function vectorSpeed(xSpeed: number, ySpeed: number): number {
  return Math.floor(10 * Math.hypot(xSpeed, ySpeed));
}

export function getRunningPlayers(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[]
): { p: PlayerObject; disc: DiscPropertiesObject }[] {
  return playersAndDiscs.filter(
    (pad) => pad.disc !== null && pad.p.team === Teams.RUNNERS
  );
}

export function getAdmins(room: RoomObject): PlayerObject[] {
  return room.getPlayerList().filter((p) => p.admin);
}

export function validCircuitIndex(id: number): boolean {
  return id !== null && !isNaN(id) && id >= 0 && id <= CIRCUITS.length;
}

export function inHitbox(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  hitbox: HitboxBounds
): boolean {
  const { x, y } = player.disc;
  return (
    hitbox.minX <= x && x <= hitbox.maxX && hitbox.minY <= y && y <= hitbox.maxY
  );
}

export function kickPlayer(playerID: number, reason: string, room: RoomObject) {
  room.kickPlayer(playerID, reason, false);
}

export function banPlayer(playerID: number, reason: string, room: RoomObject) {
  room.kickPlayer(playerID, reason, true);
}

export const CHECK_IF_TROLLING = true;

export function checkIfTrolling(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  direction: Direction
): boolean {
  const properties = pad.disc;
  if (properties === null) return false;
  switch (direction) {
    case Direction.LEFT:
      return properties.xspeed > 0;
    case Direction.RIGHT:
      return properties.xspeed < 0;
    case Direction.UP:
      return properties.yspeed > 0;
    case Direction.DOWN:
      return properties.yspeed < 0;
  }
}

export function decodeIPFromConn(conn: string): string {
  return decodeURIComponent(conn.replace(/(..)/g, "%$1"));
}

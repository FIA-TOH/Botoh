import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";

export interface DirectionResult {
  direction: string;
  emoji: string;
}

export function getDirectionFromVelocity(x: number, y: number): DirectionResult {
  // Math.sqrt mantido - valor exato da velocidade usado para determinar se está parado
  const speed = Math.sqrt(x * x + y * y);
  if (speed < 0.005) {
    return { direction: "Stopped", emoji: "⏹️" };
  }

  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  if (angle >= -22.5 && angle < 22.5) {
    return { direction: "East", emoji: "➡️" };
  }
  if (angle >= 22.5 && angle < 67.5) {
    return { direction: "Southeast", emoji: "↘️" };
  }
  if (angle >= 67.5 && angle < 112.5) {
    return { direction: "South", emoji: "⬇️" };
  }
  if (angle >= 112.5 && angle < 157.5) {
    return { direction: "Southwest", emoji: "↙️" };
  }
  if (angle >= 157.5 || angle < -157.5) {
    return { direction: "West", emoji: "⬅️" };
  }
  if (angle >= -157.5 && angle < -112.5) {
    return { direction: "Northwest", emoji: "↖️" };
  }
  if (angle >= -112.5 && angle < -67.5) {
    return { direction: "North", emoji: "⬆️" };
  }
  return { direction: "Northeast", emoji: "↗️" };
}

export function updatePlayerDirection(player: PlayerObject, disc: DiscPropertiesObject, room: RoomObject): void {
  const playerInfo = playerList[player.id];
  if (!playerInfo || !disc) return;

  const { direction, emoji } = getDirectionFromVelocity(disc.xspeed, disc.yspeed);
  playerInfo.currentDirection = direction;
  playerInfo.currentDirectionEmoji = emoji;
  playerList[player.id] = playerInfo;

  handleAvatar(Situacions.Direction, player, room, emoji);
}
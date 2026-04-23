import { playerList, PlayerInfo } from "../changePlayerState/playerList";

export interface DirectionInfo {
  direction: string;
  emoji: string;
}

export function getDirectionFromVelocity(x: number, y: number): DirectionInfo {
  // Math.sqrt mantido - valor exato da velocidade usado para determinar se está parado
  const speed = Math.sqrt(x * x + y * y);
  if (speed < 0.005) {
    return { direction: "Parado", emoji: "⏹️" };
  }

  const angle = (Math.atan2(y, x) * 180) / Math.PI;
  if (angle >= -22.5 && angle < 22.5) {
    return { direction: "Leste", emoji: "➡️" };
  }
  if (angle >= 22.5 && angle < 67.5) {
    return { direction: "Sudeste", emoji: "↘️" };
  }
  if (angle >= 67.5 && angle < 112.5) {
    return { direction: "Sul", emoji: "⬇️" };
  }
  if (angle >= 112.5 && angle < 157.5) {
    return { direction: "Sudoeste", emoji: "↙️" };
  }
  if (angle >= 157.5 || angle < -157.5) {
    return { direction: "Oeste", emoji: "⬅️" };
  }
  if (angle >= -157.5 && angle < -112.5) {
    return { direction: "Noroeste", emoji: "↖️" };
  }
  if (angle >= -112.5 && angle < -67.5) {
    return { direction: "Norte", emoji: "⬆️" };
  }
  return { direction: "Nordeste", emoji: "↗️" };
}

export function updatePlayerDirection(player: PlayerObject, disc: DiscPropertiesObject, room: RoomObject) {
  const playerInfo = playerList[player.id];
  if (!playerInfo || !disc) return;

  const { direction, emoji } = getDirectionFromVelocity(disc.xspeed, disc.yspeed);
  playerInfo.currentDirection = direction;
  playerInfo.currentDirectionEmoji = emoji;
}

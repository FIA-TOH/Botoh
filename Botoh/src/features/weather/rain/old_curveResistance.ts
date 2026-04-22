/* 
import { PlayerInfo } from "../changePlayerState/playerList";

export function calculateCurveResistance(
  playerInfo: PlayerInfo,
  disc: DiscPropertiesObject,
): { x: number; y: number } {
  // TEMPORÁRIO: Desabilitado para teste
  return { x: 0, y: 0 };

  /* Código original comentado para reativação futura
  const x = disc.xspeed;
  const y = disc.yspeed;
  const speed = Math.sqrt(x * x + y * y);
  const MIN_SPEED_FOR_RESISTANCE = 0.15; // Velocidade mínima para aplicar resistência
  const MIN_CURVE_ANGLE = 0.15; // ~8.5°

  if (speed < MIN_SPEED_FOR_RESISTANCE) {
    return { x: 0, y: 0 };
  }

  const unitX = x / speed;
  const unitY = y / speed;

  if (!playerInfo.lastDir) {
    playerInfo.lastDir = { x: unitX, y: unitY };
    return { x: 0, y: 0 };
  }

  const dot =
    playerInfo.lastDir.x * unitX + playerInfo.lastDir.y * unitY;
  const clampedDot = Math.min(1, Math.max(-1, dot));
  const angle = Math.acos(clampedDot);

  if (angle <= MIN_CURVE_ANGLE) {
    playerInfo.lastDir = { x: unitX, y: unitY };
    playerInfo.curveResistanceTicks = 0;
    return { x: 0, y: 0 };
  }

  const MAX_CURVE_RESISTANCE_TICKS = 6;

  if (!playerInfo.curveResistanceTicks || playerInfo.curveResistanceTicks <= 0) {
    playerInfo.curveResistanceTicks = MAX_CURVE_RESISTANCE_TICKS;
  }

  const resistanceStrength = Math.min(0.03, (1 - clampedDot) * 0.04 + 0.005);
  const errorX = playerInfo.lastDir.x - unitX;
  const errorY = playerInfo.lastDir.y - unitY;
  const decay = playerInfo.curveResistanceTicks / MAX_CURVE_RESISTANCE_TICKS;

  const extraX = errorX * resistanceStrength * speed * decay;
  const extraY = errorY * resistanceStrength * speed * decay;

  playerInfo.curveResistanceTicks = Math.max(0, playerInfo.curveResistanceTicks - 1);
  if (playerInfo.curveResistanceTicks === 0) {
    playerInfo.lastDir = { x: unitX, y: unitY };
  }

  return {
    x: extraX,
    y: extraY,
  };
  }
  */

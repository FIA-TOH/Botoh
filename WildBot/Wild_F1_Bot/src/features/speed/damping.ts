// ---------------------------
// 🔹 CONFIGURAÇÕES DO SLIP
// ---------------------------
const SLIP_ANGLE_THRESHOLD = 0.15; // ~8.5 graus
const TICKS_PER_SECOND = 5;
const SLIP_DURATION_SECONDS = 0.2;
const SLIP_MAX_TICKS = Math.ceil(SLIP_DURATION_SECONDS * TICKS_PER_SECOND);
const SLIP_MAX_FORCE = 0.05; // força máxima aplicada no início do slip
const SLIP_MIN_NORM = 0.001; // mínima velocidade para calcular direção

type Direction = { x: number; y: number };

interface PlayerInfo {
  lastDir?: Direction;
  slipTicks?: number;
  slipDir?: Direction;
  // outros campos que você já tem...
}

/**
 * Aplica damping lateral simulando slip quando o jogador entra em curva.
 * Retorna o vetor de gravidade extra que deve ser somado ao controle normal.
 */ export function applyLateralSlip(
  p: PlayerObject,
  playerInfo: PlayerInfo,
  unitX: number,
  unitY: number,
  norm: number
): { extraGravityX: number; extraGravityY: number } {
  let extraGravityX = 0;
  let extraGravityY = 0;

  if (!playerInfo.lastDir) {
    playerInfo.lastDir = { x: unitX, y: unitY };
  }

  if (norm > SLIP_MIN_NORM && playerInfo.lastDir) {
    const dot = playerInfo.lastDir.x * unitX + playerInfo.lastDir.y * unitY;
    const angle = Math.acos(Math.min(1, Math.max(-1, dot)));

    if (
      (!playerInfo.slipTicks || playerInfo.slipTicks <= 0) &&
      angle > SLIP_ANGLE_THRESHOLD
    ) {
      playerInfo.slipTicks = SLIP_MAX_TICKS;

      // Calcula a direção perpendicular ao movimento para o slip
      // perp = (-y, x) ou (y, -x) dependendo do lado que quer puxar
      const perpX = -playerInfo.lastDir.y;
      const perpY = playerInfo.lastDir.x;

      // Normaliza a direção perpendicular
      const perpNorm = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
      playerInfo.slipDir = { x: perpX / perpNorm, y: perpY / perpNorm };

      console.log(
        `[SLIP] Player ${p.id} iniciou curva: angle=${angle.toFixed(
          3
        )} rad (~${((angle * 180) / Math.PI).toFixed(1)}°), slipTicks=${
          playerInfo.slipTicks
        }`
      );
    }

    playerInfo.lastDir = { x: unitX, y: unitY };
  }

  if (playerInfo.slipTicks && playerInfo.slipTicks > 0 && playerInfo.slipDir) {
    const decay = playerInfo.slipTicks / SLIP_MAX_TICKS;
    const slipFactor = SLIP_MAX_FORCE * decay;

    extraGravityX = playerInfo.slipDir.x * slipFactor;
    extraGravityY = playerInfo.slipDir.y * slipFactor;

    console.log(
      `[SLIP] Player ${p.id} tick=${
        playerInfo.slipTicks
      }, força=(${extraGravityX.toFixed(3)}, ${extraGravityY.toFixed(3)})`
    );

    playerInfo.slipTicks = Math.max(0, playerInfo.slipTicks - 1);

    if (playerInfo.slipTicks === 0) {
      console.log(`[SLIP] Player ${p.id} slip acabou.`);
    }
  }

  return { extraGravityX, extraGravityY };
}

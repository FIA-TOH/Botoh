import { controlPlayerSpeed } from "./handleSpeed";
import { getRunningPlayers } from "./utils";
// Índice compartilhado para o jogador a ser processado
let nextPlayerIndex = 0;

export function distributeSpeed(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  const totalPlayers = players.length;
  if (totalPlayers === 0) return;

  // Calcula quantos jogadores processar por tick
  const ticksPerSecond = 60;
  const maxTicksPerPlayer = 3;
  const processPerTick = Math.min(
    Math.ceil((totalPlayers * maxTicksPerPlayer) / ticksPerSecond),
    2
  );

  const playersToProcess: { p: PlayerObject; disc: DiscPropertiesObject }[] =
    [];

  for (let i = 0; i < processPerTick; i++) {
    const player = players[nextPlayerIndex];

    if (player) {
      // Encontra o objeto completo de playerAndDisc
      const playerAndDisc = playersAndDiscs.find(
        (pd) => pd.p.id === player.p.id
      );
      if (playerAndDisc) {
        playersToProcess.push(playerAndDisc);
      }
    }

    // Atualiza o índice para o próximo jogador
    nextPlayerIndex = (nextPlayerIndex + 1) % totalPlayers;
  }

  // Chama a função de controle de velocidade apenas para os jogadores selecionados
  controlPlayerSpeed(playersToProcess, room);
}

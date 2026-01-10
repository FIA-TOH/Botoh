import { PitsInfo, playerList } from "../../../changePlayerState/playerList";

export const positionList: {
  id: number;
  name: string;
  pitsInfo: PitsInfo;
  pits: number;
  time: number;
  totalTime: number;
  lap: number;
  active: boolean;
  currentSector: number;
  team: string | null;
}[] = [];

export function updatePositionList(
  players: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject,
) {
  // Cria um conjunto com os nomes dos jogadores atualmente ativos na sala
  const activePlayers = new Set(players.map((player) => player.p.name));

  // Atualiza ou insere os dados de cada jogador na lista de posições
  players.forEach((player) => {
    const { p } = player;
    const playerData = playerList[p.id];

    const playerPositionIndex = positionList.findIndex(
      (entry) => entry.name === p.name,
    );

    // Monta o objeto com as informações atuais do jogador
    const playerInfo = {
      id: p.id,
      name: p.name,
      pitsInfo: playerData.pits,
      pits: playerData.pits.pitsNumber,
      time: playerData.bestTime,
      totalTime: playerData.totalTime,
      lap: playerData.currentLap,
      active: true,
      currentSector: playerData.currentSector,
      team: playerData.leagueScuderia,
    };

    // Atualiza ou adiciona o jogador na lista de posições
    if (playerPositionIndex !== -1) {
      positionList[playerPositionIndex] = playerInfo;
    } else {
      positionList.push(playerInfo);
    }
  });

  // Marca como inativos os jogadores que não estão mais presentes na sala
  positionList.forEach((entry) => {
    if (!activePlayers.has(entry.name)) {
      entry.active = false;
    }
  });

  // Ordena a lista de posições com base nas voltas, setor atual e tempo total
  positionList.sort((a, b) => {
    if (a.lap === b.lap) {
      if (a.currentSector === b.currentSector) {
        return a.totalTime - b.totalTime; // quem tiver menos tempo, está na frente
      }
      return b.currentSector - a.currentSector; // quem estiver mais à frente no setor
    }
    return b.lap - a.lap; // quem completou mais voltas está na frente
  });
}

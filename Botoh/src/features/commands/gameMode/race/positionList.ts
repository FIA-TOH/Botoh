import { PitsInfo, playerList } from "../../../changePlayerState/playerList";
import { checkSandbagLeader } from "../battleRoyale.ts/handleSandbag";

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
  const activePlayers = new Set(players.map((player) => player.p.name));

  players.forEach((player) => {
    const { p } = player;
    const playerData = playerList[p.id];

    const playerPositionIndex = positionList.findIndex(
      (entry) => entry.name === p.name,
    );

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

    if (playerPositionIndex !== -1) {
      positionList[playerPositionIndex] = playerInfo;
    } else {
      positionList.push(playerInfo);
    }
  });

  positionList.forEach((entry) => {
    if (!activePlayers.has(entry.name)) {
      entry.active = false;
    }
  });

  positionList.sort((a, b) => {
    if (a.lap === b.lap) {
      if (a.currentSector === b.currentSector) {
        return a.totalTime - b.totalTime;
      }
      return b.currentSector - a.currentSector;
    }
    return b.lap - a.lap;
  });

  checkSandbagLeader(room);
}

import {
  PitsInfo,
  playerList,
  updatePlayerListRaceGaps,
  updatePlayerListPosition,
} from "../../../changePlayerState/playerList";
import { checkSandbagLeader } from "../battleRoyale.ts/handleSandbag";

type RacePosition = {
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
};

export const positionList: RacePosition[] = [];

function formatGap(reference: RacePosition, player: RacePosition) {
  if (reference.id === player.id) return "0.000";

  const lapGap = reference.lap - player.lap;
  if (lapGap > 0) {
    return `+${lapGap} Lap${lapGap === 1 ? "" : "s"}`;
  }

  const timeGap = Math.abs(player.totalTime - reference.totalTime);
  if (!Number.isFinite(timeGap)) return null;

  return `+${timeGap.toFixed(3)}`;
}

export function syncRacePositions() {
  const leader = positionList[0];

  positionList.forEach((entry, index) => {
    updatePlayerListPosition(entry.id, index + 1);

    const playerAhead = positionList[index - 1];
    updatePlayerListRaceGaps(
      entry.id,
      leader ? formatGap(leader, entry) : null,
      playerAhead ? formatGap(playerAhead, entry) : null,
    );
  });
}

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

  syncRacePositions();

  checkSandbagLeader(room);
}

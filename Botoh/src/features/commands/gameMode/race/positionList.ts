import {
  PitsInfo,
  playerList,
  updatePlayerListRaceGaps,
  updatePlayerListPosition,
} from "../../../changePlayerState/playerList";
import { LeagueScuderiaId } from "../../../scuderias/scuderias";
import { checkSandbagLeader } from "../battleRoyale.ts/handleSandbag";
import {
  generalGameMode,
  GeneralGameMode,
} from "../../../changeGameState/changeGameModes";

export type RacePosition = {
  id: number;
  name: string;
  pitsInfo: PitsInfo;
  pits: number;
  time: number;
  totalTime: number;
  lap: number;
  active: boolean;
  currentSector: number;
  team: LeagueScuderiaId | null;
};

export const positionList: RacePosition[] = [];

function formatGapAtSharedCheckpoint(
  reference: RacePosition,
  player: RacePosition,
) {
  if (reference.id === player.id) return "0.000";

  // Only update a displayed gap after the car behind reaches the same
  // checkpoint/sector as the reference. Until then, keep the last measured gap.
  if (reference.currentSector !== player.currentSector) {
    return null;
  }

  const lapGap = reference.lap - player.lap;
  if (lapGap > 0) {
    return `+${lapGap} Lap${lapGap === 1 ? "" : "s"}`;
  }

  if (lapGap !== 0) {
    return null;
  }

  const timeGap = player.totalTime - reference.totalTime;
  if (!Number.isFinite(timeGap) || timeGap < 0) return null;

  return `+${timeGap.toFixed(3)}`;
}

function normalizeStaleGap(gap: string | null | undefined) {
  return gap === "0.000" ? null : gap ?? null;
}

export function syncRacePositions(triggerPlayerId?: number) {
  const leader = positionList[0];

  positionList.forEach((entry, index) => {
    updatePlayerListPosition(entry.id, index + 1);

    const playerAhead = positionList[index - 1];
    const currentPlayerState = playerList[entry.id];
    const isTriggeredPlayer =
      triggerPlayerId === undefined || entry.id === triggerPlayerId;

    if (!isTriggeredPlayer) {
      updatePlayerListRaceGaps(
        entry.id,
        index === 0 ? "0.000" : normalizeStaleGap(currentPlayerState?.gapToLeader),
        index === 0 ? null : normalizeStaleGap(currentPlayerState?.gapToNext),
      );
      return;
    }

    const measuredGapToLeader = leader
      ? formatGapAtSharedCheckpoint(leader, entry)
      : null;
    const measuredGapToNext = playerAhead
      ? formatGapAtSharedCheckpoint(playerAhead, entry)
      : null;

    updatePlayerListRaceGaps(
      entry.id,
      measuredGapToLeader ?? currentPlayerState?.gapToLeader ?? null,
      measuredGapToNext ?? currentPlayerState?.gapToNext ?? null,
    );
  });
}

export function updatePositionList(
  players: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject,
  triggerPlayerId?: number,
) {
  // Race ranking is authoritative only in race-like modes.
  // Qualifying/training rankings are based on best lap time and must never be
  // overwritten by live track order from sector crossings.
  if (generalGameMode !== GeneralGameMode.GENERAL_RACE) {
    return;
  }

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

  syncRacePositions(triggerPlayerId);

  checkSandbagLeader(room);
}

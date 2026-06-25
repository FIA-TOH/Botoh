import {
  LapSectorStatus,
  playerList,
} from "../../changePlayerState/playerList";
import { COLORS } from "../../chat/chat";
import { serialize } from "../../utils";

type BestSectors = {
  1: number | null;
  2: number | null;
  3: number | null;
};

let sessionBestSectors: BestSectors = {
  1: null,
  2: null,
  3: null,
};

const pendingSectorStatusResetByPlayerId = new Map<number, NodeJS.Timeout>();

export function resetSessionBestSectors() {
  sessionBestSectors = {
    1: null,
    2: null,
    3: null,
  };

  pendingSectorStatusResetByPlayerId.forEach((timeout) => clearTimeout(timeout));
  pendingSectorStatusResetByPlayerId.clear();

  Object.values(playerList).forEach((playerData) => {
    if (!playerData) return;

    playerData.currentLapSectorStatus = ["none", "none", "none"];
  });
}

export function scheduleCurrentLapSectorStatusReset(
  playerId: number,
  currentLap: number,
) {
  const previousTimeout = pendingSectorStatusResetByPlayerId.get(playerId);
  if (previousTimeout) {
    clearTimeout(previousTimeout);
  }

  const timeout = setTimeout(() => {
    const playerData = playerList[playerId];

    if (
      playerData &&
      playerData.currentLap === currentLap &&
      playerData.currentSector === 1
    ) {
      playerData.currentLapSectorStatus = ["none", "none", "none"];
    }

    pendingSectorStatusResetByPlayerId.delete(playerId);
  }, 5000);

  pendingSectorStatusResetByPlayerId.set(playerId, timeout);
}

function updateCurrentLapSectorStatus(
  sectorIndex: 1 | 2 | 3,
  playerId: number,
  status: LapSectorStatus,
) {
  const statusIndex = sectorIndex - 1;
  const pendingReset = pendingSectorStatusResetByPlayerId.get(playerId);

  if (pendingReset) {
    clearTimeout(pendingReset);
    pendingSectorStatusResetByPlayerId.delete(playerId);
  }

  if (status === "purple") {
    Object.entries(playerList).forEach(([currentPlayerId, playerData]) => {
      if (!playerData) return;

      if (
        Number(currentPlayerId) !== playerId &&
        playerData.currentLapSectorStatus?.[statusIndex] === "purple"
      ) {
        playerData.currentLapSectorStatus[statusIndex] = "green";
      }
    });
  }

  const playerData = playerList[playerId];
  if (!playerData) return;

  if (!playerData.currentLapSectorStatus) {
    playerData.currentLapSectorStatus = ["none", "none", "none"];
  }

  playerData.currentLapSectorStatus[statusIndex] = status;
}

export function evaluateSector(
  sectorIndex: 1 | 2 | 3,
  sectorTime: number,
  playerId: number,
) {
  const playerData = playerList[playerId];
  if (!playerData) {
    return {
      color: COLORS.WHITE,
      text: "",
    };
  }

  if (!playerData.currentLapSectorStatus) {
    playerData.currentLapSectorStatus = ["none", "none", "none"];
  }

  const playerBest = playerData.bestSectorTimes[sectorIndex - 1];
  const sessionBest = sessionBestSectors[sectorIndex];
  const isCurrentLapValid =
    playerData.lastLapValid !== false && !playerData.cuttedTrackOnThisLap;

  let color = COLORS.GREEN;
  let messageExtra = "";
  let emojiStart = "🟢";
  let emojiEnd = "🟢";

  if (!isCurrentLapValid) {
    updateCurrentLapSectorStatus(sectorIndex, playerId, "yellow");

    return {
      color: COLORS.RED,
      text: "",
    };
  }

  // -------------------------
  // 1️⃣ Check Session Record
  // -------------------------
  if (sessionBest === null || sectorTime < sessionBest) {
    sessionBestSectors[sectorIndex] = sectorTime;
    playerData.bestSectorTimes[sectorIndex - 1] = sectorTime;
    updateCurrentLapSectorStatus(sectorIndex, playerId, "purple");

    color = COLORS.PINK;
    emojiStart = "🌸";
    emojiEnd = "🌸";

    return {
      color,
      text: `${emojiStart} Sector ${sectorIndex}: ${sectorTime}s ${emojiEnd}`,
    };
  }

  // -------------------------
  // 2️⃣ Check Personal Best
  // -------------------------
  if (playerBest === null || sectorTime < playerBest) {
    const deltaRecord = serialize(sectorTime - sessionBest);

    playerData.bestSectorTimes[sectorIndex - 1] = sectorTime;
    updateCurrentLapSectorStatus(sectorIndex, playerId, "green");

    color = COLORS.GREEN;
    emojiStart = "💚";
    emojiEnd = "💚";

    messageExtra = `(gap to best: ${deltaRecord}s)`;

    return {
      color,
      text: `${emojiStart} Sector ${sectorIndex}: ${sectorTime}s ${messageExtra} ${emojiEnd}`,
    };
  }

  // -------------------------
  // 3️⃣ Worse than PB
  // -------------------------
  const deltaPB = serialize(sectorTime - playerBest);
  const deltaRecord = serialize(sectorTime - sessionBest);
  updateCurrentLapSectorStatus(sectorIndex, playerId, "yellow");

  if (deltaPB <= 0.2) {
    color = COLORS.DARK_YELLOW;
    emojiStart = "🟩";
    emojiEnd = "🟩";
  } else if (deltaPB <= 0.6) {
    color = COLORS.ORANGE;
    emojiStart = "🟠";
    emojiEnd = "🟠";
  } else {
    color = COLORS.RED;
    emojiStart = "🔴";
    emojiEnd = "🔴";
  }

  messageExtra = `(+${deltaPB}s) (gap to best: +${deltaRecord}s)`;

  return {
    color,
    text: `${emojiStart} Sector ${sectorIndex}: ${sectorTime}s ${messageExtra} ${emojiEnd}`,
  };
}

import { playerList } from "../../changePlayerState/playerList";
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

export function resetSessionBestSectors() {
  sessionBestSectors = {
    1: null,
    2: null,
    3: null,
  };
}

export function evaluateSector(
  sectorIndex: 1 | 2 | 3,
  sectorTime: number,
  playerId: number,
) {
  const playerData = playerList[playerId];
  const playerBest = playerData.bestSectorTimes[sectorIndex - 1];
  const sessionBest = sessionBestSectors[sectorIndex];

  let color = COLORS.GREEN;
  let messageExtra = "";
  let emojiStart = "🟢";
  let emojiEnd = "🟢";

  // -------------------------
  // 1️⃣ Check Session Record
  // -------------------------
  if (sessionBest === null || sectorTime < sessionBest) {
    sessionBestSectors[sectorIndex] = sectorTime;
    playerData.bestSectorTimes[sectorIndex - 1] = sectorTime;

    color = COLORS.MAGENTA;
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

type BestLapInfo = {
  playerName: string;
  lapTime: number;
  lapNumber: number;
} | null;

let bestLap: BestLapInfo = null;

export function resetBestLap() {
  bestLap = null;
}

export function getBestLap(): BestLapInfo {
  return bestLap;
}

export function trySetBestLap(
  playerName: string,
  lapTime: number,
  lapNumber: number,
  validLap: boolean
): boolean {
  if (validLap === false) {
    return false;
  }
  if (!bestLap || lapTime < bestLap.lapTime) {
    bestLap = { playerName, lapTime, lapNumber };
    return true;
  }
  return false;
}

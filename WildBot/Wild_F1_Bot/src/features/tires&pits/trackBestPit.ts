type BestPitInfo = {
  playerName: string;
  pitTime: number;
  pitNumber: number;
} | null;

let bestPit: BestPitInfo = null;

export function resetBestPit() {
  bestPit = null;
}

export function getBestPit(): BestPitInfo {
  return bestPit;
}

export function trySetBestPit(
  playerName: string,
  pitTime: number,
  pitNumber: number
): boolean {
  if (!bestPit || pitTime < bestPit.pitTime) {
    bestPit = { playerName, pitTime, pitNumber };
    return true;
  }
  return false;
}

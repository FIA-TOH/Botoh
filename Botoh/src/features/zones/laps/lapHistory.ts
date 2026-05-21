export interface PaceStats {
  fastestLap: number | null;
  lastFiveAverage: number | null;
  lastLap: number | null;
  lastLapComparedToAverage: number | null;
  completedLaps: number;
}

const lapHistory = new Map<number, number[]>();

export function recordLap(playerId: number, lapTime: number, isValid: boolean) {
  if (!isValid || !Number.isFinite(lapTime) || lapTime <= 0) return;

  const laps = lapHistory.get(playerId) ?? [];
  laps.push(lapTime);
  lapHistory.set(playerId, laps);
}

export function getLapHistory(playerId: number): number[] {
  return lapHistory.get(playerId) ?? [];
}

export function getPaceStats(playerId: number): PaceStats {
  const laps = getLapHistory(playerId);
  const lastFive = laps.slice(-5);
  const lastFiveAverage =
    lastFive.length > 0
      ? lastFive.reduce((sum, lap) => sum + lap, 0) / lastFive.length
      : null;
  const lastLap = laps.length > 0 ? laps[laps.length - 1] : null;

  return {
    fastestLap: laps.length > 0 ? Math.min(...laps) : null,
    lastFiveAverage,
    lastLap,
    lastLapComparedToAverage:
      lastLap !== null && lastFiveAverage !== null
        ? lastLap - lastFiveAverage
        : null,
    completedLaps: laps.length,
  };
}

export function resetLapHistory() {
  lapHistory.clear();
}

import { lapPositions } from "../handleLapChange";

export function registerLapPosition(
  p: PlayerObject,
  lapIndex: number,
  currentLap: number,
  lapTime: number
): number {
  return lapPositions[lapIndex].push({
    id: p.id,
    name: p.name,
    currentLap,
    time: lapTime,
  });
}

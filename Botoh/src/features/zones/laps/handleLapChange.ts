import { inHitbox } from "../../utils";
import { CIRCUITS, currentMapIndex } from "../maps";
import { laps } from "../laps";

export const lapPositions: {
  id: number;
  name: string;
  currentLap: number;
  time: number;
}[][] = [];
for (let i = 0; i < laps; i++) {
  lapPositions[i] = [];
}

export const finishList: {
  name: string;
  pits: number;
  time: number;
  fullTime: number;
}[] = [];

export function ifInLapChangeZone(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    inHitbox(player, CIRCUITS[currentMapIndex].info.finishLine.bounds)
  );
}

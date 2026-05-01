import { printAllPositions } from "../../../../commands/gameMode/race/printAllPositions";
import { notifyGapToCarAhead } from "./notifyGapToCarAhead";
import { notifySpectatorsCurrentLap } from "./notifySpecCurrentLap";

export function notifyPositionOrLeaders(
  p: PlayerObject,
  room: RoomObject,
  lapIndex: number,
  position: number,
  currentLap: number,
  playerAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
) {
  if (position > 1) {
    notifyGapToCarAhead(p, room, lapIndex, position, currentLap);
  } else {
    printAllPositions(room, 1000);
    notifySpectatorsCurrentLap(room, currentLap, playerAndDiscs);
  }
}

import { ifInLapChangeZone } from "../handleLapChange";

export function isInValidLapZone(
  pad: {
    p: PlayerObject;
    disc: DiscPropertiesObject;
  },
  room: RoomObject
) {
  if (!ifInLapChangeZone(pad, room)) return false;
  return true;
}

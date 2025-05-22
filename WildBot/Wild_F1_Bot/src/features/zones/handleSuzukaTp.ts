import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { inHitbox } from "../utils";

export function handleSuzukaTp(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  if (
    room.getScores().time > 0 &&
    ACTUAL_CIRCUIT.info.name === "Suzuka International Circuit - By Ximb" &&
    inHitbox(player, {
      minX: -2100,
      maxX: -1800,
      minY: 1670,
      maxY: 1700,
    })
  ) {
    room.setPlayerDiscProperties(player.p.id, {
      y: 1416,
      x: player.p.position.x - 130,
    });
  }
}

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
      minX: -372,
      maxX: 82,
      minY: 978,
      maxY: 1010,
    })
  ) {
    room.setPlayerDiscProperties(player.p.id, {
      y: 710,
      x: player.p.position.x - 385,
    });
  }
}

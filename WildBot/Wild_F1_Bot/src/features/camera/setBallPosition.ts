export default function setBallPosition(
  room: RoomObject,
  playerAndDisc?: { p: PlayerObject; disc: DiscPropertiesObject }
) {
  if (!playerAndDisc) {
    return;
  }
  if (room.getScores()?.time > 0) {
    room.setDiscProperties(1, {
      x: playerAndDisc.disc.x,
      y: playerAndDisc.disc.y,
    });
    return;
  }
}

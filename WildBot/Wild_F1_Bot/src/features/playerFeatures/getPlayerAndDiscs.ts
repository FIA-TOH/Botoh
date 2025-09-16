export function getPlayerAndDiscs(room: RoomObject) {
  const playersAndDiscs = room.getPlayerList().map((p) => {
    return { p: p, disc: room.getPlayerDiscProperties(p.id) };
  });

  return playersAndDiscs;
}

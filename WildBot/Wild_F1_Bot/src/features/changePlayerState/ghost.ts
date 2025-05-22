import { getRunningPlayers } from "../utils";

export let ghostMode = false;

export function setGhostMode(room: RoomObject, enable: boolean) {
  ghostMode = enable;
  const playersAndDiscs = room.getPlayerList().map((p) => {
    return { p: p, disc: room.getPlayerDiscProperties(p.id) };
  });

  if (ghostMode) {
    room.sendAnnouncement("Ghost mode enabled");
    if (room.getScores() != null) {
      const players = getRunningPlayers(playersAndDiscs);
      players.forEach((pad) =>
        room.setPlayerDiscProperties(pad.p.id, {
          cGroup: room.CollisionFlags.c0 | room.CollisionFlags.redKO,
        })
      );
    }
  } else {
    room.sendAnnouncement("Ghost mode disabled");
    if (room.getScores() != null) {
      const players = getRunningPlayers(playersAndDiscs);
      players.forEach((pad) =>
        room.setPlayerDiscProperties(pad.p.id, {
          cGroup: room.CollisionFlags.red | room.CollisionFlags.redKO,
        })
      );
    }
  }
}

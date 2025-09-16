import { getRunningPlayers, vectorSpeed } from "../utils";

import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";

export function logPlayerSpeed(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs).filter(
    (pad) => playerList[pad.p.id].speedEnabled
  );

  players.forEach((pad) => {
    const speed = vectorSpeed(pad.disc.xspeed, pad.disc.yspeed);
    handleAvatar(Situacions.Speed, pad.p, room, speed.toString());
  });
}

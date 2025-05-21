import { room } from "../../room";
import { getRunningPlayers } from "../utils";

export function getPlayerByName(name: string) {
  const playersAndDiscs = room.getPlayerList().map((p) => {
    return { p: p, disc: room.getPlayerDiscProperties(p.id) };
  });
  const players = getRunningPlayers(playersAndDiscs);

  const player = players.find(
    (pad) => pad.p.name.toLowerCase() == name.toLowerCase()
  );

  return player;
}

export function getPlayerById(id: string) {
  const playersAndDiscs = room.getPlayerList().map((p) => {
    return { p: p, disc: room.getPlayerDiscProperties(p.id) };
  });
  const players = getRunningPlayers(playersAndDiscs);

  const player = players.find((pad) => pad.p.id);

  return player;
}

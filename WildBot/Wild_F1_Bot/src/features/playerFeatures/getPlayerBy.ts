import { room } from "../../room";
import { getRunningPlayers } from "../utils";
import { getPlayerAndDiscs } from "./getPlayerAndDiscs";

export function getPlayerByName(name: string) {
  const playersAndDiscs = getPlayerAndDiscs(room);
  const players = getRunningPlayers(playersAndDiscs);

  const player = players.find(
    (pad) => pad.p.name.toLowerCase() == name.toLowerCase()
  );

  return player;
}

export function getPlayerById(id: string) {
  const playersAndDiscs = getPlayerAndDiscs(room);
  const players = getRunningPlayers(playersAndDiscs);

  const player = players.find((pad) => pad.p.id);

  return player;
}

import { roomPromise } from "../../room";
import { getRunningPlayers } from "../utils";
import { getPlayerAndDiscs } from "./getPlayerAndDiscs";

export async function getPlayerByName(name: string) {
  const room = await roomPromise;
  const playersAndDiscs = getPlayerAndDiscs(room);
  const players = getRunningPlayers(playersAndDiscs);

  const player = players.find(
    (pad) => pad.p.name.toLowerCase() == name.toLowerCase()
  );

  return player;
}

export async function getPlayerById(id: string) {
  const room = await roomPromise;
  const playersAndDiscs = getPlayerAndDiscs(room);
  const players = getRunningPlayers(playersAndDiscs);

  const player = players.find((pad) => pad.p.id);

  return player;
}

import { roomPromise } from "../../room";
import { playerList } from "../changePlayerState/playerList";
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

export function getPlayerById(id: string | number, room: RoomObject) {
  const playersAndDiscs = getPlayerAndDiscs(room);
  const players = getRunningPlayers(playersAndDiscs);

  const player = players.find((pad) => pad.p.id === id);

  return player;
}

export function getPlayerByRacePosition(
  positionOrKeyword: number | "first" | "last",
  room: RoomObject,
  exclude?: number | string | (number | string)[]
) {
  const excludeArr = Array.isArray(exclude)
    ? exclude
    : exclude !== undefined
    ? [exclude]
    : [];

  const runners = room
    .getPlayerList()
    .filter((p) => p.team === 1)

    .filter((p) => {
      const info = playerList[p.id];
      if (!info) return false;
      return !excludeArr.includes(p.id) && !excludeArr.includes(p.name);
    })
    .sort((a, b) => {
      const pa = playerList[a.id];
      const pb = playerList[b.id];

      if (pa.currentLap !== pb.currentLap) {
        return pb.currentLap - pa.currentLap;
      }
      return pa.totalTime - pb.totalTime;
    });

  if (runners.length === 0) return undefined;

  if (positionOrKeyword === "first") return runners[0];
  if (positionOrKeyword === "last") return runners[runners.length - 1];

  const index = (positionOrKeyword as number) - 1;
  if (index < 0 || index >= runners.length) return undefined;

  return runners[index];
}

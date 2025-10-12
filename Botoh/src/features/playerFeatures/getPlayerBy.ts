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

export async function getPlayerById(id: string) {
  const room = await roomPromise;
  const playersAndDiscs = getPlayerAndDiscs(room);
  const players = getRunningPlayers(playersAndDiscs);

  const player = players.find((pad) => pad.p.id);

  return player;
}
export function getPlayerByRacePosition(
  position: number | string,
  room: RoomObject
): PlayerObject | undefined {
  const runningPlayers = getRunningPlayers(getPlayerAndDiscs(room));

  runningPlayers.sort((a, b) => {
    const aLap = playerList[a.p.id].currentLap;
    const bLap = playerList[b.p.id].currentLap;
    const aLapTime = playerList[a.p.id].lapTime;
    const bLapTime = playerList[b.p.id].lapTime;

    // Primeiro por volta, depois por tempo de volta
    if (aLap !== bLap) {
      return bLap - aLap;
    }
    return aLapTime - bLapTime;
  });

  let index: number;

  if (typeof position === "number") {
    index = position - 1;
    if (index < 0) {
      console.error(`[getPlayerByRacePosition] Posição inválida: ${position}`);
      return undefined;
    }
  } else if (typeof position === "string") {
    if (position === "last") {
      index = runningPlayers.length - 1;
    } else if (position.startsWith("last-")) {
      const offset = parseInt(position.split("-")[1], 10);
      if (isNaN(offset)) {
        console.error(
          `[getPlayerByRacePosition] Offset inválido em '${position}'`
        );
        return undefined;
      }
      index = runningPlayers.length - 1 - offset;
    } else {
      console.error(
        `[getPlayerByRacePosition] String de posição inválida: '${position}'`
      );
      return undefined;
    }
  } else {
    console.error(
      `[getPlayerByRacePosition] Tipo de posição inválido: ${typeof position}`
    );
    return undefined;
  }

  if (index < 0 || index >= runningPlayers.length) {
    console.error(
      `[getPlayerByRacePosition] Índice fora do intervalo: ${index}`
    );
    return undefined;
  }

  return runningPlayers[index]?.p;
}

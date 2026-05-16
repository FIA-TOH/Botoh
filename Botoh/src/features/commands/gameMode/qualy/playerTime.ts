import { updatePlayerListPosition } from "../../../changePlayerState/playerList";

export type QualiPlayerTime = {
  name: string;
  time: number;
  id: number;
  team: string | null;
};

let arrayPlayers: QualiPlayerTime[] = [];

export function syncQualiPositions() {
  getPlayersOrderedByQualiTime().forEach((player, index) => {
    updatePlayerListPosition(player.id, index + 1);
  });
}

export function getPlayersOrderedByQualiTime() {
  return arrayPlayers.slice().sort((a, b) => a.time - b.time);
}

export function getQualiPlayerTimes() {
  return arrayPlayers.slice();
}

export function updatePlayerTime(
  name: string,
  time: number,
  id: number,
  team: string | null
) {
  const existingPlayer = arrayPlayers.find(
    (player) => player.name.toLowerCase() === name.toLowerCase()
  );

  if (existingPlayer) {
    existingPlayer.time = time;
    existingPlayer.id = id;
    existingPlayer.team = team;
  } else {
    arrayPlayers.push({ name, time, id, team });
  }

  syncQualiPositions();
}

export function clearPlayers() {
  arrayPlayers.forEach((player) => {
    updatePlayerListPosition(player.id, null);
  });
  arrayPlayers = [];
}

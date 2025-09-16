let arrayPlayers: {
  name: string;
  time: number;
  id: number;
  team: string | null;
}[] = [];

export function getPlayersOrderedByQualiTime() {
  return arrayPlayers.slice().sort((a, b) => a.time - b.time);
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
  } else {
    arrayPlayers.push({ name, time, id, team });
  }
}

export function clearPlayers() {
  arrayPlayers = [];
}

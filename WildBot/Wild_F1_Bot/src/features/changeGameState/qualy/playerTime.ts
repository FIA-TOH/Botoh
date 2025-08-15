let arrayPlayers: { name: string; time: number; id: number }[] = [];

export function getPlayersOrderedByQualiTime() {
  return arrayPlayers.slice().sort((a, b) => a.time - b.time);
}

export function updatePlayerTime(name: string, time: number, id: number) {
  const existingPlayer = arrayPlayers.find(
    (player) => player.name.toLowerCase() === name.toLowerCase()
  );

  if (existingPlayer) {
    existingPlayer.time = time;
  } else {
    arrayPlayers.push({ name, time, id });
  }
}

export function clearPlayers() {
  arrayPlayers = [];
}

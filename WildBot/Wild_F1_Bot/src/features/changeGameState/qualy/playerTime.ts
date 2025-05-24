let arrayPlayers: { name: string; time: number }[] = [];

export function getPlayersOrderedByQualiTime() {
  return arrayPlayers.slice().sort((a, b) => a.time - b.time);
}

export function updatePlayerTime(name: string, time: number) {
  const existingPlayer = arrayPlayers.find(
    (player) => player.name.toLowerCase() === name.toLowerCase()
  );

  if (existingPlayer) {
    existingPlayer.time = time;
  } else {
    arrayPlayers.push({ name, time });
  }
}

export function clearPlayers() {
  arrayPlayers = [];
}

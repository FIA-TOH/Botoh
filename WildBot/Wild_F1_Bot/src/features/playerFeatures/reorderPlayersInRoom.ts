import { getPlayersOrderedByQualiTime } from "../changeGameState/qualy/playerTime";

//to-do: Fazer uma reordem para qualy, para corrida e para pódio.
export function reorderPlayersInRoom(room: RoomObject) {
  const orderedPlayers = getPlayersOrderedByQualiTime();
  console.log("orderedPlayers", orderedPlayers);

  const playerListInRoom = room.getPlayerList();
  console.log("playerListInRoom", playerListInRoom);

  const validPlayers = orderedPlayers.filter((player) => {
    const playerObj = playerListInRoom.find((p) => p.name === player.name);
    return playerObj && playerObj.id;
  });
  console.log("validPlayers", validPlayers);

  const playerIds = validPlayers
    .map((p) => {
      const playerObj = playerListInRoom.find((pObj) => pObj.name === p.name);
      return playerObj?.id;
    })
    .filter((id) => id !== undefined);
  console.log("playerIds", playerIds);

  if (playerIds.length > 0) {
    room.reorderPlayers(playerIds, true);
  }
}

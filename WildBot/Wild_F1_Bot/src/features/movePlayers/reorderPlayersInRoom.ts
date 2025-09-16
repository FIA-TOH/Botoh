import { getPlayersOrderedByQualiTime } from "../changeGameState/qualy/playerTime";
import { Teams } from "../changeGameState/teams";
import { playerList } from "../changePlayerState/playerList";
import { finishList } from "../zones/laps/handleLapChange";

export function reorderPlayersInRoomRace(room: RoomObject) {
  const orderedPlayers = getPlayersOrderedByQualiTime();
  const playersInRoom = room.getPlayerList();

  const qualiPlayersIds = orderedPlayers
    .map((player) => {
      const pObj = playersInRoom.find((p) => p.name === player.name);
      if (!pObj) return undefined;

      const data = playerList[pObj.id];
      if (data?.afk) return undefined;

      if (pObj.team !== Teams.RUNNERS) {
        room.setPlayerTeam(pObj.id, Teams.RUNNERS);
      }
      return pObj.id;
    })
    .filter((id): id is number => id !== undefined);

  const extraRedIds = playersInRoom
    .filter((p) => p.team === Teams.RUNNERS && !qualiPlayersIds.includes(p.id))
    .map((p) => p.id);

  const blueToRedIds = playersInRoom
    .filter((p) => p.team === Teams.OUTSIDE)
    .map((p) => {
      const data = playerList[p.id];
      if (!data?.afk) {
        room.setPlayerTeam(p.id, Teams.RUNNERS);
        return p.id;
      }
      return undefined;
    })
    .filter((id): id is number => id !== undefined);

  const specToRedIds = playersInRoom
    .filter((p) => p.team === Teams.SPECTATORS)
    .map((p) => {
      const data = playerList[p.id];
      if (!data?.afk) {
        room.setPlayerTeam(p.id, Teams.RUNNERS);
        return p.id;
      }
      return undefined;
    })
    .filter((id): id is number => id !== undefined);

  const finalOrder = [
    ...qualiPlayersIds,
    ...extraRedIds,
    ...blueToRedIds,
    ...specToRedIds,
  ];

  if (finalOrder.length > 0) {
    room.reorderPlayers(finalOrder, true);
  }
}

export function reorderPlayersByRacePosition(room: RoomObject) {
  const playersInRoom = room.getPlayerList();

  const activePositionIds = finishList
    .map((pos) => {
      const pObj = playersInRoom.find((p) => p.name === pos.name);
      if (!pObj) return undefined;

      const data = playerList[pObj.id];
      if (data?.afk) return undefined;

      if (pObj.team !== Teams.RUNNERS) {
        room.setPlayerTeam(pObj.id, Teams.RUNNERS);
      }
      return pObj.id;
    })
    .filter((id): id is number => id !== undefined);

  const extraRedIds = playersInRoom
    .filter(
      (p) =>
        p.team === Teams.RUNNERS &&
        !activePositionIds.includes(p.id) &&
        !playerList[p.id]?.afk
    )
    .map((p) => p.id);

  // 3 - azuis para vermelho
  const blueToRedIds = playersInRoom
    .filter((p) => p.team === Teams.OUTSIDE && !playerList[p.id]?.afk)
    .map((p) => {
      room.setPlayerTeam(p.id, Teams.RUNNERS);
      return p.id;
    });

  // 4 - spec para vermelho
  const specToRedIds = playersInRoom
    .filter((p) => p.team === Teams.SPECTATORS && !playerList[p.id]?.afk)
    .map((p) => {
      room.setPlayerTeam(p.id, Teams.RUNNERS);
      return p.id;
    });

  // Ordem final
  const finalOrder = [
    ...activePositionIds,
    ...extraRedIds,
    ...blueToRedIds,
    ...specToRedIds,
  ];

  if (finalOrder.length > 0) {
    room.reorderPlayers(finalOrder, true);
  }
}

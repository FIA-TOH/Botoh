import {
  handleAvatar,
  Situacions,
} from "../../../changePlayerState/handleAvatar";
import { playerList } from "../../../changePlayerState/playerList";
import { constants } from "../../../speed/constants";
import { positionList } from "../race/positionList";

export let sandbagEnabled = false;
let currentSandbagPlayerId: number | null = null;

export function setSandbagMode(value: boolean, room: RoomObject) {
  sandbagEnabled = value;

  if (!value && currentSandbagPlayerId !== null) {
    removeSandbag(currentSandbagPlayerId, room);
    currentSandbagPlayerId = null;
  }
}

export function resetSandbag(room: RoomObject) {
  if (currentSandbagPlayerId !== null) {
    removeSandbag(currentSandbagPlayerId, room);
  }

  currentSandbagPlayerId = null;
  sandbagEnabled = false;

  Object.values(playerList).forEach((p) => {
    if (!p) return;
    p.sandbagPenalty = 0;
  });
}
export function checkSandbagLeader(room: RoomObject) {
  if (!sandbagEnabled) return;
  if (positionList.length === 0) return;

  const leader = positionList[0];
  const leaderData = playerList[leader.id];

  if (!leaderData) return;
  if (leaderData.currentLap <= 1) return;

  if (currentSandbagPlayerId === leader.id) return;

  if (currentSandbagPlayerId !== null) {
    removeSandbag(currentSandbagPlayerId, room);
  }

  applySandbag(leader.id, room);
  currentSandbagPlayerId = leader.id;
}

function applySandbag(playerId: number, room: RoomObject) {
  playerList[playerId].sandbagPenalty = constants.SANDBAG_PENALTY;

  const player = room.getPlayerList().find((p) => p.id === playerId);
  if (!player) return;

  handleAvatar(Situacions.Sandbag, player, room);
}

function removeSandbag(playerId: number, room: RoomObject) {
  playerList[playerId].sandbagPenalty = 0;

  const player = room.getPlayerList().find((p) => p.id === playerId);
  if (!player) return;

  handleAvatar(Situacions.ChangeTyre, player, room);
}

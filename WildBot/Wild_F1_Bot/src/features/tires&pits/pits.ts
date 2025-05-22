import { handleAvatar } from "../changePlayerState/handleAvatar";
import {
  sendChatMessage,
  sendErrorMessage,
  sendAlertMessage,
} from "../chat/chat";

import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { CIRCUITS, currentMapIndex } from "../zones/maps";
import { MESSAGES } from "../chat/messages";
import { playerList } from "../changePlayerState/playerList";
import { Teams } from "../changeGameState/teams";

import { inHitbox, getRunningPlayers } from "../utils";
import { Tires, TIRE_STARTING_SPEED } from "./tires";

export function enableShowTires(player: PlayerObject, room: RoomObject) {
  const tires = !playerList[player.id].showTires;
  const speed = !tires;

  playerList[player.id].showTires = tires;
  playerList[player.id].speedEnabled = speed;

  handleAvatar(tires ? "ChangeTyre" : "Speed", player, room);
  const message = tires
    ? MESSAGES.NOW_SHOWING_TIRES()
    : MESSAGES.NOW_SHOWING_SPEED();
  sendChatMessage(room, message, player.id);
}

export function changeTires(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  chosen: Tires,
  room: RoomObject
) {
  if (player.p.team !== Teams.RUNNERS) {
    sendErrorMessage(room, MESSAGES.NOT_RUNNER(), player.p.id);
    return false;
  }

  if (room.getScores() === null) {
    sendErrorMessage(room, MESSAGES.NOT_STARTED(), player.p.id);
    return false;
  }

  if (
    !ifInBoxZone(player, room) &&
    room.getScores().time > 0 &&
    chosen != Tires.FLAT
  ) {
    sendErrorMessage(room, MESSAGES.NOT_IN_BOXES(), player.p.id);
    return false;
  }

  playerList[player.p.id].wear = 0;
  playerList[player.p.id].alertSent = {};
  playerList[player.p.id].tires = chosen;
  playerList[player.p.id].lapsOnCurrentTire = -1;
  playerList[player.p.id].gripCounter = 0;
  playerList[player.p.id].maxSpeed = TIRE_STARTING_SPEED[chosen];
  sendChatMessage(room, MESSAGES.CHANGED_TIRES(player.p.name, chosen));

  handleAvatar("ChangeTyre", player.p, room);
}

function ifInPitlaneStart(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    inHitbox(player, CIRCUITS[currentMapIndex].info.pitlaneStart)
  );
}

function ifInPitlaneEnd(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    inHitbox(player, CIRCUITS[currentMapIndex].info.pitlaneEnd)
  );
}

export function handlePitlane(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  players.forEach((player) => {
    const p = player.p;
    if (ifInPitlaneStart(player, room) && !playerList[p.id].inPitlane) {
      playerList[p.id].pits.pitsNumber += 1;
      playerList[p.id].inPitlane = true;
      if (LEAGUE_MODE && playerList[player.p.id].boxAlert === false) {
        const numero = Math.floor(1000 + Math.random() * 9000);
        playerList[player.p.id].boxAlert = numero;
        sendAlertMessage(room, MESSAGES.CODE_BOX(numero), player.p.id);
      }
    }
    if (ifInPitlaneEnd(player, room) && playerList[p.id].inPitlane) {
      playerList[p.id].inPitlane = false;
      if (LEAGUE_MODE && playerList[player.p.id].boxAlert !== false) {
        playerList[player.p.id].boxAlert = false;
      }
    }
  });
}

export function ifInBoxZone(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    inHitbox(player, CIRCUITS[currentMapIndex].info.boxLine)
  );
}

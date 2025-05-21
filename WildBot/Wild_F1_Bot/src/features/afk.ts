import { sendAlertMessage } from "./chat";
import { gameState } from "./gameState";
import { MESSAGES } from "./messages";
import { playerList } from "./playerList";
import { Teams } from "./teams";

let afkSwitch = true;
const playersAFKTimers: Map<number, NodeJS.Timeout> = new Map();
const playersAFKWarnings: Map<number, NodeJS.Timeout> = new Map();

export function resetAFKTimer(playerId: number, room: RoomObject) {
  // const player = room.getPlayerList().find((p) => p.id === playerId);
  // if (playersAFKTimers.has(playerId)) {
  //     clearTimeout(playersAFKTimers.get(playerId)!);
  //     playersAFKTimers.delete(playerId);
  // }
  // if (playersAFKWarnings.has(playerId)) {
  //     clearTimeout(playersAFKWarnings.get(playerId)!);
  //     playersAFKWarnings.delete(playerId);
  // }
  // if (!player || player.team !== Teams.RUNNERS || gameState !== "running" || !afkSwitch) {
  //     return;
  // }
  // const warningTimer = setTimeout(() => {
  //     sendAFKWarning(playerId, room);
  // }, 20000);
  // playersAFKWarnings.set(playerId, warningTimer);
  // const kickTimer = setTimeout(() => {
  //     handleAFK(playerId, room);
  // }, 30000);
  // playersAFKTimers.set(playerId, kickTimer);
}

export function resetAFKTimers(room: RoomObject) {
  // playersAFKTimers.forEach((timer) => clearTimeout(timer));
  // playersAFKTimers.clear();
  // playersAFKWarnings.forEach((timer) => clearTimeout(timer));
  // playersAFKWarnings.clear();
  // if (gameState === "running" && afkSwitch) {
  //     room.getPlayerList().forEach((player) => {
  //         if (player.team === Teams.RUNNERS && player.position) {
  //             resetAFKTimer(player.id, room);
  //         }
  //     });
  // }
}

function sendAFKWarning(playerId: number, room: RoomObject) {
  const player = room.getPlayerList().find((p) => p.id === playerId);
  if (player) {
    sendAlertMessage(room, MESSAGES.AFK_MESSAGE(), playerId);
  } else {
  }
}

function handleAFK(playerId: number, room: RoomObject) {
  const player = room.getPlayerList().find((p) => p.id === playerId);
  if (player) {
    playerList[player.id].afk = true;
    room.setPlayerTeam(player.id, Teams.SPECTATORS);
  } else {
  }
}

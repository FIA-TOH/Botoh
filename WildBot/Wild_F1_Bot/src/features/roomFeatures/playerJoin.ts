import { sha256 } from "js-sha256";
import { MAX_PLAYER_NAME, sendSuccessMessage } from "../chat";
import { gameState } from "../gameState";
import { isBanned } from "../ipRelated/isBanned";
import { LEAGUE_MODE } from "../leagueMode";
import { MESSAGES } from "../messages";
import { idToAuth, playerList } from "../playerList";
import { createPlayerInfo } from "../players";
import { gameMode, GameMode } from "../qualiMode";
import { Teams } from "../teams";
import { banPlayer, decodeIPFromConn, kickPlayer } from "../utils";

function WhatToDoWhenJoin(room: RoomObject, player: PlayerObject) {
  if (room.getPlayerList().length > 1) {
    if (room.getScores()) {
      if (
        gameState === "running" &&
        gameMode !== GameMode.QUALY &&
        gameMode !== GameMode.TRAINING &&
        room.getScores().time !== 0
      ) {
        room.setPlayerTeam(player.id, Teams.SPECTATORS);
      } else {
        room.setPlayerTeam(player.id, Teams.RUNNERS);
      }
    }
  } else {
    room.setPlayerTeam(player.id, Teams.RUNNERS);
    room.startGame();
  }
}

export function PlayerJoin(room: RoomObject) {
  room.onPlayerJoin = function (player) {
    const ip = decodeIPFromConn(player.conn);
    console.log(`The IP ${ip} joined!`);

    if (isBanned(ip)) {
      banPlayer(player.id, `Your ip is banned from this room.`, room);
      console.log(`The BANNED IP ${ip} tried to join!`);
      return;
    }

    if (player.name.length > MAX_PLAYER_NAME) {
      kickPlayer(
        player.id,
        "Your name cannot be bigger than 22 characters",
        room
      );
      console.log(`BIG NAME! The IP ${ip} tried to join!`);
      return;
    }

    // if (LEAGUE_MODE && !regexPattern.test(player.name)) {
    //     kickPlayer(player.id, `Your name must be in the format "[XX] Name"`, room)
    //     return
    // }

    if (player.auth === null) {
      kickPlayer(
        player.id,
        `Sorry, your auth is not set. Please try again.`,
        room
      );
      return;
    }

    idToAuth[player.id] = player.auth;

    if (playerList[player.id] === undefined) {
      playerList[player.id] = createPlayerInfo(ip);
    }

    sendSuccessMessage(room, MESSAGES.JOIN_MESSAGE(), player.id);

    if (LEAGUE_MODE) {
      console.log(`${player.name} has joined. (${sha256(ip)})`);
    } else {
      console.log(`${player.name} has joined. (${ip})`);
    }

    WhatToDoWhenJoin(room, player);
  };
}

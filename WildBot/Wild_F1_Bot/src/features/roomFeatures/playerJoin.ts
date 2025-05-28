import { sha256 } from "js-sha256";
import { gameState } from "../changeGameState/gameState";
import { Teams } from "../changeGameState/teams";
import { idToAuth, playerList } from "../changePlayerState/playerList";
import { createPlayerInfo } from "../changePlayerState/players";
import { MAX_PLAYER_NAME, sendSuccessMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { isBanned } from "../ipRelated/isBanned";
import { decodeIPFromConn, banPlayer, kickPlayer } from "../utils";
import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { log } from "../discord/logger";

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
    log(`The IP ${ip} joined!`);

    if (isBanned(ip)) {
      banPlayer(player.id, `Your ip is banned from this room.`, room);
      log(`The BANNED IP ${ip} tried to join!`);
      return;
    }

    if (player.name.length > MAX_PLAYER_NAME) {
      kickPlayer(
        player.id,
        "Your name cannot be bigger than 22 characters",
        room
      );
      log(`BIG NAME! The IP ${ip} tried to join!`);
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
      log(`${player.name} has joined. (${sha256(ip)})`);
    } else {
      log(`${player.name} has joined. (${ip})`);
    }

    WhatToDoWhenJoin(room, player);
  };
}

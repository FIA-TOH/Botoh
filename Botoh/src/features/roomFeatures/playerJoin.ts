import { sha256 } from "js-sha256";
import { gameState } from "../changeGameState/gameState";
import { Teams } from "../changeGameState/teams";
import { idToAuth, playerList } from "../changePlayerState/playerList";
import { createPlayerInfo } from "../changePlayerState/players";
import {
  MAX_PLAYER_NAME,
  sendAlertMessage,
  sendChatMessage,
  sendSuccessMessage,
} from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { isBanned } from "../ipRelated/isBanned";
import {
  decodeIPFromConn,
  banPlayer,
  kickPlayer,
  getRunningPlayers,
} from "../utils";
import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
import { log } from "../discord/logger";
import { checkRunningPlayers } from "../changeGameState/publicGameFlow/startStopGameFlow";
import {
  playersLeftInfo,
  REJOIN_TIME_LIMIT,
} from "../comeBackRace.ts/comeBackToRaceFunctions";

import { sendDiscordGeneralChatQualy } from "../discord/discord";
import { PLAYER_LIMIT } from "../commands/adminThings/handleLimitPlayerQuantity";
import { positionList } from "../commands/gameMode/race/positionList";

const HARD_QUALY_PASSWORD = "hardqualy";

function WhatToDoWhenJoin(room: RoomObject, player: PlayerObject) {
  const players = room.getPlayerList();
  const now = new Date();

  const wasRunning = positionList.some((p) => p.name === player.name);

  if (gameMode === GameMode.HARD_QUALY) {
    if (player.name !== "Admin") {
      sendDiscordGeneralChatQualy(`${player.name} has joined the qualy room!`);
    }

    if (
      playerList[player.id].didHardQualy === true &&
      player.name !== "Admin"
    ) {
      kickPlayer(player.id, `You already did qualy`, room);
    }
  }

  if (players.length > 1) {
    if (room.getScores()) {
      if (
        gameState === "running" &&
        generalGameMode === GeneralGameMode.GENERAL_RACE
      ) {
        room.setPlayerTeam(player.id, Teams.SPECTATORS);
      } else if (
        wasRunning &&
        generalGameMode === GeneralGameMode.GENERAL_RACE
      ) {
        const leftInfoIndex = playersLeftInfo.findIndex(
          (info) => info.name === player.name,
        );

        if (leftInfoIndex !== -1) {
          const leftInfo = playersLeftInfo[leftInfoIndex];
          const leftAt = new Date(leftInfo.leftAt);
          const diffInSeconds = (now.getTime() - leftAt.getTime()) / 1000;

          if (diffInSeconds <= REJOIN_TIME_LIMIT) {
            sendAlertMessage(room, MESSAGES.TYPE_REJOIN(), player.id);
          }

          room.setPlayerTeam(player.id, Teams.SPECTATORS);
          return;
        }

        room.setPlayerTeam(player.id, Teams.SPECTATORS);
      } else {
        room.setPlayerTeam(player.id, Teams.RUNNERS);
      }
    }
  } else {
    room.setPlayerTeam(player.id, Teams.RUNNERS);
    room.startGame();
  }
  if (room.getScores() && typeof room.getScores().time === "number") {
    const currentTime = room.getScores().time;
    playerList[player.id].timeWhenEntered =
      currentTime > 0 ? currentTime : Date.now() / 1000;
  } else {
    playerList[player.id].timeWhenEntered = Date.now() / 1000;
  }

  setTimeout(() => {
    if (room.getScores() && typeof room.getScores().time === "number") {
      const currentTime = room.getScores().time;
      playerList[player.id].timeWhenEntered = currentTime;
    }
  }, 500);
}

export function PlayerJoin(room: RoomObject) {
  room.onPlayerJoin = function (player) {
    const players = room.getPlayerList();

    const ip = decodeIPFromConn(player.conn);
    log(`The IP ${ip} joined!`);

    if (player.name === "Admin") {
      room.setPassword(null);
      log(`Admin entrou — senha removida`);
    }

    if (isBanned(ip)) {
      banPlayer(player.id, `Your ip is banned from this room.`, room);
      log(`The BANNED IP ${ip} tried to join!`);
      return;
    }

    if (player.name.length > MAX_PLAYER_NAME) {
      kickPlayer(
        player.id,
        "Your name cannot be bigger than 22 characters",
        room,
      );
      log(`BIG NAME! The IP ${ip} tried to join!`);
      return;
    }

    if (player.auth === null) {
      kickPlayer(
        player.id,
        `Sorry, your auth is not set. Please try again.`,
        room,
      );
      return;
    }

    idToAuth[player.id] = player.auth;

    if (playerList[player.id] === undefined) {
      playerList[player.id] = createPlayerInfo(ip);
    }

    if (gameMode === GameMode.HARD_QUALY) {
      if (players.length >= 0) {
        room.setPassword(HARD_QUALY_PASSWORD);
      } else {
        room.setPassword(null);
      }
    } else {
      if (players.length > PLAYER_LIMIT) {
        room.setPassword("roomfull");
        kickPlayer(
          player.id,
          `❌ Room full! The limit is ${PLAYER_LIMIT} players.`,
          room,
        );
        room.setPassword(null);
        return;
      } else if (players.length < PLAYER_LIMIT) {
        room.setPassword(null);
      }
    }

    sendSuccessMessage(room, MESSAGES.JOIN_MESSAGE(), player.id);

    if (LEAGUE_MODE) {
      log(`${player.name} has joined. (${sha256(ip)})`);
    } else {
      log(`${player.name} has joined. (${ip})`);
      checkRunningPlayers(room);
    }

    WhatToDoWhenJoin(room, player);
  };

  room.onPlayerLeave = function () {
    const players = room.getPlayerList();
    if (gameMode === GameMode.HARD_QUALY && players.length === 0) {
      room.setPassword(null);
      log("Sala vazia — senha removida (HARD QUALY).");
    }
  };
}

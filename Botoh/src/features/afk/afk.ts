import { afkKickTime, afkAlertTime } from "../../../roomconfig.json";
import {
  GameMode,
  gameMode,
  GeneralGameMode,
  generalGameMode,
} from "../changeGameState/changeGameModes";
import { gameState } from "../changeGameState/gameState";
import { Teams } from "../changeGameState/teams";
import { playerList } from "../changePlayerState/playerList";
import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { handleVSCCommand } from "../commands/flagsAndVSC/handleVSCCommand";
import { presentationLap } from "../commands/gameState/handlePresentationLapCommand";
import { chooseOneDebris } from "../debris/chooseOneDebris";
import { debrisEnabled } from "../debris/enableDebris";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { vsc } from "../speed/handleSpeed";

const activities: { [key: number]: number } = {};
export function afkKick(room: RoomObject) {
  const players = room.getPlayerList();
  const afkKickTimeMilisseconds = afkKickTime * 1000;
  const afkAlertTimeMilliseconds = afkAlertTime * 1000;

  for (let id in activities) {
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const playerId = player.id;
      const playerPropierties = playerList[playerId];

      if (playerPropierties.inPitlane) {
        return false;
      }
      const afkDuration = Date.now() - activities[playerId];

      if (
        room.getScores() != null &&
        room.getScores().time > 0 &&
        gameState === "running" &&
        gameMode !== GameMode.WAITING &&
        gameMode !== GameMode.TRAINING &&
        generalGameMode !== GeneralGameMode.GENERAL_QUALY &&
        player.team === Teams.RUNNERS
      ) {
        if (afkDuration > afkKickTimeMilisseconds) {
          if (LEAGUE_MODE) {
            if (!vsc && !presentationLap) {
              handleVSCCommand(undefined, undefined, room);
              if (ACTUAL_CIRCUIT.info.haveDebris && debrisEnabled) {
                chooseOneDebris(room, playerId);
              }
              if (
                ACTUAL_CIRCUIT.info.sectorOne &&
                ACTUAL_CIRCUIT.info.sectorTwo &&
                ACTUAL_CIRCUIT.info.sectorThree
              ) {
                sendAlertMessage(
                  room,
                  MESSAGES.WHO_IS_AFK_SECTORS(
                    player.name,
                    playerPropierties.currentSector
                  )
                );
              } else {
                sendAlertMessage(room, MESSAGES.WHO_IS_AFK(player.name));
              }
            } else {
              updatePlayerActivity(player);
              if (
                ACTUAL_CIRCUIT.info.sectorOne &&
                ACTUAL_CIRCUIT.info.sectorTwo &&
                ACTUAL_CIRCUIT.info.sectorThree
              ) {
                sendAlertMessage(
                  room,
                  MESSAGES.WHO_IS_AFK_SECTORS(
                    player.name,
                    playerPropierties.currentSector
                  )
                );
              } else {
                sendAlertMessage(room, MESSAGES.WHO_IS_AFK(player.name));
              }
            }
          } else {
            room.kickPlayer(playerId, "AFK", false);
          }
        } else if (
          afkDuration > afkAlertTimeMilliseconds &&
          !playerPropierties.afkAlert
        ) {
          sendAlertMessage(room, MESSAGES.AFK_MESSAGE(), playerId);
          playerPropierties.afkAlert = true;
        }
      }
    }
  }
}

export function updatePlayerActivity(player: PlayerObject) {
  activities[player.id] = Date.now();
  const playerPropierties = playerList[player.id];
  if (playerPropierties) {
    playerPropierties.afkAlert = false;
  }
}

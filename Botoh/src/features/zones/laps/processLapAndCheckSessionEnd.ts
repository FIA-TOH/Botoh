import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { qualiTime } from "../../changeGameState/qualy/qualiMode";
import { showPlayerQualiPosition } from "../../changeGameState/qualy/showPositionQualy";
import { printAllPositions } from "../../changeGameState/race/printAllPositions";
import { playerList } from "../../changePlayerState/playerList";
import { sendChatMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { allowPlayersRejoinRace } from "../../comeBackRace.ts/comeBackToRaceFunctions";
import { maxLapsQualy } from "../../commands/gameMode/qualy/hardQualyFunctions";
import { processIfMinimumPitStopsMet } from "../../tires&pits/minimumPit";
import { serialize, kickPlayer, getRunningPlayers } from "../../utils";
import { laps } from "../laps";
import { lapPositions } from "./handleLapChange";
import { handleRaceFinish } from "./handleRaceFinish";
import { notifySpectatorsCurrentLap } from "./notifyCurrentLap";

export function processLapAndCheckSessionEnd(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject,
  lapTime: number,
  playerAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[]
) {
  const p = pad.p;
  const playerData = playerList[p.id];
  const currentLap = playerData.currentLap;

  if (gameMode === GameMode.HARD_QUALY && currentLap >= maxLapsQualy) {
    kickPlayer(p.id, "Qualy ended", room);
    return;
  }

  if (generalGameMode !== GeneralGameMode.GENERAL_QUALY) {
    const lapIndex = currentLap - 2;
    const position = lapPositions[lapIndex].push({
      id: p.id,
      name: p.name,
      currentLap: currentLap,
      time: lapTime,
    });

    if (gameMode !== GameMode.TRAINING) {
      if (currentLap <= laps) {
        sendChatMessage(room, MESSAGES.CURRENT_LAP(currentLap, laps), p.id);

        processIfMinimumPitStopsMet(
          p,
          currentLap,
          laps,
          playerList[p.id].pits.pitsNumber,
          room
        );

        if (position > 1) {
          const prevPlayer = lapPositions[lapIndex][position - 2];
          const distance =
            prevPlayer.currentLap > currentLap
              ? prevPlayer.currentLap - currentLap
              : serialize(playerList[prevPlayer.id].lapTime);

          sendChatMessage(
            room,
            MESSAGES.POSITION_AND_DISTANCE_AHEAD(
              position,
              distance,
              typeof distance === "number" ? "laps" : "seconds"
            ),
            p.id
          );
        } else {
          printAllPositions(room, 1000);
          notifySpectatorsCurrentLap(room, currentLap, playerAndDiscs);
          if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
            allowPlayersRejoinRace(room);
          }
        }
      } else {
        handleRaceFinish(p, room, lapTime, position === 1);
      }

      if (lapIndex === laps - 2) {
        if (playerList[p.id].pits.pitsNumber === 1) {
          console.log("Faça pit!");
        }
      }
    }
  } else {
    showPlayerQualiPosition(room, p.id);

    if (room.getScores().time >= qualiTime * 60) {
      sendSuccessMessage(room, MESSAGES.FINISH_QUALI(), p.id);
      room.setPlayerTeam(p.id, 0);
    }
  }
}

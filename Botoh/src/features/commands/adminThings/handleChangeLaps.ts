import {
  gameMode,
  GameMode,
  GeneralGameMode,
  generalGameMode,
} from "../../changeGameState/changeGameModes";
import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { setLaps } from "../../zones/laps";
import { minPit } from "../tyres/handleSetMinimumPit";

export function changeLaps(
  newLapsArg?: string,
  byPlayer?: PlayerObject,
  room?: RoomObject
) {
  if (room && newLapsArg) {
    const newLaps = Number(newLapsArg);

    if (byPlayer) {
      if (
        generalGameMode === GeneralGameMode.GENERAL_QUALY ||
        gameMode == GameMode.TRAINING
      ) {
        sendErrorMessage(room, MESSAGES.LAPS_IN_QUALI(), byPlayer.id);
        return false;
      }

      if (room.getScores() !== null) {
        sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
        return false;
      }

      if (!isNaN(newLaps)) {
        if (newLaps < minPit + 2) {
          room.sendAnnouncement(
            `❌ Invalid value. With ${minPit} minimum pitstops, the race must have at least ${
              minPit + 2
            } laps.`,
            byPlayer.id
          );

          return false;
        }

        setLaps(newLaps);
        sendChatMessage(room, MESSAGES.LAPS_CHANGED_TO(newLaps), byPlayer.id);
        return true;
      } else {
        sendErrorMessage(room, MESSAGES.LAPS_USAGE(), byPlayer.id);
        return false;
      }
    } else {
      if (!isNaN(newLaps)) {
        if (newLaps < minPit + 2) {
          return false; // modo silencioso, se não foi jogador que chamou
        }
        setLaps(newLaps);
        return true;
      }
    }
  }
  return false;
}

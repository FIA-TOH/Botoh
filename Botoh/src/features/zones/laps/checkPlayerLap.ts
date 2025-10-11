import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { updatePositionList } from "../../changeGameState/race/positionList";
import { Teams } from "../../changeGameState/teams";
import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendSmallChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { presentationLap } from "../../commands/gameState/handlePresentationLapCommand";
import {
  getRunningPlayers,
  CHECK_IF_TROLLING,
  checkIfTrolling,
} from "../../utils";
import { checkBlueFlag } from "../handleSectorChange";
import { CIRCUITS, currentMapIndex } from "../maps";
import { ifInLapChangeZone } from "./handleLapChange";
import { processCompletedLap } from "./processCompleteLap";
import { resetLapData } from "./resetLapData";

export function checkPlayerLaps(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  if (presentationLap) return;

  const players = getRunningPlayers(playersAndDiscs);
  const circuit = CIRCUITS[currentMapIndex].info;
  const hasSector = !!circuit.sectorOne;

  players.forEach((pad) => {
    const p = pad.p;
    const playerData = playerList[p.id];
    const now = performance.now();
    const delta = (now - playerData.lastLapTimeUpdate) / 1000;
    playerData.lapTime += delta;
    playerData.sectorTimeCounter += delta;
    playerData.lastLapTimeUpdate = now;

    if (!ifInLapChangeZone(pad, room)) {
      playerData.lapChanged = false;
      return;
    }
    if (room.getScores().time === 0) {
      sendErrorMessage(room, MESSAGES.EARLY_LAP_ERROR(), p.id);
    }

    if (playerData.lapChanged) return;

    if (playerData.currentLap === 0) {
      if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
        sendSmallChatMessage(room, MESSAGES.STARTING_LAP(), p.id);
      } else if (generalGameMode === GeneralGameMode.GENERAL_QUALY) {
        sendSmallChatMessage(room, MESSAGES.STARTING_QUALY_LAP(), p.id);
      }
    }

    if (
      CHECK_IF_TROLLING &&
      checkIfTrolling(pad, circuit.finishLine.passingDirection)
    ) {
      sendErrorMessage(room, MESSAGES.TROLLING_DETECTED(), p.id);
      if (!hasSector) room.setPlayerTeam(p.id, Teams.SPECTATORS);
      return;
    }

    const completedLap = !hasSector || playerData.currentSector === 3;

    if (!completedLap) return;

    const currentLap = ++playerData.currentLap;
    playerData.lapChanged = true;

    if (currentLap > 1) processCompletedLap(pad, room, hasSector);

    resetLapData(playerData, p.id, room);

    if (
      generalGameMode !== GeneralGameMode.GENERAL_QUALY &&
      gameMode !== GameMode.TRAINING
    ) {
      updatePositionList(players, room);
      checkBlueFlag(p, room);
    }
  });
}

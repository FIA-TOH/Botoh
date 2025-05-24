import { Circuit } from "../../../circuits/Circuit";
import { sendAlertMessage, sendSuccessMessage } from "../../chat/chat";
import { setGhostMode } from "../../changePlayerState/ghost";
import {
  handleRREnabledCommand,
  qualyForPub,
} from "../../commands/handleCommands";
import { CIRCUITS, handleChangeMap } from "../../zones/maps";
import { MESSAGES } from "../../chat/messages";
import { resetPlayers } from "../../changePlayerState/players";
import { changeGameMode, GameMode } from "../changeGameModes";
import { resetVotes } from "./resetVote";
import {
  announceSelectedCircuits,
  getWinningCircuit,
} from "./circuitSelection";

export let isOnVoteSession = false;
export let selectedCircuits: Circuit[] = [];

export function voteSession(room: RoomObject) {
  if (isOnVoteSession) {
    console.log("Sessão de votação já em andamento.");
    return;
  }

  isOnVoteSession = true;
  const players = room.getPlayerList();

  selectedCircuits = [...CIRCUITS].sort(() => Math.random() - 0.5).slice(0, 3);

  sendAlertMessage(room, MESSAGES.TIME_TO_VOTE());
  announceSelectedCircuits(room);
  resetVotes(players);

  setTimeout(() => {
    const winnerCircuit = getWinningCircuit();
    const winnerInfo = winnerCircuit.info;

    sendSuccessMessage(
      room,
      MESSAGES.CIRCUIT_CHOOSED(
        winnerInfo?.name || "Nome não definido",
        winnerInfo?.Votes ?? 0
      )
    );

    if (winnerInfo.BestTime && winnerInfo.BestTime.length > 1) {
      room.sendAnnouncement(
        `Recorde: ${winnerInfo.BestTime[0]} - ${winnerInfo.BestTime[1]}`
      );
    }

    const winnerIndex = CIRCUITS.findIndex(
      (c) => c.info?.name === winnerInfo?.name
    );

    resetVotes(players);
    isOnVoteSession = false;

    if (winnerIndex !== -1) {
      handleChangeMap(winnerIndex, room);
      resetPlayers(room);

      if (qualyForPub) {
        changeGameMode(GameMode.QUALY, room);
        setGhostMode(room, true);
        handleRREnabledCommand(undefined, ["true"], room);
      }

      room.startGame();
    } else {
      console.log("Circuito vencedor não encontrado no array CIRCUITS.");
    }
  }, 20000);
}

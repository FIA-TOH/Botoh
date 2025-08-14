import { Circuit } from "../../../circuits/Circuit";
import { sendAlertMessage, sendSuccessMessage } from "../../chat/chat";
import { CIRCUITS, handleChangeMap } from "../../zones/maps";
import { MESSAGES } from "../../chat/messages";
import { resetVotes } from "./resetVote";
import {
  announceSelectedCircuits,
  getWinningCircuit,
} from "./circuitSelection";
import { log } from "../../discord/logger";
import { lastWinningVotes } from "../publicGameFlow/publicGameFLow";

export let isOnVoteSession = false;
export let selectedCircuits: Circuit[] = [];

export function voteSession(room: RoomObject) {
  if (isOnVoteSession) {
    return;
  }

  isOnVoteSession = true;
  const players = room.getPlayerList();

  selectedCircuits = [...CIRCUITS]
    .slice(0, -2)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  sendAlertMessage(room, MESSAGES.TIME_TO_VOTE());
  announceSelectedCircuits(room);
  resetVotes(players);
}

export function changeMapBasedOnVote(
  room: RoomObject,
  dontAnnouceVotes?: boolean
) {
  const winnerCircuit = getWinningCircuit();
  const winnerInfo = winnerCircuit.info;
  const players = room.getPlayerList();

  const winnerIndex = CIRCUITS.findIndex(
    (c) => c.info?.name === winnerInfo?.name
  );

  resetVotes(players);
  isOnVoteSession = false;

  if (winnerIndex !== -1) {
    handleChangeMap(winnerIndex, room);
  } else {
    log("Circuito vencedor não encontrado no array CIRCUITS.");
  }
  if (!dontAnnouceVotes) {
    sendSuccessMessage(
      room,
      MESSAGES.CIRCUIT_CHOOSED(
        winnerInfo?.name || "Name not defined",
        lastWinningVotes ?? 0
      )
    );
  }

  if (winnerInfo.BestTime && winnerInfo.BestTime.length > 1) {
    room.sendAnnouncement(
      `Best Time: ${winnerInfo.BestTime[0]} - ${winnerInfo.BestTime[1]}`
    );
  }
}

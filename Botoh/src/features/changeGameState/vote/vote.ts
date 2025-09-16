import { Circuit } from "../../../circuits/Circuit";
import { sendAlertMessage, sendSuccessMessage } from "../../chat/chat";
import { CIRCUITS, handleChangeMap } from "../../zones/maps";
import { MESSAGES } from "../../chat/messages";
import { resetVotes } from "./resetVote";
import {
  announceSelectedCircuits,
  clearLockedWinner,
  finalizeVoteAndLockWinner,
  getWinnerCircuit,
  getLockedWinnerVotes,
} from "./circuitSelection";
import { log } from "../../discord/logger";

export let isOnVoteSession = false;
export let selectedCircuits: Circuit[] = [];

export function voteSession(room: RoomObject) {
  if (isOnVoteSession) return;

  isOnVoteSession = true;

  clearLockedWinner();

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
  let winnerCircuit: Circuit;
  try {
    winnerCircuit = getWinnerCircuit();
  } catch {
    winnerCircuit = finalizeVoteAndLockWinner();
  }

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
    log("Circuit not found on the array.");
  }

  if (!dontAnnouceVotes) {
    const wonVotes = getLockedWinnerVotes();
    sendSuccessMessage(
      room,
      MESSAGES.CIRCUIT_CHOOSED(
        winnerInfo?.name || "Name not defined",
        wonVotes ?? 0
      )
    );
  }

  if (winnerInfo.BestTime && winnerInfo.BestTime.length > 1) {
    log(`Best Time: ${winnerInfo.BestTime[0]} - ${winnerInfo.BestTime[1]}`);
    room.sendAnnouncement(
      `Best Time: ${winnerInfo.BestTime[0]} - ${winnerInfo.BestTime[1]}`
    );
  }
}

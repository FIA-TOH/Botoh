import { Circuit } from "../../../circuits/Circuit";
import { log } from "../../discord/logger";
import { CIRCUITS } from "../../zones/maps";
import { selectedCircuits } from "./vote";

let lockedWinner: Circuit | null = null;
let lockedWinnerVotes: number = 0;

export function announceSelectedCircuits(room: RoomObject) {
  selectedCircuits.forEach((circuit, index) => {
    log(`${index + 1}: ${circuit.info?.name || "Name not defined"}`);
    room.sendAnnouncement(
      `${index + 1}: ${circuit.info?.name || "Name not defined"}`
    );
  });
}

export function clearLockedWinner() {
  lockedWinner = null;
  lockedWinnerVotes = 0;
}

function computeWinningCircuit(): Circuit {
  if (selectedCircuits.length === 0) {
    throw new Error("No circuit avaiable to the vote.");
  }
  const maxVotes = Math.max(...selectedCircuits.map((c) => c.info?.Votes ?? 0));
  const tied = selectedCircuits.filter(
    (c) => (c.info?.Votes ?? 0) === maxVotes
  );
  return tied[Math.floor(Math.random() * tied.length)];
}

export function finalizeVoteAndLockWinner(): Circuit {
  const winner = computeWinningCircuit();
  lockedWinner = winner;
  lockedWinnerVotes = winner.info?.Votes ?? 0;
  return winner;
}
export function getWinnerCircuit(): Circuit {
  if (!lockedWinner)
    throw new Error(
      "Vencedor ainda não definido (finalizeVoteAndLockWinner não foi chamado)."
    );
  return lockedWinner;
}

export function getLockedWinnerVotes(): number {
  return lockedWinnerVotes;
}

export function postNewLockedWinner(circuitIndex: number) {
  lockedWinner = CIRCUITS[circuitIndex];
}

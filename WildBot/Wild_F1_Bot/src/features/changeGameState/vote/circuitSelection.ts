import { Circuit } from "../../../circuits/Circuit";
import { selectedCircuits } from "./vote";

export function announceSelectedCircuits(room: RoomObject) {
  selectedCircuits.forEach((circuit, index) => {
    room.sendAnnouncement(
      `${index + 1}: ${circuit.info?.name || "Nome não definido"}`
    );
  });
}

export function getWinningCircuit(): Circuit {
  return selectedCircuits.reduce((prev, curr) => {
    if (!prev.info || !curr.info) return prev;
    return (prev.info.Votes ?? 0) >= (curr.info.Votes ?? 0) ? prev : curr;
  });
}

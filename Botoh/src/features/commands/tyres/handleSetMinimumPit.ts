import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { defineMinimumPitStops } from "../../tires&pits/minimumPit";
import { laps } from "../../zones/laps";

export let minPit = 0;

export function handleSetMinimumPit(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (args.length === 0 || isNaN(Number(args[0]))) {
    room.sendAnnouncement(
      "Correct use: !set_minimum_pit [number]",
      byPlayer.id
    );
    return;
  }

  if (room.getScores() !== null) {
    sendChatMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
    return false;
  }
  minPit = Number(args[0]);

  if (minPit < 0) {
    room.sendAnnouncement(
      "❌ Invalid value. Minimum pitstops cannot be negative.",
      byPlayer.id
    );
    return;
  }

  if (minPit > laps - 2) {
    room.sendAnnouncement(
      `❌ Invalid value. With ${laps} laps, the maximum minimum pitstops allowed is ${
        laps - 2
      }.`,
      byPlayer.id
    );
    return;
  }

  defineMinimumPitStops(minPit);
  room.sendAnnouncement(`Now the minimum pit stops is ${minPit}`, byPlayer.id);
}

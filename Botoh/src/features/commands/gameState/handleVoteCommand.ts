import {
  isOnVoteSession,
  selectedCircuits,
} from "../../changeGameState/vote/vote";
import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleVoteCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!isOnVoteSession) {
    sendErrorMessage(room, MESSAGES.NOT_VOTE(), byPlayer.id);
  }
  if (playerList[byPlayer.id]?.voted) {
    sendErrorMessage(room, MESSAGES.ALREADY_VOTE(), byPlayer.id);
    return;
  }

  const voteIndex = Number(args[0]) - 1;

  if (voteIndex < 0 || voteIndex >= selectedCircuits.length || !args) {
    sendErrorMessage(room, MESSAGES.INVALIDE_VOTE(), byPlayer.id);
    return;
  }

  const selectedCircuit = selectedCircuits[voteIndex];
  if (selectedCircuit) {
    if (selectedCircuit.info) {
      selectedCircuit.info.Votes =
        (selectedCircuit.info.Votes ? selectedCircuit.info.Votes : 0) + 1;
    }
    if (playerList[byPlayer.id]) {
      playerList[byPlayer.id].voted = true;
    }

    sendSuccessMessage(
      room,
      MESSAGES.VOTED(selectedCircuit.info.name),
      byPlayer.id
    );
  } else {
    sendErrorMessage(room, MESSAGES.INVALIDE_VOTE(), byPlayer.id);
    return;
  }
}

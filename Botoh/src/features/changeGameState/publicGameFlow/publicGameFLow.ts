import { resetPlayers } from "../../changePlayerState/players";
import { sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { handleMuteCommand } from "../../commands/chat/handleMuteCommand";
import { handleExplainErsCommand } from "../../commands/ersAndFuel/handleExplainErsCommand";
import { qualyForPub } from "../../commands/gameMode/qualy/handleEnableQualyForPub";
import { handleExplainRainCommand } from "../../commands/rain/handleExplainRainCommand";
import { handleExplainTyresCommand } from "../../commands/tyres/handleExplainTyresCommand";
import {
  sendQualiResultsToDiscord,
  sendRaceResultsToDiscord,
} from "../../discord/logResults";
import { sendDiscordMessage } from "../../discord/sendDiscordLink";
import { movePlayersToCorrectSide } from "../../movePlayers/movePlayerToCorrectSide";
import {
  reorderPlayersByRacePosition,
  reorderPlayersInRoomRace,
} from "../../movePlayers/reorderPlayersInRoom";
import { tyresActivated } from "../../tires&pits/tires";
// import { rainEnabled } from "../../rain/rain";
import { delay } from "../../utils";
import { CIRCUITS, handleChangeMap } from "../../zones/maps";
import {
  changeGameMode,
  GameMode,
  gameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameModes";
import { changeGameStoppedNaturally } from "../gameStopeedNaturally";
import { printAllTimes } from "../qualy/printAllTimes";
import { printAllPositions } from "../race/printAllPositions";
import {
  finalizeVoteAndLockWinner,
  getLockedWinnerVotes,
} from "../vote/circuitSelection";
import { changeMapBasedOnVote, voteSession } from "../vote/vote";

export let lastWinningVotes: number = 0;

export default async function PublicGameFlow(room: RoomObject) {
  const waitRoomIndex = CIRCUITS.findIndex(
    (c) => c.info?.name === "Wait Room - By Ximb"
  );
  const waitRoomQualyIndex = CIRCUITS.findIndex(
    (c) => c.info?.name === "Wait Qualy Room - By Ximb"
  );

  if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
    sendRaceResultsToDiscord();
    printAllPositions(room);
    resetPlayers(room);
    reorderPlayersByRacePosition(room);
    changeGameMode(GameMode.WAITING, room);

    handleChangeMap(waitRoomIndex, room);
    room.startGame();
    await delay(5);

    voteSession(room);
    await delay(10);

    sendDiscordMessage(room);

    await delay(10);

    handleMuteCommand(undefined, undefined, room);
    if (tyresActivated) {
      handleExplainTyresCommand(undefined, undefined, room);
      await delay(5);
    }
    // if (rainEnabled) {
    //   handleExplainRainCommand(undefined, undefined, room);
    //   await delay(5);
    // }
    handleExplainErsCommand(undefined, undefined, room);
    await delay(5);

    if (qualyForPub) {
      sendChatMessage(room, MESSAGES.QUALY_STARTING(15));
    } else {
      sendChatMessage(room, MESSAGES.RACE_STARTING(15));
    }
    await delay(3);

    handleMuteCommand(undefined, undefined, room);
    await delay(12);

    const winnerCircuit = finalizeVoteAndLockWinner();
    lastWinningVotes = getLockedWinnerVotes();

    changeGameStoppedNaturally(true);
    room.stopGame();
    await delay(1);

    changeMapBasedOnVote(room);
    resetPlayers(room);

    if (qualyForPub) {
      changeGameMode(GameMode.QUALY, room);
    } else {
      changeGameMode(GameMode.RACE, room);
    }
    room.startGame();
    return;
  }

  if (generalGameMode === GeneralGameMode.GENERAL_QUALY) {
    sendQualiResultsToDiscord();
    printAllTimes(room);
    reorderPlayersInRoomRace(room);
    movePlayersToCorrectSide();
    resetPlayers(room);
    changeGameMode(GameMode.WAITING, room);

    handleChangeMap(waitRoomQualyIndex, room);
    room.startGame();
    await delay(5);

    sendDiscordMessage(room);
    await delay(10);

    handleMuteCommand(undefined, undefined, room);
    if (tyresActivated) {
      handleExplainTyresCommand(undefined, undefined, room);
      await delay(5);
    }
    // if (rainEnabled) {
    //   handleExplainRainCommand(undefined, undefined, room);
    //   await delay(5);
    // }
    handleExplainErsCommand(undefined, undefined, room);
    await delay(5);

    sendChatMessage(room, MESSAGES.RACE_STARTING(5));
    handleMuteCommand(undefined, undefined, room);
    await delay(5);

    changeGameStoppedNaturally(true);
    room.stopGame();
    await delay(1);

    changeGameMode(GameMode.RACE, room);

    changeMapBasedOnVote(room, true);
    resetPlayers(room);

    room.startGame();
    return;
  }
}

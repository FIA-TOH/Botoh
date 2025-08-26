import { resetPlayers } from "../../changePlayerState/players";
import { sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { handleMuteCommand } from "../../commands/chat/handleMuteCommand";
import { handleExplainErsCommand } from "../../commands/ersAndFuel/handleExplainErsCommand";
import { qualyForPub } from "../../commands/gameMode/qualy/handleEnableQualyForPub";
import { handleExplainRainCommand } from "../../commands/rain/handleExplainRainCommand";
import { tyresActivated } from "../../commands/tyres/handleEnableTyresCommand";
import { handleExplainTyresCommand } from "../../commands/tyres/handleExplainTyresCommand";
import { movePlayersToCorrectSide } from "../../movePlayers/movePlayerToCorrectSide";
import {
  reorderPlayersByRacePosition,
  reorderPlayersInRoomRace,
} from "../../movePlayers/reorderPlayersInRoom";
import { rainEnabled } from "../../rain/rain";
import { cancellableDelay, delay } from "../../utils";
import { CIRCUITS, handleChangeMap } from "../../zones/maps";
import { changeGameMode, GameMode, gameMode } from "../changeGameModes";
import { changeGameStoppedNaturally } from "../gameStopeedNaturally";
import { printAllTimes } from "../qualy/printAllTimes";
import { printAllPositions } from "../race/printAllPositions";
import {
  finalizeVoteAndLockWinner,
  getLockedWinnerVotes,
} from "../vote/circuitSelection";
import { changeMapBasedOnVote, voteSession } from "../vote/vote";

export let lastWinningVotes: number = 0;

export default async function PublicGameFlow(
  room: RoomObject,
  cancelToken: { cancelled: boolean }
) {
  const waitRoomIndex = CIRCUITS.findIndex(
    (c) => c.info?.name === "Wait Room - By Ximb"
  );
  const waitRoomQualyIndex = CIRCUITS.findIndex(
    (c) => c.info?.name === "Wait Qualy Room - By Ximb"
  );

  function checkCancel() {
    if (cancelToken.cancelled) throw new Error("Flow cancelled");
  }

  if (gameMode === GameMode.RACE) {
    printAllPositions(room);
    resetPlayers(room);
    reorderPlayersByRacePosition(room);
    changeGameMode(GameMode.WAITING, room);

    handleChangeMap(waitRoomIndex, room);
    room.startGame();
    await cancellableDelay(5, cancelToken);
    checkCancel();

    voteSession(room);
    await cancellableDelay(10, cancelToken);
    checkCancel();

    sendChatMessage(room, MESSAGES.DISCORD_INVITE());
    await cancellableDelay(10, cancelToken);
    checkCancel();

    handleMuteCommand(undefined, undefined, room);
    if (tyresActivated) {
      handleExplainTyresCommand(undefined, undefined, room);
      await cancellableDelay(5, cancelToken);
      checkCancel();
    }
    if (rainEnabled) {
      handleExplainRainCommand(undefined, undefined, room);
      await cancellableDelay(5, cancelToken);
      checkCancel();
    }
    handleExplainErsCommand(undefined, undefined, room);
    await cancellableDelay(5, cancelToken);
    checkCancel();

    if (qualyForPub) {
      sendChatMessage(room, MESSAGES.QUALY_STARTING(15));
    } else {
      sendChatMessage(room, MESSAGES.RACE_STARTING(15));
    }
    await cancellableDelay(3, cancelToken);
    checkCancel();

    handleMuteCommand(undefined, undefined, room);
    await cancellableDelay(12, cancelToken);
    checkCancel();

    const winnerCircuit = finalizeVoteAndLockWinner();
    lastWinningVotes = getLockedWinnerVotes();

    changeGameStoppedNaturally(true);
    room.stopGame();
    await cancellableDelay(1, cancelToken);
    checkCancel();

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

  if (gameMode === GameMode.QUALY) {
    printAllTimes(room);
    reorderPlayersInRoomRace(room);
    movePlayersToCorrectSide();
    resetPlayers(room);
    changeGameMode(GameMode.WAITING, room);

    handleChangeMap(waitRoomQualyIndex, room);
    room.startGame();
    await cancellableDelay(5, cancelToken);
    checkCancel();

    sendChatMessage(room, MESSAGES.DISCORD_INVITE());
    await cancellableDelay(10, cancelToken);
    checkCancel();

    handleMuteCommand(undefined, undefined, room);
    if (tyresActivated) {
      handleExplainTyresCommand(undefined, undefined, room);
      await cancellableDelay(5, cancelToken);
      checkCancel();
    }
    if (rainEnabled) {
      handleExplainRainCommand(undefined, undefined, room);
      await cancellableDelay(5, cancelToken);
      checkCancel();
    }
    handleExplainErsCommand(undefined, undefined, room);
    await cancellableDelay(5, cancelToken);
    checkCancel();

    sendChatMessage(room, MESSAGES.RACE_STARTING(5));
    handleMuteCommand(undefined, undefined, room);
    await cancellableDelay(5, cancelToken);
    checkCancel();

    changeGameStoppedNaturally(true);
    room.stopGame();
    await cancellableDelay(1, cancelToken);
    checkCancel();

    changeGameMode(GameMode.RACE, room);

    changeMapBasedOnVote(room, true);
    resetPlayers(room);

    room.startGame();
    return;
  }
}

import { resetPlayers } from "../../changePlayerState/players";
import { COLORS, sendSmallChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { changeLaps } from "../../commands/adminThings/handleChangeLaps";
import { handleMuteCommand } from "../../commands/chat/handleMuteCommand";
import { handleExplainErsCommand } from "../../commands/ersAndFuel/handleExplainErsCommand";
import { qualyForPub } from "../../commands/gameMode/qualy/handleEnableQualyForPub";
import { printAllTimes } from "../../commands/gameMode/qualy/printAllTimes";
import { printAllPositions } from "../../commands/gameMode/race/printAllPositions";
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
import {
  sendDeferredPublicCompetitionNotifications,
  settlePublicQualyRanking,
  settlePublicRaceChampionship,
} from "../../public/publicCompetition";
import { tyresActivated } from "../../tires&pits/tires";
import { delay } from "../../utils";
import { DEFAULT_LAPS } from "../../zones/laps";
import { CIRCUITS, getLastPublicRaceMapIndex, handleChangeMap } from "../../zones/maps";
import {
  changeGameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameModes";
import { changeGameStoppedNaturally } from "../gameStopeedNaturally";
import {
  finalizeVoteAndLockWinner,
  getLockedWinnerVotes,
} from "../vote/circuitSelection";
import { cancelVoteSession, changeMapBasedOnVote, voteSession } from "../vote/vote";

const WAIT_ROOM_NAME = "Wait Room - By Ximb";
const WAIT_QUALY_ROOM_NAME = "Wait Qualy Room - By Ximb";

export let lastWinningVotes: number = 0;

function getCircuitIndexByName(name: string) {
  return CIRCUITS.findIndex((circuit) => circuit.info?.name === name);
}

function hasPlayers(room: RoomObject) {
  return room.getPlayerList().length > 0;
}

function shouldPausePublicFlow(room: RoomObject) {
  if (hasPlayers(room)) return false;

  cancelVoteSession(room);
  return true;
}

async function waitIfPlayersRemain(room: RoomObject, seconds: number) {
  await delay(seconds);
  return !shouldPausePublicFlow(room);
}

function enterWaitingRoom(room: RoomObject, circuitIndex: number) {
  changeGameMode(GameMode.WAITING, room);
  handleChangeMap(circuitIndex, room);
  room.startGame();
}

async function sendPublicRoomInfo(room: RoomObject) {
  sendDiscordMessage(room);
  if (!(await waitIfPlayersRemain(room, 10))) return false;

  if (tyresActivated) {
    handleMuteCommand(undefined, undefined, room);
    handleExplainTyresCommand(undefined, undefined, room);
    if (!(await waitIfPlayersRemain(room, 5))) return false;

    handleExplainErsCommand(undefined, undefined, room);
    return waitIfPlayersRemain(room, 5);
  }

  handleExplainErsCommand(undefined, undefined, room);
  return waitIfPlayersRemain(room, 10);
}

function announceNextSession(room: RoomObject, seconds: number) {
  const message = qualyForPub
    ? MESSAGES.QUALY_STARTING(seconds)
    : MESSAGES.RACE_STARTING(seconds);

  sendSmallChatMessage(room, message, undefined, COLORS.DARK_BROWN);
}

async function stopCurrentGame(room: RoomObject) {
  changeGameStoppedNaturally(true);
  room.stopGame();
  return waitIfPlayersRemain(room, 1);
}

function startRaceMode(room: RoomObject) {
  changeLaps(String(DEFAULT_LAPS), undefined, room);
  changeGameMode(GameMode.RACE, room);
}

function lockVoteWinner() {
  finalizeVoteAndLockWinner();
  lastWinningVotes = getLockedWinnerVotes();
}

function startNextSessionFromLockedVote(room: RoomObject) {
  changeMapBasedOnVote(room);
  resetPlayers(room);

  if (qualyForPub) {
    changeGameMode(GameMode.QUALY, room);
  } else {
    startRaceMode(room);
  }

  room.startGame();
}

function startRaceAfterQualy(room: RoomObject) {
  startRaceMode(room);

  try {
    changeMapBasedOnVote(room, true);
  } catch (error) {
    handleChangeMap(getLastPublicRaceMapIndex(), room);
  }

  resetPlayers(room);
  room.startGame();
}

function showRaceResults(room: RoomObject) {
  sendRaceResultsToDiscord();
  printAllPositions(room);

  resetPlayers(room);
  reorderPlayersByRacePosition(room);
}

function showQualyResults(room: RoomObject) {
  sendQualiResultsToDiscord();
  printAllTimes(room);

  reorderPlayersInRoomRace(room);
  movePlayersToCorrectSide();
  resetPlayers(room);
}

async function runRaceToNextSessionFlow(room: RoomObject) {
  const raceNotifications = await settlePublicRaceChampionship(room, {
    deferMessages: true,
  });
  showRaceResults(room);
  enterWaitingRoom(room, getCircuitIndexByName(WAIT_ROOM_NAME));
  if (!(await waitIfPlayersRemain(room, 1))) return;

  sendDeferredPublicCompetitionNotifications(room, raceNotifications);
  if (!(await waitIfPlayersRemain(room, 4))) return;

  voteSession(room);
  if (!(await waitIfPlayersRemain(room, 10))) return;
  if (!(await sendPublicRoomInfo(room))) return;

  announceNextSession(room, 15);
  if (!(await waitIfPlayersRemain(room, 3))) return;

  if (tyresActivated) {
    handleMuteCommand(undefined, undefined, room);
  }
  if (!(await waitIfPlayersRemain(room, 12))) return;

  lockVoteWinner();
  if (!(await stopCurrentGame(room))) return;

  startNextSessionFromLockedVote(room);
}

async function runQualyToRaceFlow(room: RoomObject) {
  const qualyNotifications = await settlePublicQualyRanking(room, {
    deferMessages: true,
  });
  showQualyResults(room);
  enterWaitingRoom(room, getCircuitIndexByName(WAIT_QUALY_ROOM_NAME));
  if (!(await waitIfPlayersRemain(room, 1))) return;

  sendDeferredPublicCompetitionNotifications(room, qualyNotifications);
  if (!(await waitIfPlayersRemain(room, 4))) return;

  if (!(await sendPublicRoomInfo(room))) return;

  sendSmallChatMessage(room, MESSAGES.RACE_STARTING(5), undefined, COLORS.DARK_BROWN);
  if (tyresActivated) {
    handleMuteCommand(undefined, undefined, room);
  }
  if (!(await waitIfPlayersRemain(room, 5))) return;
  if (!(await stopCurrentGame(room))) return;

  startRaceAfterQualy(room);
}

export default async function PublicGameFlow(room: RoomObject) {
  if (shouldPausePublicFlow(room)) return;

  if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
    await runRaceToNextSessionFlow(room);
    return;
  }

  if (generalGameMode === GeneralGameMode.GENERAL_QUALY) {
    await runQualyToRaceFlow(room);
  }
}

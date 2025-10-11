import { setGhostMode } from "../changePlayerState/ghost";
import { sendSuccessMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { changeLaps } from "../commands/adminThings/handleChangeLaps";
import { handleRREnabledCommand } from "../commands/adminThings/handleRREnabledCommand";
import {
  handleEnableTyresCommand,
  tyresActivated,
} from "../commands/tyres/handleEnableTyresCommand";
import { enableGas, enableSlipstream } from "../speed/handleSlipstream";
import HandleTireWear from "../tires&pits/handleTireWear";
import { laps } from "../zones/laps";
import { qualiTime, raceTime } from "./qualy/qualiMode";

export enum GameMode {
  RACE = "race",
  QUALY = "qualy",
  TRAINING = "training",
  INDY = "indy",
  WAITING = "waiting",
  HARD_QUALY = "hard_qualy",
}

export enum GeneralGameMode {
  GENERAL_RACE = "general_race",
  GENERAL_QUALY = "general_qualy",
  NONE = "none",
}

export let gameMode: GameMode = GameMode.RACE;
export let generalGameMode: GeneralGameMode = GeneralGameMode.GENERAL_RACE;

export function changeGameMode(newMode: GameMode, room: RoomObject) {
  gameMode = newMode;
  const timeLimit = newMode === GameMode.QUALY ? qualiTime : raceTime;
  room.setTimeLimit(timeLimit);

  switch (newMode) {
    case GameMode.QUALY:
      return handleQualyMode(room);
    case GameMode.TRAINING:
      return handleTrainingMode(room);
    case GameMode.INDY:
      return handleIndyMode(room);
    case GameMode.WAITING:
      return handleWaintingRoom(room);
    case GameMode.RACE:
      return handleRaceMode(room);
    case GameMode.HARD_QUALY:
      return handleHardQualyMode(room);
  }
}

export function changeGeneralGameMode(newGeneralMode: GeneralGameMode) {
  generalGameMode = newGeneralMode;
}

function handleQualyMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, true);
  handleRREnabledCommand(undefined, ["true"], room);
  handleEnableTyresCommand(undefined, ["true"], room);
  sendSuccessMessage(room, MESSAGES.TIME_TO_QUALY());
  changeGeneralGameMode(GeneralGameMode.GENERAL_QUALY);
}

function handleTrainingMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, true);
  handleRREnabledCommand(undefined, ["true"], room);
  changeLaps("999", undefined, room);
  handleEnableTyresCommand(undefined, ["true"], room);
  changeGeneralGameMode(GeneralGameMode.NONE);
}

function handleIndyMode(room: RoomObject) {
  enableGas(true);
  enableSlipstream(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  handleEnableTyresCommand(undefined, ["true"], room);
  changeGeneralGameMode(GeneralGameMode.GENERAL_RACE);
}

function handleRaceMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(true);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  handleEnableTyresCommand(undefined, ["true"], room);
  sendSuccessMessage(room, MESSAGES.TIME_TO_RACE(laps));
  changeGeneralGameMode(GeneralGameMode.GENERAL_RACE);
}

function handleWaintingRoom(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  handleEnableTyresCommand(undefined, ["false"], room);
  changeGeneralGameMode(GeneralGameMode.NONE);
}

function handleHardQualyMode(room: RoomObject) {
  room.sendAnnouncement("⚠️ Hard Qualy Mode Activated ⚠️");

  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  handleEnableTyresCommand(undefined, ["false"], room);
  sendSuccessMessage(room, MESSAGES.TIME_TO_QUALY());
  changeGeneralGameMode(GeneralGameMode.GENERAL_QUALY);
}

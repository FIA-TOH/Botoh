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
}

export let gameMode: GameMode = GameMode.RACE;

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
  }
}

function handleQualyMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, true);
  handleRREnabledCommand(undefined, ["true"], room);
  sendSuccessMessage(room, MESSAGES.TIME_TO_QUALY());
  handleEnableTyresCommand(undefined, ["true"], room);
}

function handleTrainingMode(room: RoomObject) {
  enableGas(false);
  setGhostMode(room, true);
  enableSlipstream(false);
  changeLaps("999", undefined, room);
  handleRREnabledCommand(undefined, ["true"], room);
  handleEnableTyresCommand(undefined, ["true"], room);
}

function handleIndyMode(room: RoomObject) {
  enableGas(true);
  setGhostMode(room, false);
  enableSlipstream(true);
  handleRREnabledCommand(undefined, ["false"], room);
  handleEnableTyresCommand(undefined, ["true"], room);
}

function handleRaceMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  sendSuccessMessage(room, MESSAGES.TIME_TO_RACE(laps));
  handleEnableTyresCommand(undefined, ["true"], room);
}

function handleWaintingRoom(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  handleEnableTyresCommand(undefined, ["false"], room);
}

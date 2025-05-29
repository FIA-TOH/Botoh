import { sendSuccessMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { changeLaps } from "../commands/adminThings/handleChangeLaps";
import { enableGas, enableSlipstream } from "../speed/handleSlipstream";
import { laps } from "../zones/laps";
import { qualiTime, raceTime } from "./qualy/qualiMode";

export enum GameMode {
  RACE = "race",
  QUALY = "qualy",
  TRAINING = "training",
  INDY = "indy",
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
    case GameMode.RACE:
      return handleRaceMode(room);
  }
}

function handleQualyMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  sendSuccessMessage(room, MESSAGES.TIME_TO_QUALY());
}

//to-do: melhorar a mensagem de quando muda o modo
function handleTrainingMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  changeLaps("999", undefined, room);
  room.sendAnnouncement("Training mode on");
}

function handleIndyMode(room: RoomObject) {
  enableGas(true);
  enableSlipstream(true);
  room.sendAnnouncement("Indy mode on");
}

function handleRaceMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  sendSuccessMessage(room, MESSAGES.TIME_TO_RACE(laps));
}

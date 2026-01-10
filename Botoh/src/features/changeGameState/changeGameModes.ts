import { setGhostMode } from "../changePlayerState/ghost";
import { sendSuccessMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { changeLaps } from "../commands/adminThings/handleChangeLaps";
import { handleRREnabledCommand } from "../commands/adminThings/handleRREnabledCommand";
import { qualiTime, raceTime } from "../commands/gameMode/qualy/qualiMode";

import { enableGas, enableSlipstream } from "../speed/handleSlipstream";
import { enableTyres } from "../tires&pits/tires";
import { laps } from "../zones/laps";
import { CIRCUITS, currentMapIndex } from "../zones/maps";

export enum GameMode {
  RACE = "race",
  QUALY = "qualy",
  TRAINING = "training",
  INDY = "indy",
  WAITING = "waiting",
  HARD_QUALY = "hard_qualy",
  BATTLE_ROYALE = "battle_royale",
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

  let result;

  switch (newMode) {
    case GameMode.QUALY:
      result = handleQualyMode(room);
      break;
    case GameMode.TRAINING:
      result = handleTrainingMode(room);
      break;
    case GameMode.INDY:
      result = handleIndyMode(room);
      break;
    case GameMode.WAITING:
      result = handleWaintingRoom(room);
      break;
    case GameMode.RACE:
      result = handleRaceMode(room);
      break;
    case GameMode.HARD_QUALY:
      result = handleHardQualyMode(room);
      break;
    case GameMode.BATTLE_ROYALE:
      result = handleBattleRoyaleMode(room);
      break;
  }

  room.setCustomStadium(CIRCUITS[currentMapIndex].map);

  return result;
}

export function changeGeneralGameMode(newGeneralMode: GeneralGameMode) {
  generalGameMode = newGeneralMode;
}

function handleQualyMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, true);
  handleRREnabledCommand(undefined, ["true"], room);
  enableTyres(true);
  sendSuccessMessage(room, MESSAGES.TIME_TO_QUALY());
  changeGeneralGameMode(GeneralGameMode.GENERAL_QUALY);
}

function handleTrainingMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, true);
  handleRREnabledCommand(undefined, ["true"], room);
  changeLaps("999", undefined, room);
  enableTyres(true);
  changeGeneralGameMode(GeneralGameMode.NONE);
}

function handleIndyMode(room: RoomObject) {
  enableGas(true);
  enableSlipstream(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  enableTyres(true);
  changeGeneralGameMode(GeneralGameMode.GENERAL_RACE);
}

function handleRaceMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(true);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  enableTyres(true);
  sendSuccessMessage(room, MESSAGES.TIME_TO_RACE(laps));
  changeGeneralGameMode(GeneralGameMode.GENERAL_RACE);
}

function handleWaintingRoom(room: RoomObject) {
  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  enableTyres(false);
  changeGeneralGameMode(GeneralGameMode.NONE);
}

function handleHardQualyMode(room: RoomObject) {
  room.sendAnnouncement("⚠️ Hard Qualy Mode Activated ⚠️");

  enableGas(false);
  enableSlipstream(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  enableTyres(false);
  sendSuccessMessage(room, MESSAGES.TIME_TO_QUALY());
  changeGeneralGameMode(GeneralGameMode.GENERAL_QUALY);
}

function handleBattleRoyaleMode(room: RoomObject) {
  enableGas(false);
  enableSlipstream(true);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  enableTyres(false);
  sendSuccessMessage(room, MESSAGES.TIME_TO_RACE(laps));
  changeGeneralGameMode(GeneralGameMode.GENERAL_RACE);
}

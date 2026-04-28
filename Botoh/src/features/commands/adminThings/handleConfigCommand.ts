import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES, getPlayerLanguage } from "../../chat/messages";
import { setGhostMode } from "../../changePlayerState/ghost";
import { getGameState } from "../../changeGameState/gameState";
import { enableDebris } from "../../debris/enableDebris";
import {
  enableCutPenalty,
  enableSoftCutPenalty,
} from "../../detectCut/enableCutPenalty";
import { log } from "../../discord/logger";
import { enableErs, enableErsPenalty } from "../../speed/fuel&Ers/ers";
import { enableGas, enableSlipstream } from "../../speed/handleSlipstream";
import { setBlowoutTyresActivated } from "../../tires&pits/tireBlowManager";
import { enableTyres } from "../../tires&pits/tires";
import { handleRREnabledCommand } from "./handleRREnabledCommand";
import { handleSpeedCommand } from "../avatar/handleSpeedCommand";
import { handleSafetyCommand } from "../flagsAndVSC/handleSafetyCommand";
import { handleRModeCommand } from "../gameMode/race/handleRModeCommand";
import { handlePitCommand } from "./handlePitCommand";
import { setManageTyresEnabled } from "./handleManageTyresCommand";
import { handlePresentationLapCommand } from "../gameState/handlePresentationLapCommand";


export function handleConfigCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
    const gameState = getGameState();
    if (gameState === "running") {
      sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id);
      return;
    }
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.ADMIN_ONLY(), byPlayer.id);
    return;
  }

  if (!args[0]) {
    sendErrorMessage(room, MESSAGES.CONFIG_MISSING_ARGUMENT(), byPlayer.id);
    return;
  }

  const configType = args[0].toLowerCase();
  const validConfigs = ['ftoh', 'fh', 'haxbula'];

  if (!validConfigs.includes(configType)) {
    sendErrorMessage(room, MESSAGES.CONFIG_INVALID_ARGUMENT(), byPlayer.id);
    return;
  }

  if (configType === 'ftoh') {
    applyFTOHConfig(room, byPlayer);
  } else if (configType === 'fh') {
    applyFHConfig(room, byPlayer);
  } else if (configType === 'haxbula') {
    applyHaxbulaConfig(room, byPlayer);
  }

  const message = MESSAGES.CONFIG_SUCCESS(configType);
  const playerLang = getPlayerLanguage(byPlayer.id);
  room.sendAnnouncement(message[playerLang as keyof typeof message], byPlayer.id, 0x00FF00, "bold");
}

function applyFTOHConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`FTOH configuration applied by ${byPlayer.name}`);
  handleSafetyCommand(byPlayer, ["on"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(true);
  enableTyres(true);
  enableGas(false);
  setGhostMode(room, false);
  handlePresentationLapCommand(undefined, ["off"], room);
  setBlowoutTyresActivated(true);
  enableErs(true);
  enableErsPenalty(true);
  enableCutPenalty(true);
  enableDebris(true);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["new"], room);
  setManageTyresEnabled(true);
}

function applyFHConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`FH configuration applied by ${byPlayer.name}`);
  handleSafetyCommand(byPlayer, ["off"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(true);
  enableTyres(true);
  enableGas(false);
  setGhostMode(room, false);
  handlePresentationLapCommand(undefined, ["off"], room);
  setBlowoutTyresActivated(false);
  enableErs(false);
  enableErsPenalty(true);
  enableCutPenalty(true);
  enableDebris(false);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["old"], room);
  setManageTyresEnabled(false);
}

function applyHaxbulaConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`Haxbula configuration applied by ${byPlayer.name}`);
  handleSafetyCommand(byPlayer, ["off"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(false);
  enableTyres(false);
  enableGas(false);
  setGhostMode(room, true);
  handlePresentationLapCommand(undefined, ["off"], room);
  setBlowoutTyresActivated(false);
  enableErs(false);
  enableErsPenalty(false);
  enableCutPenalty(false);
  enableDebris(false);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["old"], room);
  setManageTyresEnabled(false);
}

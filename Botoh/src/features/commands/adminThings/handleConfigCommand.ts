import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES, getPlayerLanguage } from "../../chat/messages";
import { setGhostMode } from "../../changePlayerState/ghost";
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

export function handleConfigCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
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
  handleSpeedCommand(byPlayer, ["false"], room);
  handleSafetyCommand(byPlayer, ["true"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(true);
  enableTyres(true);
  enableGas(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  setBlowoutTyresActivated(true);
  enableErs(true);
  enableErsPenalty(false);
  enableCutPenalty(true);
  enableDebris(true);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["new"], room);
}

function applyFHConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`FH configuration applied by ${byPlayer.name}`);
  handleSpeedCommand(byPlayer, ["false"], room);
  handleSafetyCommand(byPlayer, ["false"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(true);
  enableTyres(true);
  enableGas(false);
  setGhostMode(room, false);
  handleRREnabledCommand(undefined, ["false"], room);
  setBlowoutTyresActivated(false);
  enableErs(false);
  enableErsPenalty(true);
  enableCutPenalty(true);
  enableDebris(false);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["old"], room);
}

function applyHaxbulaConfig(room: RoomObject, byPlayer: PlayerObject) {
  log(`Haxbula configuration applied by ${byPlayer.name}`);
  handleSpeedCommand(byPlayer, ["false"], room);
  handleSafetyCommand(byPlayer, ["false"], room);
  handleRModeCommand(byPlayer, [], room);
  enableSlipstream(false);
  enableTyres(false);
  enableGas(false);
  setGhostMode(room, true);
  handleRREnabledCommand(undefined, ["false"], room);
  setBlowoutTyresActivated(false);
  enableErs(false);
  enableErsPenalty(false);
  enableCutPenalty(false);
  enableDebris(false);
  enableSoftCutPenalty(false, room);
  handlePitCommand(byPlayer, ["old"], room);
}

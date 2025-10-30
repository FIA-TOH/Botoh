import en_commands from "../../locales/commands/en";
import fr_commands from "../../locales/commands/fr";
import es_commands from "../../locales/commands/es";
import tr_commands from "../../locales/commands/tr";
import pt_commands from "../../locales/commands/pt";
import { Commands } from "./commands";

import { handleAdminCommand } from "./adminThings/handleAdminCommand";
import { handleCommandsCommand } from "./commands/handleCommandsCommand";
import { handleCircuitCommand } from "./circuits/handleCircuitCommand";
import { handleMapsCommand } from "./circuits/handleMapsCommands";
import { handleClearCommand } from "./laps/handleClearCommand";
import { handleAjustPlayerCommand } from "./adjustThings/handleAdjustPlayerCommand";
import { handleNerfListCommand } from "./adjustThings/handleNerfListCommand";
import { handleSpeedCommand } from "./avatar/handleSpeedCommand";
import { handleVoteCommand } from "./gameState/handleVoteCommand";
import { handleRecordCommand } from "./laps/handleRecordCommands";
import { handleVSCCommand } from "./flagsAndVSC/handleVSCCommand";
import { handleQModeCommand } from "./gameMode/qualy/handleQModeCommand";
import { handleTimesCommand } from "./gameMode/qualy/handleTimesCommand";
import { handlePositionsCommand } from "./gameMode/race/handlePositionsCommand";
import { handleTModeCommand } from "./gameMode/train/handleTModeCommand";
import { handleClearBansCommand } from "./adminThings/handleClearBansCommand";
import { handleBBCommand } from "./chat/handleBBCommand";
import { handleHelpCommand } from "./chat/handleHelpCommand";
import { handleIndyModeCommand } from "./gameMode/indy/handleIndyModeCommand";
import { handleQTimeCommand } from "./gameMode/qualy/handleQTimeCommand";
import { handleRModeCommand } from "./gameMode/race/handleRModeCommand";
import { handleWaitTimeCommand } from "./gameMode/race/handleWaitTimeCommand";
import { handleLapsCommand } from "./laps/handleLapsCommand";
import { handleTiresCommand } from "./tyres/handleTiresCommand";
import { handleClearTimeCommand } from "./adminThings/handleClearTimeCommand";
import { handleAfkCommand } from "./afk/handleAfkCommand";
import { handleAvatarCommand } from "./avatar/handleAvatarCommand";
import { handleLanguageCommand } from "./chat/handleLanguageCommand";
import { handleMuteCommand } from "./chat/handleMuteCommand";
import { handleEnableQualyForPub } from "./gameMode/qualy/handleEnableQualyForPub";
import { handleEndRainCommand } from "./rain/handleEndRainCommand";
import { handleRainCommand } from "./rain/handleRainCommand";
import { handleRainItensity } from "./rain/handleRainIntensity";
import { handleEnableTyresCommand } from "./tyres/handleEnableTyresCommand";
import { handleTipsCommands } from "./chat/handleTipsCommands";
import { handleExplainErsCommand } from "./ersAndFuel/handleExplainErsCommand";
import { handleFlagCommand } from "./flagsAndVSC/handleFlagCommand";
import { handlePresentationLapCommand } from "./gameState/handlePresentationLapCommand";
import { handleEveryoneLapsCommand } from "./laps/handleEveryoneLapsCommand";
import { handleExplainRainCommand } from "./rain/handleExplainRainCommand";
import { handleExplainTyresCommand } from "./tyres/handleExplainTyresCommand";
import { handleRREnabledCommand } from "./adminThings/handleRREnabledCommand";
import { handleTpCommand } from "./adminThings/handleTpCommand";
import { handleGasCommand } from "./ersAndFuel/handleGasCommand";
import { handleGhostCommand } from "./playerState/handleGhostCommand";
import { handleSlipstreamCommand } from "./speed/handleSlipstreamCommand";
import { handleChangePropierties } from "./adminThings/handleChangePropierties";
import { handleRRCommand } from "./playerState/handleRRCommand";
import { handleSeeTeams } from "./teams/handleSeeTeams";
import { handleSetTeam } from "./teams/handleSetTeam";
import { handleExplainServerCommand } from "./chat/handleExplainServerCommand";
import { handleDiscordCommand } from "../discord/handleDiscordCommand";
import { handleCameraPlayerFollow } from "./camera/handleCameraPlayerFollow";
import { handleCameraPositionFollow } from "./camera/handleCameraPositionFollow";
import { handleCameraProperties } from "./camera/handleCameraProperties";
import { handleChangeGameFLow } from "./gameState/gameFlow";
import { handleSetMinimumPit } from "./tyres/handleSetMinimumPit";
import { handleRejoinCommand } from "./comeBackRace/handleRejoinCommand";
import { handleMoveToBoxCommand } from "../comeBackRace.ts/moveToBox";
import { handlePlayerQuantity } from "./adminThings/handlePlayerQuantity";
import { handleLimitPlayerQuantity } from "./adminThings/handleLimitPlayerQuantity";
import { handleRRPositionCommand } from "./adminThings/handleRRPositionCommand";

export type CommandFunction = (
  handleAdminCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleCircuitCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleCommandsCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleMapsCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleSpeedCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleTimesCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handlePositionsCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleVSCCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleQModeCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleTModeCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleQTimeCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleRModeCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleBBCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleTiresCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleHelpCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleClearBansCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleLapsCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleWaitTimeCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleLanguageCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleAvatarCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleClearTimeCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleMuteCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleRainCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleSlipstreamCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleGasCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleGhostCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleRREnabledCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleRRCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleRainItensity: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleEndRainCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleAfkCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleEnableQualyForPub: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleEnableTyresCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleTipsCommands: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleExplainTyresCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleExplainServerCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleExplainRainCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleExplainErsCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleEveryoneLapsCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleTpCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleIndyModeCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleFlagCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleVoteCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleClearCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleRecordCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleAjustPlayerCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleNerfListCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handlePresentationLapCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleChangePropierties: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleSetTeam: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleSeeTeams: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleDiscordCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleCameraProperties: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleCameraPlayerFollow: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleCameraPositionFollow: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleChangeGameFLow: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleSetMinimumPit: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleRejoinCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleMoveToBoxCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handlePlayerQuantity: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleLimitPlayerQuantity: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void,
  handleRRPositionCommand: (
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) => void
) => Commands;

function importCommandsByLanguage(commandFunctions: {
  [key: string]: CommandFunction;
}): { [key: string]: Commands } {
  return Object.keys(commandFunctions).reduce(
    (acc, lang) => ({
      ...acc,
      [lang]: commandFunctions[lang](
        handleAdminCommand,
        handleCircuitCommand,
        handleCommandsCommand,
        handleMapsCommand,
        handleSpeedCommand,
        handleTimesCommand,
        handlePositionsCommand,
        handleVSCCommand,
        handleQModeCommand,
        handleTModeCommand,
        handleQTimeCommand,
        handleRModeCommand,
        handleBBCommand,
        handleTiresCommand,
        handleHelpCommand,
        handleClearBansCommand,
        handleLapsCommand,
        handleWaitTimeCommand,
        handleLanguageCommand,
        handleAvatarCommand,
        handleClearTimeCommand,
        handleMuteCommand,
        handleRainCommand,
        handleSlipstreamCommand,
        handleGasCommand,
        handleGhostCommand,
        handleRREnabledCommand,
        handleRRCommand,
        handleRainItensity,
        handleEndRainCommand,
        handleAfkCommand,
        handleEnableQualyForPub,
        handleEnableTyresCommand,
        handleTipsCommands,
        handleExplainTyresCommand,
        handleExplainServerCommand,
        handleExplainRainCommand,
        handleExplainErsCommand,
        handleEveryoneLapsCommand,
        handleTpCommand,
        handleIndyModeCommand,
        handleFlagCommand,
        handleVoteCommand,
        handleClearCommand,
        handleRecordCommand,
        handleAjustPlayerCommand,
        handleNerfListCommand,
        handlePresentationLapCommand,
        handleChangePropierties,
        handleSetTeam,
        handleSeeTeams,
        handleDiscordCommand,
        handleCameraProperties,
        handleCameraPlayerFollow,
        handleCameraPositionFollow,
        handleChangeGameFLow,
        handleSetMinimumPit,
        handleRejoinCommand,
        handleMoveToBoxCommand,
        handlePlayerQuantity,
        handleLimitPlayerQuantity,
        handleRRPositionCommand
      ),
    }),
    {}
  );
}

function importCommands(...commandFunction: CommandFunction[]): Commands {
  return commandFunction.reduce(
    (acc, f) => ({
      ...acc,
      ...f(
        handleAdminCommand,
        handleCircuitCommand,
        handleCommandsCommand,
        handleMapsCommand,
        handleSpeedCommand,
        handleTimesCommand,
        handlePositionsCommand,
        handleVSCCommand,
        handleQModeCommand,
        handleTModeCommand,
        handleQTimeCommand,
        handleRModeCommand,
        handleBBCommand,
        handleTiresCommand,
        handleHelpCommand,
        handleClearBansCommand,
        handleLapsCommand,
        handleWaitTimeCommand,
        handleLanguageCommand,
        handleAvatarCommand,
        handleClearTimeCommand,
        handleMuteCommand,
        handleRainCommand,
        handleSlipstreamCommand,
        handleGasCommand,
        handleGhostCommand,
        handleRREnabledCommand,
        handleRRCommand,
        handleRainItensity,
        handleEndRainCommand,
        handleAfkCommand,
        handleEnableQualyForPub,
        handleEnableTyresCommand,
        handleTipsCommands,
        handleExplainTyresCommand,
        handleExplainServerCommand,
        handleExplainRainCommand,
        handleExplainErsCommand,
        handleEveryoneLapsCommand,
        handleTpCommand,
        handleIndyModeCommand,
        handleFlagCommand,
        handleVoteCommand,
        handleClearCommand,
        handleRecordCommand,
        handleAjustPlayerCommand,
        handleNerfListCommand,
        handlePresentationLapCommand,
        handleChangePropierties,
        handleSetTeam,
        handleSeeTeams,
        handleDiscordCommand,
        handleCameraProperties,
        handleCameraPlayerFollow,
        handleCameraPositionFollow,
        handleChangeGameFLow,
        handleSetMinimumPit,
        handleRejoinCommand,
        handleMoveToBoxCommand,
        handlePlayerQuantity,
        handleLimitPlayerQuantity,
        handleRRPositionCommand
      ),
    }),
    {}
  );
}

export const COMMANDS_BY_LANGUAGE = importCommandsByLanguage({
  en: en_commands,
  es: es_commands,
  fr: fr_commands,
  tr: tr_commands,
  pt: pt_commands,
});

export const COMMANDS: Commands = importCommands(
  en_commands,
  es_commands,
  fr_commands,
  tr_commands,
  pt_commands
);

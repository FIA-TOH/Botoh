import {getAdmins, getRunningPlayers, kickPlayer, validCircuitIndex} from "./utils";
import {
    MAX_PLAYER_NAME,
    sendAlertMessage,
    sendBlackMessage,
    sendBlueMessage,
    sendChatMessage,
    sendErrorMessage,
    sendGreenMessage,
    sendMessage,
    sendNonLocalizedSmallChatMessage,
    sendRedMessage,
    sendSuccessMessage,
    sendYellowMessage
} from "./chat";
import {MESSAGES} from "./messages";
import {CIRCUITS, currentMapIndex, handleChangeMap} from "./maps";
import {finishList, lapPositions, positionList} from "./handleLapChange";
import {
    changeTires,
    changeVSC,
    enableShowTires,
    ifInBoxZone,
    slipstreamEnabled,
    toggleSlipstream,
    vsc
} from "./handleSpeed";
import {leagueAdminPassword, publicAdminPassword, publicModPassword} from "../../roomconfig.json"
import {changeQuali, changeTraining, printAllTimes, qualiMode, qualiTime, setQualiTime, trainingMode, updatePlayerTime} from "./qualiMode";
import en_commands from "../locales/commands/en";
import fr_commands from "../locales/commands/fr";
import es_commands from "../locales/commands/es";
import tr_commands from "../locales/commands/tr";
import pt_commands from "../locales/commands/pt";
import {setGhostMode} from "./ghost";
import {Tires} from "./tires";
import {Commands} from "./commands";
import {LEAGUE_MODE} from "./leagueMode";
import {PlayerInfo, playerList} from "./playerList";
import {laps, setLaps} from "./laps";
import {afkAdmins} from "./afkAdmins";
import { rainIntensity, resetAllRainEvents, setRainChances, setRainItensity } from "./rain";
import { Teams } from "./teams";
import { resetPlayer } from "./players";
import { ACTUAL_CIRCUIT, getPlayerById } from "../room";
import { handleAvatar, situacions } from "./handleAvatar";
import { Circuit } from "../circuits/Circuit";
import { isOnVoteSession, selectedCircuits } from "./vote";
import { gameState } from "./gameState";
import { clearBestTime, getBestTime, updateBestTime } from "../circuits/bestTimes";


export let tyresActivated = true
export let qualyForPub = true;
export let flag = "green"

export type CommandFunction = (
    handleAdminCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleCircuitCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleCommandsCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleMapsCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleSpeedCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleTimesCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handlePositionsCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleVSCCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleQModeCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleTModeCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleQTimeCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleRModeCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleBBCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleTiresCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleHelpCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleClearBansCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleLapsCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleWaitTimeCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleLanguageCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleAvatarCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleClearTimeCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleMuteCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleRainCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleSlipstreamCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleGhostCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleRREnabledCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleRRCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleRainItensity: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleEndRainCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleAfkCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleEnableQualyForPub: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleEnableTyresCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleTipsCommands: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleExplainTyresCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleExplainRainCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleExplainErsCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleEveryoneLapsCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleTpCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleFlagCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleVoteCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleClearCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleRecordCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleAjustPlayerCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleNerfListCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,

) => Commands

function importCommandsByLanguage(commandFunctions: { [key: string]: CommandFunction }): { [key: string]: Commands } {
    return Object.keys(commandFunctions).reduce((acc, lang) => ({
        ...acc, [lang]: commandFunctions[lang](
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
            handleExplainRainCommand,
            handleExplainErsCommand,
            handleEveryoneLapsCommand,
            handleTpCommand,
            handleFlagCommand,
            handleVoteCommand,
            handleClearCommand,
            handleRecordCommand,
            handleAjustPlayerCommand,
            handleNerfListCommand
        )
    }), {});
}

function importCommands(...commandFunction: CommandFunction[]): Commands {
    return commandFunction.reduce((acc, f) => ({
        ...acc, ...(f(
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
            handleExplainRainCommand,
            handleExplainErsCommand,
            handleEveryoneLapsCommand,
            handleTpCommand,
            handleFlagCommand,
            handleVoteCommand,
            handleClearCommand,
            handleRecordCommand,
            handleAjustPlayerCommand,
            handleNerfListCommand
        ))
    }), {});
}

const COMMANDS_BY_LANGUAGE = importCommandsByLanguage(
    {"en": en_commands, "es": es_commands, "fr": fr_commands, "tr": tr_commands, "pt": pt_commands}
)

export const COMMANDS: Commands = importCommands(en_commands, es_commands, fr_commands, tr_commands, pt_commands)

export let mute_mode = false
export let playerNerfList: PlayerObject[] = [];


export function toggleMuteMode() {
    mute_mode = !mute_mode
}

export function handleAdminCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (byPlayer.admin) {
        room.setPlayerAdmin(byPlayer.id, false)
        delete afkAdmins[byPlayer.id]
        return
    }

    const SECRET_PASSWORD = LEAGUE_MODE ? leagueAdminPassword : publicAdminPassword
    const SECRET_PASSWORD_MOD = LEAGUE_MODE ? leagueAdminPassword : publicModPassword

    if (args[0] === SECRET_PASSWORD) {
        room.setPlayerAdmin(byPlayer.id, true)
        afkAdmins[byPlayer.id] = 0
        return
    } else if(args[0] === SECRET_PASSWORD_MOD) {
        if (getAdmins(room).length === 0 && !LEAGUE_MODE) {
            room.setPlayerAdmin(byPlayer.id, true)
            afkAdmins[byPlayer.id] = 0
        } else {
            sendErrorMessage(room, MESSAGES.ADMIN_ALREADY_IN_ROOM(), byPlayer.id)
        }
    } else {
        return
    }

}

export function handleCommandsCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (byPlayer.admin) {
        sendChatMessage(room, MESSAGES.AVAILABLE_COMMANDS(), byPlayer.id)
        let i = 0
        let msg = ""
        Object.keys(COMMANDS_BY_LANGUAGE[playerList[byPlayer.id].language]).forEach(command => {
            i = (i + 1) % 3
            msg += `${command}, `
            if (i === 0) {
                sendNonLocalizedSmallChatMessage(room, msg, byPlayer.id)
                msg = ""
            }
        })
        return
    }

    sendChatMessage(room, MESSAGES.NON_ADMIN_COMMANDS(), byPlayer.id)
}

export function handleCircuitCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    if (room.getScores() !== null || isOnVoteSession) {
        sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id)
        return
    }

    const index = Number(args[0])

    if (!validCircuitIndex(index)) {
        sendErrorMessage(room, MESSAGES.INVALID_CIRCUIT_INDEX(), byPlayer.id)
    } else {
        handleChangeMap(index, room)
    }
}

export function handleMapsCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    sendChatMessage(room, MESSAGES.LIST_MAPS(`${CIRCUITS.map(c => c.info).map((c, i) => c.name + " [" + i + "]").join('\n')}`), byPlayer.id)
}

export function handleClearCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    clearBestTime(ACTUAL_CIRCUIT.info.name, 999.999, "Limpado");
    const players = room.getPlayerList()
    players.forEach(p => {playerList[p.id].bestTime === 999.999});
    room.sendAnnouncement("Recorde Resetado")

}

export function handleRecordCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if(ACTUAL_CIRCUIT && ACTUAL_CIRCUIT.info.BestTime){
        getBestTime(ACTUAL_CIRCUIT.info.name, room, byPlayer)
    }
}

export function handleVoteCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if(gameState !== null){
        sendErrorMessage(room, MESSAGES.NOT_VOTE(), byPlayer.id)
    }
    if (playerList[byPlayer.id]?.voted) {
        sendErrorMessage(room, MESSAGES.ALREADY_VOTE(), byPlayer.id)
        return;
    }

    const voteIndex = Number(args[0])-1;

    

    if (voteIndex < 0 || voteIndex >= selectedCircuits.length || !args) {
        sendErrorMessage(room, MESSAGES.INVALIDE_VOTE(), byPlayer.id)
        return;
    }

    const selectedCircuit = selectedCircuits[voteIndex];
    if(selectedCircuit){
        if (selectedCircuit.info) {
            selectedCircuit.info.Votes = (selectedCircuit.info.Votes ? selectedCircuit.info.Votes : 0) + 1;
        }
        if (playerList[byPlayer.id]) {
            playerList[byPlayer.id].voted = true;
        }
        
    sendSuccessMessage(room, MESSAGES.VOTED(selectedCircuit.info.name), byPlayer.id)
    } else {
        sendErrorMessage(room, MESSAGES.INVALIDE_VOTE(), byPlayer.id)
        return;
    }




}

export function handleAjustPlayerCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }
    if (room.getScores() === null) {
        sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id)
        return false
    }
    if (args.length === 0) {
        room.sendAnnouncement("Correct model !adjust [wear|laps] [id] [value]", byPlayer.id, 0xff0000);
        return
    }

    const adjust = args[0]
    const playerChoosen = args[1]
    const value = args[2]
    let playerNumero: number | undefined;
    if (!isNaN(Number(playerChoosen))) {
        playerNumero = Number(playerChoosen);
    }
    let valueNumber: number | undefined;
    if (!isNaN(Number(value))) {
        valueNumber = Number(value);
    }
    const playersAndDiscs = room.getPlayerList().map((p) => {
        return { p: p, disc: room.getPlayerDiscProperties(p.id) };
    });
    const players = getRunningPlayers(playersAndDiscs);
    let playerEscolhido: { p: PlayerObject; disc: DiscPropertiesObject; }[] = []
    if (!playerChoosen) {
        room.sendAnnouncement("Escolha um jogador", byPlayer.id, 0xff0000);
        return;
    }
    
    if(playerNumero !== undefined){
        playerEscolhido = players.filter(p=>p.p.id === playerNumero)
    } else {
        room.sendAnnouncement("Player not found", byPlayer.id, 0xff0000);
        return;
    }
    if(valueNumber !== undefined){
        playerEscolhido = players.filter(p=>p.p.id === playerNumero)
    } else {
        room.sendAnnouncement("Value must be a number", byPlayer.id, 0xff0000);
    }

    if (playerEscolhido?.length === 0) {
        room.sendAnnouncement("Escolha um jogador válido", byPlayer.id, 0xff0000);
        return;
    }
    const playerInfo = playerList[playerEscolhido[0].p.id]

    if(adjust === "wear"){
        playerInfo.wear = valueNumber as number
    } else if(adjust === "laps"){
        playerInfo.currentLap = valueNumber as number
        playerInfo.currentSector = 3 as number
    } else{
        room.sendAnnouncement("Now you can only change wear or laps", byPlayer.id, 0xff0000);
        return;
    }


}


export function handleNerfListCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }
    if (room.getScores() === null) {
        sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id)
        return false
    }
    if (args.length === 0) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }
    const playerId = args[0]

    let playerNumero: number | undefined;
    if (!isNaN(Number(playerId))) {
        playerNumero = Number(playerId);
    }

    const playersAndDiscs = room.getPlayerList().map((p) => {
        return { p: p, disc: room.getPlayerDiscProperties(p.id) };
    });
    const players = getRunningPlayers(playersAndDiscs);

    let playerEscolhido: { p: PlayerObject; disc: DiscPropertiesObject; }[] = []
    if (!playerId) {
        room.sendAnnouncement("Escolha um jogador", byPlayer.id, 0xff0000);
        return;
    }
    if(playerNumero !== undefined){
        playerEscolhido = players.filter(p=>p.p.id === playerNumero)
    } else {
        room.sendAnnouncement("Player not found", byPlayer.id, 0xff0000);
        return;
    }
    if (playerEscolhido?.length === 0) {
        room.sendAnnouncement("Escolha um jogador válido", byPlayer.id, 0xff0000);
        return;
    }

    playerNerfList.push(playerEscolhido[0].p)

    // if(adjust === "wear"){
    //     playerInfo.wear = valueNumber as number
    // } else if(adjust === "laps"){
    //     playerInfo.currentLap = valueNumber as number
    //     playerInfo.currentSector = 3 as number
    // } else{
    //     room.sendAnnouncement("Now you can only change wear or laps", byPlayer.id, 0xff0000);
    //     return;
    // }


}

export function handleSpeedCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {

    const tires = !playerList[byPlayer.id].showTires;
    const speed = !tires; // O oposto de mostrar pneus

    playerList[byPlayer.id].showTires = tires;
    playerList[byPlayer.id].speedEnabled = speed;


    const message = tires ? MESSAGES.NOW_SHOWING_TIRES() : MESSAGES.NOW_SHOWING_SPEED();
    sendChatMessage(room, message, byPlayer.id);
}
export function handleTimesCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (byPlayer.admin) {
        printAllTimes(room)
    } else {
        printAllTimes(room, byPlayer.id)
    }
}

export function handlePositionsCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (byPlayer.admin) {
        printAllPositions(room)
    } else {
        printAllPositions(room, byPlayer.id)
    }
}

export function handleVSCCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    changeVSC()
    const message = vsc ? MESSAGES.VSC_ACTIVE() : MESSAGES.VSC_NOT_ACTIVE()
    sendChatMessage(room, message)
}

export function handleQModeCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    if (room.getScores() !== null) {
        sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id)
        return
    }

    changeQuali(true, room)
}

export function handleTModeCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    if (room.getScores() !== null) {
        sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id)
        return
    }
    changeTraining(true, room)
    room.sendAnnouncement("Training mode on", byPlayer.id)
}

export function handleQTimeCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    if (room.getScores() !== null) {
        sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id)
        return
    }
    if (!qualiMode) {
        sendErrorMessage(room, MESSAGES.NOT_IN_QUALI(), byPlayer.id)
        return false
    }
    if (args.length === 0) {
        sendErrorMessage(room, MESSAGES.QTIME_COMMAND_USAGE(), byPlayer.id)
    }

    setQualiTime(byPlayer, parseInt(args[0]), room)
    return false
}

export function handleRModeCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    if (room.getScores() !== null) {
        sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id)
        return
    }

    changeQuali(false, room)
}

export function handleBBCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    kickPlayer(byPlayer.id, `!bb`, room)
}

export function handleTiresCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (room.getScores() && gameState !== undefined && gameState !== null) {
        if (!ifInBoxZone({ p: byPlayer, disc: room.getPlayerDiscProperties(byPlayer.id) }, room) && room.getScores().time > 0) {
                sendErrorMessage(room, MESSAGES.NOT_IN_BOXES(), byPlayer.id)
                return
            }
        if (args.length === 0) {
            sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
            return;
        }        
    
        if(LEAGUE_MODE && room.getScores().time > 0){
            const boxAlertReversed = playerList[byPlayer.id].boxAlert
            .toString()
            .split('')
            .reverse()
            .join('');
        
            if (args[1] !== boxAlertReversed || args.length !== 2) {
                sendErrorMessage(room, MESSAGES.CODE_WRONG(), byPlayer.id);
                return;
            }
        }
        const tiresStr = args[0].toUpperCase();
        if(!trainingMode && (tiresStr === "TRAIN" || tiresStr === "T")){
            sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
            return;
        }

        console.log("PlayerInfo", playerList[byPlayer.id]);
        

        if (
            playerNerfList.some(player => player.name === byPlayer.name) &&
            playerList[byPlayer.id].pits.pitsAttemp < 2
        ) {
            playerList[byPlayer.id].pits.pitsAttemp++;
            sendErrorMessage(room, MESSAGES.CODE_WRONG(), byPlayer.id);
            return;
        }
        
        
        for (let tiresKey in Tires) {
            if (tiresKey === tiresStr || tiresKey[0] === tiresStr) {
                changeTires({ p: byPlayer, disc: room.getPlayerDiscProperties(byPlayer.id) }, tiresKey as Tires, room);
                playerList[byPlayer.id].tires = tiresKey as Tires;
                playerList[byPlayer.id].wear = 0;
                playerList[byPlayer.id].kers = Math.min(playerList[byPlayer.id].kers + 20, 100);
                playerList[byPlayer.id].pits.pit.push({
                    tyre: tiresKey as Tires,
                    lap: playerList[byPlayer.id].currentLap,   
                });
                return;
            }
        }
        sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
    }
    
}


export function handleHelpCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    sendChatMessage(room, MESSAGES.HELP(), byPlayer.id)
}

export function handleClearBansCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    room.clearBans()
    sendSuccessMessage(room, MESSAGES.CLEARED_BANS())
}

export function handleLapsCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    if (args.length === 0) {
        sendErrorMessage(room, MESSAGES.LAPS_USAGE(), byPlayer.id)
        return
    }

    changeLaps(args[0], byPlayer, room)
    return false
}

export function handleWaitTimeCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (room.getScores() === null) {
        sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id)
        return false
    }

    if (qualiMode) {
        const willEnd = (qualiTime !== Number.MAX_VALUE)

        if (!willEnd)
            sendChatMessage(room, MESSAGES.QUALI_WONT_END(), byPlayer.id)
        else {
            const timeLeft =
                `${Math.round(Math.max(qualiTime - room.getScores().time / 60, 0))}` + " minutes"
            sendChatMessage(room, MESSAGES.QUALI_WILL_END_IN(timeLeft), byPlayer.id)
        }
        return false
    }

    let i = lapPositions.length - 1
    while (true) {
        if (lapPositions[i].length !== 0) break
        if (--i === -1) break
    }

    sendChatMessage(room, MESSAGES.RACE_WILL_END_IN(laps - i - 1), byPlayer.id)
    return false
}

export function handleLanguageCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (args.length === 0) {
        sendErrorMessage(room, MESSAGES.LANG_USAGE(), byPlayer.id)
        return
    }

    const lang = args[0].toLowerCase()
    if (lang != "en" && lang != "es" && lang != "fr" && lang != "tr" && lang != "pt") {
        sendErrorMessage(room, MESSAGES.LANG_USAGE(), byPlayer.id)
        return
    }

    playerList[byPlayer.id].language = lang
}

export function handleAvatarCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    playerList[byPlayer.id].speedEnabled = false
    playerList[byPlayer.id].showTires = false

    room.setPlayerAvatar(byPlayer.id, null)
}

export function handleClearTimeCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
        return;
    }

    if (args.length === 0) {
        sendErrorMessage(room, MESSAGES.CLEAR_TIME_USAGE(), byPlayer.id);
        return;
    }

    const argsString = args.join(' ');

    const listPlayer = room.getPlayerList();
    const player = listPlayer.find(p => p.name.toLowerCase() === argsString.toLowerCase());

    
    if (player) {
        playerList[player.id].bestTime = Number.MAX_VALUE;
    } else {
        room.sendAnnouncement("IMPORTANT: The player isn't in the room at the moment, reset their time when they enter again.");
    }

    updatePlayerTime(argsString, Number.MAX_VALUE);

    sendNonLocalizedSmallChatMessage(room, "Cleared " + argsString + "'s best time", byPlayer.id);
}


export function handleMuteCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }
    if (mute_mode)
        room.sendAnnouncement("NOT MUTE MODE!")
    else
        room.sendAnnouncement("MUTE MODE!")

    toggleMuteMode()
}

export function handleRainCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    let newRain = parseInt(args[0]);
    if (room.getScores() == null){
        sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id)
        return false;
    } else if(Number.isNaN(newRain)){
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
    } else {
    if (!byPlayer.admin || args.length !== 1 || isNaN(newRain)) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    } 

    setRainChances(newRain)
    sendChatMessage(room, MESSAGES.RAIN_CHANCES(newRain))
}
    
}

export function handleRainItensity(byPlayer: PlayerObject, args: string[], room: RoomObject){
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    let intensity = Math.round(parseFloat(args[0]));
    if (room.getScores() == null){
        sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id)
        return false;
    } else if(Number.isNaN(intensity)){
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
    } else {
        sendChatMessage(room, MESSAGES.NEW_RAIN_INTENSITY(intensity))
        setRainItensity(intensity);
    }
}

export function handleEndRainCommand(byPlayer: PlayerObject, args: string[], room: RoomObject){
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    if (room.getScores() == null){
        sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id)
        return false;
    } else {
        sendChatMessage(room, MESSAGES.RAIN_STOPPED())
        resetAllRainEvents()
    }
}

export function handleAfkCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    const player = playerList[byPlayer.id];
    if (!player) {
        console.log(`Jogador não encontrado: ID ${byPlayer.id}`);
        return;
    }
    
    if (byPlayer.team === Teams.RUNNERS) {
        room.setPlayerTeam(byPlayer.id, Teams.SPECTATORS);
        player.afk = true;
        sendAlertMessage(room, MESSAGES.NOW_AFK(), byPlayer.id);
        resetPlayer(byPlayer, room, byPlayer.id);
    } else if (qualiMode || trainingMode) {
        room.setPlayerTeam(byPlayer.id, Teams.RUNNERS);
        player.afk = false;
        resetPlayer(byPlayer, room, byPlayer.id);
    } else if(player.afk){
        player.afk = false;
        sendAlertMessage(room, MESSAGES.REMOVED_FROM_AFK(), byPlayer.id);
    } else {
        player.afk = true;
        sendAlertMessage(room, MESSAGES.NOW_AFK(), byPlayer.id);
    }
}

export function handleEnableQualyForPub(byPlayer: PlayerObject, _: string[], room: RoomObject){
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }
    qualyForPub = !qualyForPub
    room.sendAnnouncement(`qualyForPub changed to ${qualyForPub}`, byPlayer.id)
}

export function handleEnableTyresCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }
    tyresActivated = !tyresActivated
    sendAlertMessage(room, MESSAGES.ENABLED_TYRES(tyresActivated), byPlayer.id)
    
}


export function handleTipsCommands(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    sendMessage(room, MESSAGES.TIPS())
}
export function handleExplainTyresCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    sendMessage(room, MESSAGES.EXPLAIN_TYRES())
}

export function handleExplainRainCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    sendMessage(room, MESSAGES.EXPLAIN_RAIN())
}

export function handleExplainErsCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    sendMessage(room, MESSAGES.EXPLAIN_ERS())
}

export function handleEveryoneLapsCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    const player = playerList[byPlayer.id];
    player.everyoneLaps = !player.everyoneLaps

    if(player.everyoneLaps){
        room.sendAnnouncement("Showing everyone laps", byPlayer.id)
    } else {
        room.sendAnnouncement("Not showing everyone laps", byPlayer.id)
    }

}

export function handleFlagCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
        return;
    }

    if (!args[0]) {
        room.sendAnnouncement(
            "Uso correto: !flag color [playerName]",
            byPlayer.id,
            0xff0000
        );
        return false;
    }

    const flagChoosen = args[0];
    const playerChoosen = args[1];
    let playerNumero: number | undefined; 

    if (!isNaN(Number(playerChoosen))) {
        playerNumero = Number(playerChoosen);
    }

    const playersAndDiscs = room.getPlayerList().map((p) => {
        return { p: p, disc: room.getPlayerDiscProperties(p.id) };
    });
    let playerEscolhido: { p: PlayerObject; disc: DiscPropertiesObject; }[] = []
    const players = getRunningPlayers(playersAndDiscs);
    if(playerNumero !== undefined){
        playerEscolhido = players.filter(p=>p.p.id === playerNumero)
        console.log(playerEscolhido, players);
    }

    if (flagChoosen === "green" && vsc === true) {
        changeVSC();
        mute_mode = false;
        flag = "green";

        sendGreenMessage(room, MESSAGES.GREEN_FLAG());
        sendGreenMessage(room, MESSAGES.GREEN_FLAG_TWO());

        players.forEach((player) => {
            handleAvatar(situacions.Flag, player.p, room, undefined, ["🟩"], [5000]);
        });
    } else if (flagChoosen === "yellow" && vsc === false) {
        changeVSC();
        flag = "yellow";

        sendYellowMessage(room, MESSAGES.YELLOW_FLAG());
        sendYellowMessage(room, MESSAGES.YELLOW_FLAG_TWO());

        players.forEach((player) => {
            handleAvatar(situacions.Flag, player.p, room, undefined, ["🟨"], [5000]);
        });
    } else if (flagChoosen === "red") {
        flag = "red";

        sendRedMessage(room, MESSAGES.RED_FLAG());
        sendRedMessage(room, MESSAGES.RED_FLAG_TWO());

        players.forEach((player) => {
            handleAvatar(situacions.Flag, player.p, room, undefined, ["🟥"], [5000]);
        });
    } else if (flagChoosen === "blue") {
        if (!playerChoosen) {
            room.sendAnnouncement("Escolha um jogador", byPlayer.id, 0xff0000);
            return;
        }
        if (playerEscolhido?.length === 0) {
            room.sendAnnouncement("Escolha um jogador válido", byPlayer.id, 0xff0000);
            return;
        }
        flag = "blue";

        sendBlueMessage(room, MESSAGES.BLUE_FLAG(playerEscolhido[0].p.name));
        
        sendBlueMessage(room, MESSAGES.BLUE_FLAG_TO(playerEscolhido[0].p.name), playerEscolhido[0].p.id);

        handleAvatar(situacions.Flag, playerEscolhido[0].p, room, undefined, ["🟦"], [5000]);
    } else if (flagChoosen === "black") {
        if (!playerChoosen) {
            room.sendAnnouncement("Escolha um jogador", byPlayer.id, 0xff0000);
            return;
        }
        if (playerEscolhido?.length === 0 || !playerEscolhido) {
            room.sendAnnouncement("Escolha um jogador válido", byPlayer.id, 0xff0000);
            return;
        }
        flag = "black";

        sendBlackMessage(room, MESSAGES.BLACK_FLAG(playerEscolhido[0].p.name));
        sendBlackMessage(room, MESSAGES.BLACK_FLAG_TWO(playerEscolhido[0].p.name), playerEscolhido[0].p.id);

        room.setPlayerTeam(playerEscolhido[0].p.id, Teams.SPECTATORS)

        handleAvatar(situacions.Flag, playerEscolhido[0].p, room, undefined, ["⬛"], [5000]);
    }
}

export function handleTpCommand(
    byPlayer: PlayerObject,
    args: string[],
    room: RoomObject
  ) {
    if (!byPlayer.admin) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      return;
    }
  
    if (room.getScores() === null) {
      sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id);
      return false;
    }
  
    // Verificar se os argumentos necessários foram fornecidos
    if (args.length < 2) {
      room.sendAnnouncement(
        "Uso correto: !tp [X] [Y]",
        byPlayer.id,
        0xff0000
      );
      return false;
    }
  
    const xPosition = args[0];
    const yPosition = args[1];
    const integerPattern = /^-?\d+$/;
  
    // Função para validar entradas
    const validatePosition = (pos: string, axis: string) => {
      if (!integerPattern.test(pos)) {
        const errorMessage = pos.includes(",") || pos.includes(".")
          ? `${axis} não pode conter vírgula ou ponto.`
          : `${axis} deve ser um número inteiro positivo, negativo ou zero.`;
  
        room.sendAnnouncement(`Aviso: ${errorMessage}`, byPlayer.id, 0xff0000);
        return false;
      }
      return true;
    };
  
    // Validar X e Y
    const isXValid = validatePosition(xPosition, "xPosition");
    const isYValid = validatePosition(yPosition, "yPosition");
  
    if (!isXValid || !isYValid) {
      return false;
    }
  
    const xPos = parseInt(xPosition, 10);
    const yPos = parseInt(yPosition, 10);
  
    if (byPlayer.position) {
      const newX = byPlayer.position.x + xPos;
      const newY = byPlayer.position.y + yPos;
  
      room.sendAnnouncement(
        `Teleportado para (${newX}, ${newY}).`,
        byPlayer.id,
        0xffff00
      );
  
      room.setPlayerDiscProperties(byPlayer.id, {
        x: newX,
        y: newY,
      });
    } else {
      room.sendAnnouncement(
        "Erro: Não foi possível obter a posição atual do jogador.",
        byPlayer.id,
        0xff0000
      );
    }
  
    return false;
  }
  

export function handleSlipstreamCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    if (slipstreamEnabled)
        room.sendAnnouncement("No Slipstream mode!")
    else
        room.sendAnnouncement("Slipstream mode!")

    toggleSlipstream()
}

export function handleGhostCommand(byPlayer: PlayerObject, args: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }
    let boolean = false

    if(args[0] === "false"){
        boolean = false
    }
    else if(args[0] === "true"){
        boolean = true
    } else {
            sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
            return
    }


    setGhostMode(room, boolean)
}



export let rrEnabled = false

export function handleRREnabledCommand(byPlayer?: PlayerObject, args?: string[], room?: RoomObject) {
    if(room){
        if(byPlayer){
            if (!byPlayer.admin) {
                sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
                return
            }
        }
        if(args && args[0] === "true"){
            rrEnabled = true
            room.sendAnnouncement("RR mode!")
        } else if (args && args[0] === "false"){
            rrEnabled = false
            room.sendAnnouncement("No RR mode!")
        } else if (byPlayer){
            sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
            return
        } else {
            return
        }
    }
}

export function handleRRCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (!rrEnabled) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }
    resetPlayer(byPlayer, room, byPlayer.id);
    if(qualiMode || trainingMode){
        playerList[byPlayer.id].kers = 100;
        playerList[byPlayer.id].wear = 20
    }
    room.setPlayerDiscProperties(byPlayer.id, {
        x: CIRCUITS[currentMapIndex].info.lastPlace.x,
        y: CIRCUITS[currentMapIndex].info.lastPlace.y
    })
}

export function printAllPositions(room: RoomObject, toPlayerID?: number) {
    if (qualiMode || trainingMode) {
        sendErrorMessage(room, MESSAGES.POSITIONS_IN_QUALI(), toPlayerID)
        return false
    }
    const headerSpaces = (MAX_PLAYER_NAME - 4) / 2.0
    const headerLeftSpaces = ' '.repeat(Math.ceil(headerSpaces))
    const headerRightSpaces = ' '.repeat(Math.trunc(headerSpaces))
    let i = 1

        sendNonLocalizedSmallChatMessage(room, ` P - ${headerLeftSpaces}Name${headerRightSpaces} | Pits | Best Lap`, toPlayerID)
        console.log("positionList: ")
        positionList.forEach(p=>{
            console.log(p);
            
            const spaces = (MAX_PLAYER_NAME - p.name.length) / 2.0
            const leftSpaces = ' '.repeat(Math.ceil(spaces))
            const rightSpaces = ' '.repeat(Math.trunc(spaces))
    
            const position = i.toString().padStart(2, '0')
            const pits = p.pits.toString().padStart(2, '0')
            const time = p.time < 999.999 ? p.time.toFixed(3) : "N/A";

            sendNonLocalizedSmallChatMessage(room, `${position} - ${leftSpaces}${p.name}${rightSpaces} |  ${pits}  | ${time}`, toPlayerID)
            i++
        })
    
   

    if (i === 1) {
        sendErrorMessage(room, MESSAGES.NO_POSITIONS(), toPlayerID)
    }
}


export function changeLaps(newLapsArg?: string, byPlayer?: PlayerObject, room?: RoomObject) {
    if(room && newLapsArg){
        const newLaps = Number(newLapsArg)
        if(byPlayer){
            if (qualiMode || trainingMode) {
                sendErrorMessage(room, MESSAGES.LAPS_IN_QUALI(), byPlayer.id)
                return false
            }
        
            if (room.getScores() !== null) {
                sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id)
                return false
            }
            if (!isNaN(newLaps)) {
                setLaps(newLaps)
                sendChatMessage(room, MESSAGES.LAPS_CHANGED_TO(newLaps), byPlayer.id)
                return true
            } else {
                sendErrorMessage(room, MESSAGES.LAPS_USAGE(), byPlayer.id)
                return false
            }
        } else {
            setLaps(newLaps)
            return true
        }
    

    } return false
   
}
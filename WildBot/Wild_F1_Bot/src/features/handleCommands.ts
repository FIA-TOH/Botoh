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
import {finishList, lapPositions} from "./handleLapChange";
import {
    changeTires,
    changeVSC,
    enableShowTires,
    slipstreamEnabled,
    toggleSlipstream,
    vsc
} from "./handleSpeed";
import {leagueAdminPassword, publicAdminPassword} from "../../roomconfig.json"
import {changeQuali, printAllTimes, qualiMode, qualiTime, setQualiTime} from "./qualiMode";
import en_commands from "../locales/commands/en";
import fr_commands from "../locales/commands/fr";
import es_commands from "../locales/commands/es";
import tr_commands from "../locales/commands/tr";
import pt_commands from "../locales/commands/pt";
import {toggleGhostMode} from "./ghost";
import {Tires} from "./tires";
import {Commands} from "./commands";
import {LEAGUE_MODE} from "./leagueMode";
import {playerList} from "./playerList";
import {laps, setLaps} from "./laps";
import {afkAdmins} from "./afkAdmins";
import { rainIntensity, resetAllRainEvents, setRainChances, setRainItensity } from "./rain";
import { Teams } from "./teams";
import { resetPlayer } from "./players";
import { getPlayerByName } from "../room";
import { handleAvatar, situacions } from "./handleAvatar";


export let tyresActivated = true
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
    handleEnableTyresCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleTipsCommands: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleExplainTyresCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleExplainRainCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleExplainErsCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleEveryoneLapsCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleTpCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
    handleFlagCommand: (byPlayer: PlayerObject, args: string[], room: RoomObject) => void,
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
            handleEnableTyresCommand,
            handleTipsCommands,
            handleExplainTyresCommand,
            handleExplainRainCommand,
            handleExplainErsCommand,
            handleEveryoneLapsCommand,
            handleTpCommand,
            handleFlagCommand,
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
            handleEnableTyresCommand,
            handleTipsCommands,
            handleExplainTyresCommand,
            handleExplainRainCommand,
            handleExplainErsCommand,
            handleEveryoneLapsCommand,
            handleTpCommand,
            handleFlagCommand,
        ))
    }), {});
}

const COMMANDS_BY_LANGUAGE = importCommandsByLanguage(
    {"en": en_commands, "es": es_commands, "fr": fr_commands, "tr": tr_commands, "pt": pt_commands}
)

export const COMMANDS: Commands = importCommands(en_commands, es_commands, fr_commands, tr_commands, pt_commands)

export let mute_mode = false

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

    if (args[0] === SECRET_PASSWORD) {
        room.setPlayerAdmin(byPlayer.id, true)
        afkAdmins[byPlayer.id] = 0
        return
    }
    if (getAdmins(room).length === 0 && !LEAGUE_MODE) {
        room.setPlayerAdmin(byPlayer.id, true)
        afkAdmins[byPlayer.id] = 0
    } else {
        sendErrorMessage(room, MESSAGES.ADMIN_ALREADY_IN_ROOM(), byPlayer.id)
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

    if (room.getScores() !== null) {
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
    if (args.length === 0) {
        enableShowTires(byPlayer, room)
        return
    }

    const tiresStr = args[0].toUpperCase()

    for (let tiresKey in Tires) {
        if (tiresKey === tiresStr || tiresKey[0] === tiresStr) {
            changeTires({p: byPlayer, disc: room.getPlayerDiscProperties(byPlayer.id)}, tiresKey as Tires, room);
            playerList[byPlayer.id].tires = tiresKey as Tires
            playerList[byPlayer.id].wear = 0;
            return
        }
    }

    sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id)
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
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    if (args.length === 0) {
        sendErrorMessage(room, MESSAGES.CLEAR_TIME_USAGE(), byPlayer.id)
        return
    }

    const id = parseInt(args[0])
    if (isNaN(id) || playerList[id] === undefined) {
        sendErrorMessage(room, MESSAGES.CLEAR_TIME_USAGE(), byPlayer.id)
        return
    }

    playerList[id].bestTime = Number.MAX_VALUE

    sendNonLocalizedSmallChatMessage(room, "Cleared " + id + "'s best time", byPlayer.id)
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
    } else if (qualiMode) {
        room.setPlayerTeam(byPlayer.id, Teams.RUNNERS);
        player.afk = false;
        resetPlayer(byPlayer, room, byPlayer.id);
    } else {
        player.afk = false;
        sendAlertMessage(room, MESSAGES.REMOVED_FROM_AFK(), byPlayer.id);
    }
}

export function handleEnableTyresCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    console.log(byPlayer);
    
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
    const playerChoosen = args.slice(1).join(" ");

    console.log(playerChoosen);
    
    const playerChooseInfo = playerChoosen ? getPlayerByName(playerChoosen) : undefined;
    console.log(playerChooseInfo);
    
    const playersAndDiscs = room.getPlayerList().map((p) => {
        return { p: p, disc: room.getPlayerDiscProperties(p.id) };
    });
    const players = getRunningPlayers(playersAndDiscs);

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
        if (!playerChooseInfo) {
            room.sendAnnouncement("Escolha um jogador válido", byPlayer.id, 0xff0000);
            return;
        }
        flag = "blue";

        sendBlueMessage(room, MESSAGES.BLUE_FLAG(playerChoosen));
        sendBlueMessage(room, MESSAGES.BLUE_FLAG_TWO(playerChoosen), playerChooseInfo.p.id);

        handleAvatar(situacions.Flag, playerChooseInfo.p, room, undefined, ["🟦"], [5000]);
    } else if (flagChoosen === "black") {
        if (!playerChoosen) {
            room.sendAnnouncement("Escolha um jogador", byPlayer.id, 0xff0000);
            return;
        }
        if (!playerChooseInfo) {
            room.sendAnnouncement("Escolha um jogador válido", byPlayer.id, 0xff0000);
            return;
        }
        flag = "black";

        sendBlackMessage(room, MESSAGES.BLACK_FLAG(playerChoosen));
        sendBlackMessage(room, MESSAGES.BLACK_FLAG_TWO(playerChoosen), playerChooseInfo.p.id);

        room.setPlayerTeam(playerChooseInfo.p.id, Teams.SPECTATORS)

        handleAvatar(situacions.Flag, playerChooseInfo.p, room, undefined, ["⬛"], [5000]);
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

export function handleGhostCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    toggleGhostMode(room)
}



export let rrEnabled = false

export function handleRREnabledCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (!byPlayer.admin) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }

    rrEnabled = !rrEnabled
    if (rrEnabled)
        room.sendAnnouncement("RR mode!")
    else
        room.sendAnnouncement("No RR mode!")
}

export function handleRRCommand(byPlayer: PlayerObject, _: string[], room: RoomObject) {
    if (!rrEnabled) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id)
        return
    }
    playerList[byPlayer.id].lapChanged = false
    playerList[byPlayer.id].lapTime = 0
    playerList[byPlayer.id].inPitlane = false
    room.setPlayerDiscProperties(byPlayer.id, {
        x: CIRCUITS[currentMapIndex].info.lastPlace.x,
        y: CIRCUITS[currentMapIndex].info.lastPlace.y
    })
}

export function printAllPositions(room: RoomObject, toPlayerID?: number) {
    if (qualiMode) {
        sendErrorMessage(room, MESSAGES.POSITIONS_IN_QUALI(), toPlayerID)
        return false
    }
    const headerSpaces = (MAX_PLAYER_NAME - 4) / 2.0
    const headerLeftSpaces = ' '.repeat(Math.ceil(headerSpaces))
    const headerRightSpaces = ' '.repeat(Math.trunc(headerSpaces))
    sendNonLocalizedSmallChatMessage(room, ` P - ${headerLeftSpaces}Name${headerRightSpaces} | Pits | Best Lap | Time`, toPlayerID)
    let i = 1
    finishList.forEach(p => {
        const spaces = (MAX_PLAYER_NAME - p.name.length) / 2.0
        const leftSpaces = ' '.repeat(Math.ceil(spaces))
        const rightSpaces = ' '.repeat(Math.trunc(spaces))

        const position = i.toString().padStart(2, '0')
        const pits = p.pits.toString().padStart(2, '0')
        sendNonLocalizedSmallChatMessage(room, `${position} - ${leftSpaces}${p.name}${rightSpaces} |  ${pits}  | ${p.time.toFixed(3)} | ${p.fullTime}`, toPlayerID)
        i++
    })

    if (i === 1) {
        sendErrorMessage(room, MESSAGES.NO_POSITIONS(), toPlayerID)
    }
}


function changeLaps(newLapsArg: string, byPlayer: PlayerObject, room: RoomObject) {
    if (qualiMode) {
        sendErrorMessage(room, MESSAGES.LAPS_IN_QUALI(), byPlayer.id)
        return false
    }

    if (room.getScores() !== null) {
        sendErrorMessage(room, MESSAGES.ALREADY_STARTED(), byPlayer.id)
        return false
    }

    const newLaps = Number(newLapsArg)
    if (!isNaN(newLaps)) {
        setLaps(newLaps)
        sendChatMessage(room, MESSAGES.LAPS_CHANGED_TO(newLaps), byPlayer.id)
        return true
    } else {
        sendErrorMessage(room, MESSAGES.LAPS_USAGE(), byPlayer.id)
        return false
    }
}
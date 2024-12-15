import {CIRCUITS, handleChangeMap} from "./features/maps";
import {logPlayerSpeed} from "./features/logPlayerSpeed";
import {createPlayerInfo, resetPlayer, resetPlayers} from "./features/players";
import {log} from "./features/logger";
import {checkPlayerLaps, finishList, lapPositions} from "./features/handleLapChange";
import {sendDiscordReplay} from "./features/discord";
import {controlPlayerSpeed, handlePitlane, TIRE_AVATAR} from "./features/handleSpeed";
import {MESSAGES} from "./features/messages";
import {Teams} from "./features/teams";
import {bans, leagueName, maxPlayers, publicName, roomPassword} from "../roomconfig.json"
import {MAX_PLAYER_NAME, sendChatMessage, sendErrorMessage, sendSuccessMessage} from "./features/chat";
import {changeQuali, getPlayersOrderedByQualiTime, printAllTimes, qualiMode} from "./features/qualiMode";
import {banPlayer, decodeIPFromConn, getRunningPlayers, kickPlayer} from "./features/utils";
import {COMMANDS, mute_mode, printAllPositions} from "./features/handleCommands";
import {sha256} from "js-sha256";
import {ghostMode} from "./features/ghost";
import {LEAGUE_MODE} from "./features/leagueMode";
import {laps} from "./features/laps";
import {idToAuth, playerList} from "./features/playerList";
import {afkAdmins} from "./features/afkAdmins";
import {checkPlayersDRSZone} from "./features/handleDRSZone";
import handleTireWear from "./features/handleTireWear";
import { gameState, handleGameStateChange } from "./features/gameState";
import { resetAllRainEvents, setRainChances } from "./features/rain";
import { updateErs } from "./features/ers";
import { Circuit } from "./circuits/Circuit";
import { handleAvatar } from "./features/handleAvatar";


const BAN_LIST = bans

const roomName = LEAGUE_MODE ? leagueName : publicName

export let ACTUAL_CIRCUIT:Circuit

export const room = HBInit({
    roomName: roomName,
    noPlayer: true,
    public: !LEAGUE_MODE,
    maxPlayers: maxPlayers,
    password: roomPassword ?? undefined,
    token: 'thr1.AAAAAGdDS0jEIWnS04qeVA.1F4ha2154X8'
})

if (!LEAGUE_MODE) {
    setInterval(() => {
        sendChatMessage(room, MESSAGES.DISCORD_INVITE())
    }, 10 * 60 * 1000);

    setTimeout(
        () => setInterval(() => {
            sendChatMessage(room, MESSAGES.LEAGUE_INVITE())
        }, 10 * 60 * 1000),
        5 * 60 * 1000);
}

room.setScoreLimit(0)
room.setTimeLimit(0)
room.setTeamsLock(true)
handleChangeMap(0, room)

room.onGameTick = function () {
    const playersAndDiscs = room.getPlayerList().map(p => {
        return {p: p, disc: room.getPlayerDiscProperties(p.id)}
    })
    const players = getRunningPlayers(playersAndDiscs)
    handlePitlane(playersAndDiscs, room)
    controlPlayerSpeed(playersAndDiscs, room)
    checkPlayersDRSZone(playersAndDiscs, room)
    checkPlayerLaps(playersAndDiscs, room)
    endRaceSession(playersAndDiscs, room)
    logPlayerSpeed(playersAndDiscs, room)
    updateErs(playersAndDiscs, room)
    players.forEach(pad => { 
        const p = pad.p
        handleTireWear(p, room)
    })
}

function endRaceSession(playersAndDiscs: { p: PlayerObject, disc: DiscPropertiesObject }[], room: RoomObject) {
    const players = getRunningPlayers(playersAndDiscs)
    if (room.getScores() != null && players.length === 0) {
        room.stopGame()
    }
}

room.onGameStart = function (byPlayer) {
    room.startRecording();
    handleGameStateChange("running")
    resetAllRainEvents()

    byPlayer == null ? log(`Game started`) : log(`Game started by ${byPlayer.name}`)

    resetPlayers(room)
    finishList.splice(0, finishList.length)

    for (let i = 0; i < laps; i++) {
        lapPositions[i] = []
    }

    if (ghostMode) {
        const playersAndDiscs = room.getPlayerList().map(p => {
            return {p: p, disc: room.getPlayerDiscProperties(p.id)}
        })
        const players = getRunningPlayers(playersAndDiscs)
        players.forEach(pad => room.setPlayerDiscProperties(pad.p.id, {cGroup: room.CollisionFlags.c0 | room.CollisionFlags.redKO}))
    } else {
    }
}


room.onGamePause = function(){
    handleGameStateChange("paused")
}

room.onGameUnpause = function(){
    handleGameStateChange("running")
}


room.onGameStop = function (byPlayer) {
    sendDiscordReplay(room.stopRecording())
    handleGameStateChange(null)

    resetAllRainEvents()
    resetPlayers(room)

    byPlayer == null ? log(`Game stopped`) : log(`Game stopped by ${byPlayer.name}`)

    if (qualiMode) {
        printAllTimes(room)
        room.reorderPlayers(getPlayersOrderedByQualiTime(room).map(p => p.id), true)
        movePlayersToCorrectSide()
        changeQuali(false, room)
    } else {
        printAllPositions(room)
        movePlayersToCorrectSide()
    }

    setRainChances(0)
}


room.onPlayerTeamChange = function (changedPlayer, _) {
    resetPlayer(changedPlayer, room, changedPlayer.id)
    if(changedPlayer.team === Teams.RUNNERS && room.getScores()){
        handleAvatar("ChangeTyre", changedPlayer, room)
        if(room.getScores().time > 0){
            const boxLine = ACTUAL_CIRCUIT.info.boxLine
            const middleX = (boxLine.minX + boxLine.maxX)/2;
            const middleY = (boxLine.minY + boxLine.maxY)/2;
            
            room.setPlayerDiscProperties(changedPlayer.id, {x: middleX, y: middleY})
        }
    }
    if (ghostMode && changedPlayer.team === Teams.RUNNERS) {
        room.setPlayerDiscProperties(changedPlayer.id, {cGroup: room.CollisionFlags.c0 | room.CollisionFlags.redKO})
    }
}




function isBanned(ip: string): boolean {
    const comparableIp = LEAGUE_MODE ? sha256(ip) : ip
    return BAN_LIST.includes(comparableIp)
}

room.onPlayerJoin = function (player) {
    const ip = decodeIPFromConn(player.conn)
    if (isBanned(ip)) {
        banPlayer(player.id, `Your ip is banned from this room.`, room)
        return
    }

    if (player.name.length > MAX_PLAYER_NAME) {
        kickPlayer(player.id, `Your name cannot be bigger than ${MAX_PLAYER_NAME} characters`, room)
        return
    }

    const regexPattern = /^\[[A-Z]{2}] \S.*$/;

    // if (LEAGUE_MODE && !regexPattern.test(player.name)) {
    //     kickPlayer(player.id, `Your name must be in the format "[XX] Name"`, room)
    //     return
    // }

    if (player.auth === null) {
        kickPlayer(player.id, `Sorry, your auth is not set. Please try again.`, room)
        return
    }

    idToAuth[player.id] = player.auth

    if(playerList[player.id] === undefined) {
        playerList[player.id] = createPlayerInfo(ip)
    }

    sendSuccessMessage(room, MESSAGES.JOIN_MESSAGE(), player.id)

    if (LEAGUE_MODE) {
        log(`${player.name} has joined. (${sha256(ip)})`)
    } else {
        log(`${player.name} has joined. (${ip})`)
    }
    
    if(qualiMode){        
        room.setPlayerTeam(player.id, Teams.RUNNERS)
    } else if(room.getScores() !== null){
        if(gameState === "running"){
            room.setPlayerTeam(player.id, Teams.SPECTATORS)
        }
    }
}

room.onPlayerLeave = function (player) {
    if (player.admin)
        delete afkAdmins[player.id]

    const playerObj = playerList[player.id]

    if (LEAGUE_MODE) {
        const hash = (playerObj !== undefined) ? sha256(playerObj.ip) : ""
        log(`${player.name} has left. (${hash})`)
    } else {
        const ip = (playerObj !== undefined) ? playerObj.ip : ""
        log(`${player.name} has left. (${ip})`)
    }

    for (let i = 0; i < lapPositions.length; i++) {
        for (let j = 0; j < lapPositions[i].length; j++) {
            if (lapPositions[i][j].name === player.name) {
                lapPositions[i].splice(j, 1)
                break
            }
        }
    }

    const playersAndDiscs = room.getPlayerList().map(p => {
        return {p: p, disc: room.getPlayerDiscProperties(p.id)}
    })

    if (room.getScores() != null && getRunningPlayers(playersAndDiscs).length === 0) {
        room.stopGame()
    }
}

room.onStadiumChange = function (newStadiumName, byPlayer) {
    if (byPlayer !== null) {
        sendErrorMessage(room, MESSAGES.NO_MANUAL_MAPS(), byPlayer.id)
        handleChangeMap(0, room)
    }
    let c = CIRCUITS.find((x)=>x.info.name == newStadiumName);
    if(c){
        ACTUAL_CIRCUIT = c
    }
    console.log(c);
    
    if(c && c.info.Angle && c.info.AvatarColor && c.info.MainColor){
        console.log(c, c.info.Angle , c.info.AvatarColor , c.info.MainColor);
        
        room.setTeamColors(Teams.RUNNERS, c.info.Angle, c.info.AvatarColor, c.info.MainColor)
    }
}

function movePlayersToCorrectSide() {
    const players = room.getPlayerList();
    players.forEach(p => {
        const player = playerList[p.id]
        console.log(player);
        
        if(!player.afk){
            room.setPlayerTeam(p.id, Teams.RUNNERS)
        }
    });
}

room.onPlayerChat = function (player, message) {
    log(`${player.name}: ${message}`)
    if (player.admin)
        afkAdmins[player.id] = 0

    const command = message.toLowerCase().split(" ")[0]
    const args = message.toLowerCase().split(" ").slice(1)

    if (command[0] !== '!') {
        if (mute_mode && !player.admin) {
            sendErrorMessage(room, MESSAGES.IN_MUTE_MODE(), player.id)
            return false
        }
        return true
    }

    if (COMMANDS[command] === undefined) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), player.id)
        return false
    }

    COMMANDS[command](player, args, room)
    return false
}


room.onPlayerAdminChange = function (player, _) {
    if (player.admin) {
        afkAdmins[player.id] = 0
    } else {
        delete afkAdmins[player.id]
    }
}

export function getPlayerByName(name: string){
    const playersAndDiscs = room.getPlayerList().map(p => {
        return {p: p, disc: room.getPlayerDiscProperties(p.id)}
    })
    const players = getRunningPlayers(playersAndDiscs)

    const player = players.find(pad => pad.p.name.toLowerCase() == name.toLowerCase());

    return player
}

/**
 * Check if admins are AFK and remove their admin status if they are.
 * 1 unit is 1/INV_TICK_RATE of a second, so INV_TICK_RATE units is 1 second.
 * 60u * 60 = 3600u = 60s = 1m.
 * 1m * 2 = 2 minutes.
 */

const INV_TICK_RATE = 5
const SECOND = INV_TICK_RATE
const MINUTE = 60 * SECOND

const MAX_AFK_TICKS = 2 * MINUTE
const MAX_AFK_WARNING_TICKS = MAX_AFK_TICKS - 5 * SECOND

function checkAdminsAFK() {
    for (const idStr in afkAdmins) {
        const id = Number(idStr)
        if (isNaN(id)) continue
        afkAdmins[id] = afkAdmins[id] + 1
        if (afkAdmins[id] >= MAX_AFK_TICKS) {
            log(`Admin ${room.getPlayer(Number(id)).name}[${id}] is AFK for too long, removing admin status`)
            room.setPlayerAdmin(Number(id), false)
            delete afkAdmins[id]
        } else if (afkAdmins[id] === MAX_AFK_WARNING_TICKS) {
            log("Removing admin status in 5 seconds or " + MAX_AFK_WARNING_TICKS + " ticks")
            sendErrorMessage(room, MESSAGES.ADMIN_AFK_WARNING(), id)
        }
    }
}

if (!LEAGUE_MODE) setInterval(checkAdminsAFK, 1000 / INV_TICK_RATE)


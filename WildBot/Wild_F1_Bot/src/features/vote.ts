import { Circuit } from "../circuits/Circuit";
import { sendAlertMessage, sendMessage, sendSuccessMessage } from "./chat";
import { setGhostMode } from "./ghost";
import { handleRREnabledCommand, qualyForPub } from "./handleCommands";
import { CIRCUITS, handleChangeMap } from "./maps";
import { MESSAGES } from "./messages";
import { playerList } from "./playerList";
import { resetPlayers } from "./players";
import { changeQuali } from "./qualiMode";

export let selectedCircuits: Circuit[] = [];
export let isOnVoteSession: boolean = false;

export function voteSession(room: RoomObject) {
    if (isOnVoteSession) {
        console.warn("Sessão de votação já em andamento.");
        return;
    }

    isOnVoteSession = true
    const players = room.getPlayerList();

    

    selectedCircuits = CIRCUITS.sort(() => 0.5 - Math.random()).slice(0, 3);

    sendAlertMessage(room, MESSAGES.TIME_TO_VOTE());
    selectedCircuits.forEach((circuit, index) => {
        room.sendAnnouncement(`${index + 1}: ${circuit.info?.name || "Nome não definido"}`);
    });

    players.forEach(player => {
        if (playerList[player.id]) playerList[player.id].voted = false;
    });

    selectedCircuits.forEach(circuit => {
        if (circuit.info) circuit.info.Votes = 0;
    });

    setTimeout(() => {
        const winnerCircuit = selectedCircuits.reduce((prev, curr) => {
            if (!prev.info || !curr.info) return prev;
            return prev.info.Votes! >= curr.info.Votes! ? prev : curr;
        });

        sendSuccessMessage(room, MESSAGES.CIRCUIT_CHOOSED(winnerCircuit.info?.name || "Nome não definido", winnerCircuit.info?.Votes ?? 0));
        console.log(winnerCircuit.info.BestTime);
        
        if(winnerCircuit.info.BestTime && winnerCircuit.info.BestTime.length > 1){
            room.sendAnnouncement(`Recorde: ${winnerCircuit.info.BestTime[0]} - ${winnerCircuit.info.BestTime[1]}`)
        }

        const winnerIndex = CIRCUITS.findIndex(circuit => circuit.info?.name === winnerCircuit.info?.name);


        selectedCircuits.forEach(circuit => {
            if (circuit.info) circuit.info.Votes = 0;
        });

        players.forEach(player => {
            if (playerList[player.id]) playerList[player.id].voted = false;
        });

        isOnVoteSession = false

        if (winnerIndex !== -1) {
            handleChangeMap(winnerIndex, room);
            resetPlayers(room)
            if(qualyForPub){
                changeQuali(true, room)
                setGhostMode(room, true)
                handleRREnabledCommand(undefined, ["true"], room);
                
            }
            room.startGame()
        } else {
            console.error("Circuito vencedor não encontrado no array CIRCUITS.");
        }

    }, 20000);
}

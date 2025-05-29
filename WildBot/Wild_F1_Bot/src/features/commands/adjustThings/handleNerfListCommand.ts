import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";
import { playerNerfList } from "../handleCommands";

export function handleNerfListCommand(
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
  if (args.length === 0) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  const playerId = args[0];

  let playerNumero: number | undefined;
  if (!isNaN(Number(playerId))) {
    playerNumero = Number(playerId);
  }

  const playersAndDiscs = getPlayerAndDiscs(room);
  const players = getRunningPlayers(playersAndDiscs);

  let playerEscolhido: { p: PlayerObject; disc: DiscPropertiesObject }[] = [];
  if (!playerId) {
    room.sendAnnouncement("Escolha um jogador", byPlayer.id, 0xff0000);
    return;
  }
  if (playerNumero !== undefined) {
    playerEscolhido = players.filter((p) => p.p.id === playerNumero);
  } else {
    room.sendAnnouncement("Player not found", byPlayer.id, 0xff0000);
    return;
  }
  if (playerEscolhido?.length === 0) {
    room.sendAnnouncement("Escolha um jogador válido", byPlayer.id, 0xff0000);
    return;
  }

  playerNerfList.push(playerEscolhido[0].p);

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

import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";

export let playerNerfList: PlayerObject[] = [];
export let playerBuffList: PlayerObject[] = [];

export function clearPlayerBuffAndNerfLists() {
  playerBuffList.length = 0;
  playerNerfList.length = 0;
}

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
  const playerBuffId = args[0];
  const playerNerfId = args[1];

  let playerBuffNumero: number | undefined;
  if (!isNaN(Number(playerBuffId))) {
    playerBuffNumero = Number(playerBuffId);
  }

  let playerNerfNumero: number | undefined;
  if (!isNaN(Number(playerNerfId))) {
    playerNerfNumero = Number(playerNerfId);
  }

  const playersAndDiscs = getPlayerAndDiscs(room);
  const players = getRunningPlayers(playersAndDiscs);

  let playerBuffEscolhido: { p: PlayerObject; disc: DiscPropertiesObject }[] =
    [];
  let playerNerfEscolhido: { p: PlayerObject; disc: DiscPropertiesObject }[] =
    [];
  if (!playerBuffId) {
    room.sendAnnouncement("Choose a player.", byPlayer.id, 0xff0000);
    return;
  }
  if (playerBuffNumero !== undefined) {
    const playerEscolhido = players.find((p) => p.p.id === playerBuffNumero);
    if (playerEscolhido) {
      playerBuffEscolhido = [playerEscolhido];
    } else {
      room.sendAnnouncement("Player buff not found", byPlayer.id, 0xff0000);
      return;
    }
  } else {
    room.sendAnnouncement("Choose a valid buff player", byPlayer.id, 0xff0000);
    return;
  }
  if (playerNerfNumero !== undefined) {
    const playerEscolhido = players.find((p) => p.p.id === playerNerfNumero);
    if (playerEscolhido) {
      playerNerfEscolhido = [playerEscolhido];
    } else {
      room.sendAnnouncement("Player nerf not found", byPlayer.id, 0xff0000);
      return;
    }
  }
  if (playerBuffEscolhido?.length === 0) {
    room.sendAnnouncement("Choose a valid player", byPlayer.id, 0xff0000);
    return;
  }
  playerBuffList.push(playerBuffEscolhido[0]?.p ?? []);
  playerNerfList.push(playerNerfEscolhido[0]?.p ?? []);

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

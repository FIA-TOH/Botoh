import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";

export function handleAjustPlayerCommand(
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
    room.sendAnnouncement(
      "Correct model !adjust [wear|laps] [id] [value]",
      byPlayer.id,
      0xff0000
    );
    return;
  }

  const adjust = args[0];
  const playerChoosen = args[1];
  const value = args[2];
  let playerNumero: number | undefined;

  if (adjust !== "wear" && adjust !== "laps") {
    room.sendAnnouncement(
      "Correct model !adjust [wear|laps] [id] [value]",
      byPlayer.id,
      0xff0000
    );
    return;
  }
  if (!isNaN(Number(playerChoosen))) {
    playerNumero = Number(playerChoosen);
  } else {
    room.sendAnnouncement(
      "Correct model !adjust [wear|laps] [id] [value]",
      byPlayer.id,
      0xff0000
    );
    return;
  }
  let valueNumber: number | undefined;
  if (!isNaN(Number(value))) {
    valueNumber = Number(value);
  } else {
    room.sendAnnouncement(
      "Correct model !adjust [wear|laps] [id] [value]",
      byPlayer.id,
      0xff0000
    );
    return;
  }
  const playersAndDiscs = getPlayerAndDiscs(room);

  const players = getRunningPlayers(playersAndDiscs);
  let playerEscolhido: { p: PlayerObject; disc: DiscPropertiesObject }[] = [];
  const playerInfo = playerList[playerEscolhido[0].p.id];

  if (!playerChoosen) {
    room.sendAnnouncement("Choose a player.", byPlayer.id, 0xff0000);
    return;
  }

  if (playerNumero !== undefined) {
    playerEscolhido = players.filter((p) => p.p.id === playerNumero);
  } else {
    room.sendAnnouncement("Player not found.", byPlayer.id, 0xff0000);
    return;
  }
  if (valueNumber !== undefined) {
    playerEscolhido = players.filter((p) => p.p.id === playerNumero);
  } else {
    room.sendAnnouncement("Value must be a number.", byPlayer.id, 0xff0000);
  }

  if (playerEscolhido?.length === 0) {
    room.sendAnnouncement("Choose a valid player.", byPlayer.id, 0xff0000);
    return;
  }

  if (adjust === "wear") {
    playerInfo.wear = valueNumber as number;
  } else if (adjust === "laps") {
    playerInfo.currentLap = valueNumber as number;
    playerInfo.currentSector = 3 as number;
  } else {
    room.sendAnnouncement(
      "Now you can only change wear or laps.",
      byPlayer.id,
      0xff0000
    );
    return;
  }
}

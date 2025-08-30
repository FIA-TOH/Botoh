import { Teams } from "../../changeGameState/teams";
import { handleAvatar, Situacions } from "../../changePlayerState/handleAvatar";
import {
  sendErrorMessage,
  sendGreenMessage,
  sendYellowMessage,
  sendRedMessage,
  sendBlueMessage,
  sendBlackMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { vsc, changeVSC } from "../../speed/handleSpeed";
import { getRunningPlayers } from "../../utils";
import {
  handlePresentationLapCommand,
  presentationLap,
} from "../gameState/handlePresentationLapCommand";

let flag = "green";

export function handleFlagCommand(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject
) {
  if (!room || !args) {
    return;
  }
  if (byPlayer && !byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (byPlayer && !args[0]) {
    room.sendAnnouncement(
      "Correct use !flag color [playerName]",
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

  const playersAndDiscs = getPlayerAndDiscs(room);
  let playerEscolhido: { p: PlayerObject; disc: DiscPropertiesObject }[] = [];
  const players = getRunningPlayers(playersAndDiscs);
  if (playerNumero !== undefined) {
    playerEscolhido = players.filter((p) => p.p.id === playerNumero);
  }

  if (flagChoosen === "reset") {
    if (vsc === true) {
      changeVSC();
    }
    if (presentationLap === true) {
      handlePresentationLapCommand(undefined, ["false"], room);
    }
    flag = "green";
  } else if (
    flagChoosen === "green" &&
    (vsc === true || presentationLap === true)
  ) {
    if (vsc === true) {
      changeVSC();
    }
    if (presentationLap === true) {
      handlePresentationLapCommand(undefined, ["false"], room);
    }
    flag = "green";
    sendGreenMessage(room, MESSAGES.GREEN_FLAG());
    sendGreenMessage(room, MESSAGES.GREEN_FLAG_TWO());

    players.forEach((player) => {
      handleAvatar(Situacions.Flag, player.p, room, undefined, ["🟩"], [5000]);
    });
  } else if (flagChoosen === "yellow" && vsc === false) {
    changeVSC();
    flag = "yellow";

    sendYellowMessage(room, MESSAGES.YELLOW_FLAG());
    sendYellowMessage(room, MESSAGES.YELLOW_FLAG_TWO());

    players.forEach((player) => {
      handleAvatar(Situacions.Flag, player.p, room, undefined, ["🟨"], [5000]);
    });
  } else if (flagChoosen === "red") {
    flag = "red";

    sendRedMessage(room, MESSAGES.RED_FLAG());
    sendRedMessage(room, MESSAGES.RED_FLAG_TWO());

    players.forEach((player) => {
      handleAvatar(Situacions.Flag, player.p, room, undefined, ["🟥"], [5000]);
    });
  } else if (flagChoosen === "blue") {
    if (byPlayer && !playerChoosen) {
      room.sendAnnouncement("Choose a player.", byPlayer.id, 0xff0000);
      return;
    }
    if (byPlayer && playerEscolhido?.length === 0) {
      room.sendAnnouncement("Choose a valid player.", byPlayer.id, 0xff0000);
      return;
    }
    flag = "blue";

    sendBlueMessage(room, MESSAGES.BLUE_FLAG(playerEscolhido[0].p.name));

    sendBlueMessage(
      room,
      MESSAGES.BLUE_FLAG_TO(playerEscolhido[0].p.name),
      playerEscolhido[0].p.id
    );

    handleAvatar(
      Situacions.Flag,
      playerEscolhido[0].p,
      room,
      undefined,
      ["🟦"],
      [5000]
    );
  } else if (flagChoosen === "black") {
    if (byPlayer && !playerChoosen) {
      room.sendAnnouncement("Choose a player.", byPlayer.id, 0xff0000);
      return;
    }
    if (byPlayer && (playerEscolhido?.length === 0 || !playerEscolhido)) {
      room.sendAnnouncement("Choose a valid player.", byPlayer.id, 0xff0000);
      return;
    }
    flag = "black";

    sendBlackMessage(room, MESSAGES.BLACK_FLAG(playerEscolhido[0].p.name));
    sendBlackMessage(
      room,
      MESSAGES.BLACK_FLAG_TWO(playerEscolhido[0].p.name),
      playerEscolhido[0].p.id
    );

    room.setPlayerTeam(playerEscolhido[0].p.id, Teams.SPECTATORS);

    handleAvatar(
      Situacions.Flag,
      playerEscolhido[0].p,
      room,
      undefined,
      ["⬛"],
      [5000]
    );
  }
}

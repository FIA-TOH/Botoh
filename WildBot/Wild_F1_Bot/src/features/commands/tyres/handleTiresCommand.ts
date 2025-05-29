import { gameMode, GameMode } from "../../changeGameState/changeGameModes";
import { gameState } from "../../changeGameState/gameState";
import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import { changeTires } from "../../tires&pits/changeTires";
import { ifInBoxZone } from "../../tires&pits/pits";
import { Tires } from "../../tires&pits/tires";
import { playerNerfList } from "../handleCommands";

export function handleTiresCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (room.getScores() && gameState !== undefined && gameState !== null) {
    if (
      !ifInBoxZone(
        { p: byPlayer, disc: room.getPlayerDiscProperties(byPlayer.id) },
        room
      ) &&
      room.getScores().time > 0
    ) {
      sendErrorMessage(room, MESSAGES.NOT_IN_BOXES(), byPlayer.id);
      return;
    }
    if (args.length === 0) {
      sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
      return;
    }

    if (LEAGUE_MODE && room.getScores().time > 0) {
      const boxAlertReversed = playerList[byPlayer.id].boxAlert
        .toString()
        .split("")
        .reverse()
        .join("");

      if (
        (args[1] !== boxAlertReversed || args.length !== 2) &&
        !playerNerfList.some((player) => player.name === byPlayer.name)
      ) {
        sendErrorMessage(room, MESSAGES.CODE_WRONG(), byPlayer.id);
        return;
      }
    }
    const tiresStr = args[0].toUpperCase();
    if (
      gameMode !== GameMode.TRAINING &&
      (tiresStr === "TRAIN" || tiresStr === "T")
    ) {
      sendErrorMessage(room, MESSAGES.INVALID_TIRES(), byPlayer.id);
      return;
    }

    // console.log("PlayerInfo", playerList[byPlayer.id]);

    // if (
    //     playerNerfList.some(player => player.name === byPlayer.name) &&
    //     playerList[byPlayer.id].pits.pitsAttemp < 2
    // ) {
    //     playerList[byPlayer.id].pits.pitsAttemp++;
    //     sendErrorMessage(room, MESSAGES.CODE_WRONG(), byPlayer.id);
    //     return;
    // }

    for (let tiresKey in Tires) {
      if (tiresKey === tiresStr || tiresKey[0] === tiresStr) {
        changeTires(
          { p: byPlayer, disc: room.getPlayerDiscProperties(byPlayer.id) },
          tiresKey as Tires,
          room
        );
        playerList[byPlayer.id].tires = tiresKey as Tires;
        playerList[byPlayer.id].wear = 0;
        playerList[byPlayer.id].kers = Math.min(
          playerList[byPlayer.id].kers + 20,
          100
        );
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

import { sendAlertMessage, sendErrorMessage } from "../chat/chat";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { CIRCUITS, currentMapIndex } from "../zones/maps";
import { MESSAGES } from "../chat/messages";
import { playerList } from "../changePlayerState/playerList";
import { inHitbox, getRunningPlayers } from "../utils";
import { handleExplainTyresCommand } from "../commands/tyres/handleExplainTyresCommand";
import { generatePitResult } from "./pitStopFunctions";
import { Teams } from "../changeGameState/teams";

function ifInPitlaneStart(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    inHitbox(player, CIRCUITS[currentMapIndex].info.pitlaneStart)
  );
}

function ifInPitlaneEnd(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    inHitbox(player, CIRCUITS[currentMapIndex].info.pitlaneEnd)
  );
}

export function handlePitlane(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  players.forEach((player) => {
    const p = player.p;
    if (ifInPitlaneStart(player, room) && !playerList[p.id].inPitlane) {
      playerList[p.id].pitFailures = generatePitResult(p);

      playerList[p.id].pits.pitsNumber += 1;
      playerList[p.id].inPitlane = true;
      if (LEAGUE_MODE) {
        //Code system for box
        // if (playerList[player.p.id].boxAlert === false) {
        //   const numero = Math.floor(1000 + Math.random() * 9000);
        //   playerList[player.p.id].boxAlert = numero;
        //   sendAlertMessage(room, MESSAGES.CODE_BOX(numero), player.p.id);
        // }
      } else {
        //Code system for box
        // if (playerList[player.p.id].boxAlert === false) {
        if (!player.p.admin) {
          handleExplainTyresCommand(player.p, undefined, room);
        }

        //   playerList[player.p.id].boxAlert = true;
        // }
      }
    }

    //Code system for box
    if (ifInPitlaneEnd(player, room) && playerList[p.id].inPitlane) {
      if (playerList[p.id].canLeavePitLane === false) {
        playerList[p.id].canLeavePitLane = true;
        sendErrorMessage(room, MESSAGES.CANNOT_LEAVE_BOX(), p.id);

        room.setPlayerTeam(p.id, Teams.SPECTATORS); //Spectators
        return;
      }
      playerList[p.id].inPitlane = false;

      // if (LEAGUE_MODE && playerList[player.p.id].boxAlert !== false) {
      //   playerList[player.p.id].boxAlert = false;
      // }
    }
  });
}

export function ifInBoxZone(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    inHitbox(player, CIRCUITS[currentMapIndex].info.boxLine)
  );
}

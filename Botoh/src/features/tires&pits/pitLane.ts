import { sendErrorMessage, sendRadioMessage } from "../chat/chat";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { CIRCUITS, currentMapIndex } from "../zones/maps";
import { MESSAGES } from "../chat/messages";
import { getPreparedPitTire, playerList } from "../changePlayerState/playerList";
import { applyPlayerCollision } from "../changePlayerState/playerCollision";
import { inHitbox, getRunningPlayers } from "../utils";
import { handleExplainTyresCommand } from "../commands/tyres/handleExplainTyresCommand";
import { generatePitResult } from "./pitStopFunctions";
import { Teams } from "../changeGameState/teams";
import { isPitNewSystemEnabled } from "./newPitSystem/newPitManager";
import { Tires, tyresActivated } from "./tires";

const PREPARED_TYRE_LABELS: Record<Tires, string> = {
  [Tires.SOFT]: "Soft",
  [Tires.MEDIUM]: "Medium",
  [Tires.HARD]: "Hard",
  [Tires.INTER]: "Inter",
  [Tires.WET]: "Wet",
  [Tires.FLAT]: "Flat",
  [Tires.TRAIN]: "Train",
};

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
      if (!isPitNewSystemEnabled()) {
        playerList[p.id].pitFailures = generatePitResult(p);
      }

      playerList[p.id].pits.pitsNumber += 1;
      playerList[p.id].lastPitlaneLap = playerList[p.id].currentLap;
      playerList[p.id].inPitlane = true;
      applyPlayerCollision(room, p.id);
      const preparedTyre = getPreparedPitTire(p.id, p.name);
      if (preparedTyre) {
        sendRadioMessage(
          room,
          MESSAGES.PREPARED_PIT_TYRE_ON_ENTRY(PREPARED_TYRE_LABELS[preparedTyre]),
          p.id
        );
      }
      if (!LEAGUE_MODE && tyresActivated && !player.p.admin) {
        handleExplainTyresCommand(player.p, undefined, room);
      }
    }

    if (ifInPitlaneEnd(player, room) && playerList[p.id].inPitlane) {
      if (playerList[p.id].canLeavePitLane === false) {
        playerList[p.id].canLeavePitLane = true;
        sendErrorMessage(room, MESSAGES.CANNOT_LEAVE_BOX(), p.id);

        room.setPlayerTeam(p.id, Teams.SPECTATORS);
        return;
      }
      playerList[p.id].inPitlane = false;
      applyPlayerCollision(room, p.id);
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

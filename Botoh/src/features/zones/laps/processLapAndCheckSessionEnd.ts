import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { Teams } from "../../changeGameState/teams";
import { playerList } from "../../changePlayerState/playerList";
import { sendSuccessMessage, sendBlueMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { handleHardQualyEnd } from "../../commands/gameMode/qualy/hardQualyFunctions";
import { qualiTime } from "../../commands/gameMode/qualy/qualiMode";
import { showPlayerQualiPosition } from "../../commands/gameMode/qualy/showPositionQualy";
import { laps } from "../laps";
import { handleRaceFinish } from "./handleRaceFinish";
import { notifyCurrentLapAndPitInfo } from "./utils/annoucements/notifyCurrentLapAndPitInfo";
import { notifyPositionOrLeaders } from "./utils/annoucements/notifyPositionsOrLeader";
import { registerLapPosition } from "./utils/registerLapPosition";
import { isPlayerLapped, getLapDeficit, setLapDeficit, clearLappedCarAvatar, isSCActive } from "../../commands/flagsAndVSC/handleSCCommand";

export function processLapAndCheckSessionEnd(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject,
  lapTime: number,
  playerAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
) {
  const p = pad.p;
  const playerData = playerList[p.id];
  const currentLap = playerData.currentLap;

  if (handleHardQualyEnd(p, room, currentLap)) return;

  if (generalGameMode !== GeneralGameMode.GENERAL_QUALY) {
    handleRaceLap(p, room, lapTime, currentLap, playerAndDiscs);
  } else {
    handleQualyLap(p, room);
  }
}

function handleRaceLap(
  p: PlayerObject,
  room: RoomObject,
  lapTime: number,
  currentLap: number,
  playerAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
) {
  const lapIndex = currentLap - 2;
  const position = registerLapPosition(p, lapIndex, currentLap, lapTime);

  if (gameMode === GameMode.TRAINING) return;

  // Handle lapped car lap deficit reduction when crossing finish line
  if (isPlayerLapped(p.id) && isSCActive()) {
    const currentDeficit = getLapDeficit(p.id);
    if (currentDeficit > 0) {
      const newDeficit = currentDeficit - 1;
      setLapDeficit(p.id, newDeficit);
      
      if (newDeficit === 0) {
        // Lapped car has caught up to the grid
        clearLappedCarAvatar(p.id, room);
        sendBlueMessage(room, MESSAGES.LAPPED_NORMALIZED_LAPS(p.name));
      } else {
        // Still has laps to catch up
        sendBlueMessage(room, MESSAGES.LAPPED_REMAINING_LAPS(p.name, newDeficit));
      }
    }
  }

  if (currentLap <= laps) {
    notifyCurrentLapAndPitInfo(p, room, currentLap);
    notifyPositionOrLeaders(
      p,
      room,
      lapIndex,
      position,
      currentLap,
      playerAndDiscs,
    );
  } else {
    handleRaceFinish(p, room, lapTime, position === 1);
  }
}

function handleQualyLap(p: PlayerObject, room: RoomObject) {
  if (playerList[p.id].lastLapValid) {
    showPlayerQualiPosition(room, p.id);
  }

  if (gameMode === GameMode.HARD_QUALY) {
    return;
  }

  if (room.getScores().time >= qualiTime * 60) {
    sendSuccessMessage(room, MESSAGES.FINISH_QUALI(), p.id);
    room.setPlayerTeam(p.id, Teams.SPECTATORS);
  }
}

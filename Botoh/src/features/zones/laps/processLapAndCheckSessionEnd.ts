import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { Teams } from "../../changeGameState/teams";
import { playerList } from "../../changePlayerState/playerList";
import { sendSuccessMessage, sendBlueMessage, sendAlertMessage } from "../../chat/chat";
import { isWECModeEnabled } from "../../changeGameState/wecMode";
import { crossWECFinishLine } from "../../changeGameState/wecRace";
import { updateWECRaceClock } from "../../changeGameState/wecRaceAnnouncements";
import { MESSAGES } from "../../chat/messages";
import { handleHardQualyEnd } from "../../commands/gameMode/qualy/hardQualyFunctions";
import { qualiTime } from "../../commands/gameMode/qualy/qualiMode";
import { showPlayerQualiPosition } from "../../commands/gameMode/qualy/showPositionQualy";
import { laps, setCurrentSessionLap } from "../laps";
import { handleRaceFinish } from "./handleRaceFinish";
import { notifyCurrentLapAndPitInfo } from "./utils/annoucements/notifyCurrentLapAndPitInfo";
import { notifyPositionOrLeaders } from "./utils/annoucements/notifyPositionsOrLeader";
import { registerLapPosition } from "./utils/registerLapPosition";
import { isPlayerLapped, getLapDeficit, setLapDeficit, clearLappedCarAvatar, isSCActive } from "../../commands/flagsAndVSC/handleSCCommand";

const QUALY_OVERTIME_EPSILON_SECONDS = 0.5;

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

  if (isPlayerLapped(p.id) && isSCActive()) {
    const currentDeficit = getLapDeficit(p.id);
    if (currentDeficit > 0) {
      const newDeficit = currentDeficit - 1;
      setLapDeficit(p.id, newDeficit);
      
      if (newDeficit === 0) {
        clearLappedCarAvatar(p.id, room);
        sendBlueMessage(room, MESSAGES.LAPPED_NORMALIZED_LAPS(p.name));
      } else {
        sendBlueMessage(room, MESSAGES.LAPPED_REMAINING_LAPS(p.name, newDeficit));
      }
    }
  }

  if (isWECModeEnabled()) {
    updateWECRaceClock(room);
    // At a crossing the driver's lap has just incremented. A running car
    // already on that lap (or beyond it) is ahead; spectators/retirees are not.
    const isLeader = !playerAndDiscs.some(({ p: other, disc }) =>
      other.id !== p.id && other.team === Teams.RUNNERS && disc &&
      (playerList[other.id]?.currentLap ?? 0) >= currentLap,
    );
    const result = crossWECFinishLine(p.id, isLeader);
    setCurrentSessionLap(currentLap);
    if (result.finalLapStarted) {
      sendAlertMessage(room, MESSAGES.WEC_FINAL_LAP(p.name));
    }
    if (result.finish) {
      handleRaceFinish(p, room, lapTime, result.isWinner);
    } else {
      notifyCurrentLapAndPitInfo(p, room, currentLap);
      notifyPositionOrLeaders(p, room, lapIndex, position, currentLap, playerAndDiscs);
    }
    return;
  }

  if (currentLap <= laps) {
    setCurrentSessionLap(currentLap);
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

  if (isQualyOvertime(room)) {
    sendSuccessMessage(room, MESSAGES.FINISH_QUALI(), p.id);
    room.setPlayerTeam(p.id, Teams.SPECTATORS);
  }
}

function isQualyOvertime(room: RoomObject) {
  if (qualiTime === Number.MAX_VALUE) return false;

  const scores = room.getScores();
  if (!scores) return false;

  return scores.time + QUALY_OVERTIME_EPSILON_SECONDS >= qualiTime * 60;
}

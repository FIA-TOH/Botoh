import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { qualiTime } from "../../changeGameState/qualy/qualiMode";
import { showPlayerQualiPosition } from "../../changeGameState/qualy/showPositionQualy";
import { Teams } from "../../changeGameState/teams";
import { playerList } from "../../changePlayerState/playerList";
import { sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { handleHardQualyEnd } from "../../commands/gameMode/qualy/hardQualyFunctions";
import { laps } from "../laps";
import { handleRaceFinish } from "./handleRaceFinish";
import { notifyCurrentLapAndPitInfo } from "./utils/annoucements/notifyCurrentLapAndPitInfo";
import { notifyPositionOrLeaders } from "./utils/annoucements/notifyPositionsOrLeader";
import { registerLapPosition } from "./utils/registerLapPosition";

export function processLapAndCheckSessionEnd(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject,
  lapTime: number,
  playerAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[]
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
  playerAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[]
) {
  const lapIndex = currentLap - 2;
  const position = registerLapPosition(p, lapIndex, currentLap, lapTime);

  if (gameMode === GameMode.TRAINING) return;

  if (currentLap <= laps) {
    notifyCurrentLapAndPitInfo(p, room, currentLap);
    notifyPositionOrLeaders(
      p,
      room,
      lapIndex,
      position,
      currentLap,
      playerAndDiscs
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

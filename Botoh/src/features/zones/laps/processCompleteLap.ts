import { error } from "console";
import {
  getAbbreviatedTrackName,
  getBestTime,
} from "../../../circuits/bestTimes";
import { playerList } from "../../changePlayerState/playerList";
import { handleDRS } from "../../drs/handleDrs";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { ACTUAL_CIRCUIT } from "../../roomFeatures/stadiumChange";
import { processLapAndCheckSessionEnd } from "./processLapAndCheckSessionEnd";
import { trySetBestLap } from "./trackBestLap";
import { getLapTime } from "./utils/getLapTime";
import { handleBestTimes } from "./utils/handleBestTimes";
import { handleHardQualiAttempts } from "../../commands/gameMode/qualy/hardQualyFunctions";
import { announceSectorTimes } from "./utils/annoucements/annouceSectorTimes";
import { annouceTyreWear } from "./utils/annoucements/annouceTyreWear";
import { InvalidateLap } from "../../detectCut/invalidateLap";
import { log } from "../../discord/logger";
import { GeneralGameMode, generalGameMode } from "../../changeGameState/changeGameModes";
import { recordLap } from "./lapHistory";
import {
  getPublicCircuitLapRecordForTrack,
  getPublicDriverBestLapForTrack,
  recordPublicLapForPlayer,
} from "../../public/publicCircuits";

export function processCompletedLap(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject,
  hasSector: boolean
) {
  const p = pad.p;
  const playerData = playerList[p.id];
  const playerAndDiscs = getPlayerAndDiscs(room);

  handleDRS(playerData, room);
  const lapTime = getLapTime(playerData, hasSector);

  const abbreviatedTrackName = getAbbreviatedTrackName(
    ACTUAL_CIRCUIT.info.name
  );
  if (!abbreviatedTrackName)
    return log("No circuit abreviated track name found");

  InvalidateLap(playerData, room, p);
  recordLap(p.id, lapTime, playerData.lastLapValid ?? true);

  const publicCircuitBestTime = getPublicCircuitLapRecordForTrack(ACTUAL_CIRCUIT.info.name);
  const publicDriverBestTime = getPublicDriverBestLapForTrack(ACTUAL_CIRCUIT.info.name, p.id);
  const circuitBestTime = getBestTime(ACTUAL_CIRCUIT.info.name);
  if (!circuitBestTime) return log("No circuit best time found");
  const effectiveCircuitBestTime = publicCircuitBestTime ?? circuitBestTime[0];
  const isFastestLapRace = trySetBestLap(
    p.name,
    lapTime,
    playerData.currentLap - 1,
    playerData.lastLapValid ?? true
  );

  handleBestTimes(
    room,
    p,
    lapTime,
    effectiveCircuitBestTime,
    isFastestLapRace,
    publicDriverBestTime,
  );

  if (playerData.lastLapValid) {
    recordPublicLapForPlayer(ACTUAL_CIRCUIT.info.name, p, lapTime, [
      playerData.sectorTime[0] ?? null,
      playerData.sectorTime[1] ?? null,
      playerData.sectorTime[2] ?? null,
    ]);
  }

  handleHardQualiAttempts(room, p, lapTime, playerData);

  if (hasSector && generalGameMode !== GeneralGameMode.GENERAL_RACE) announceSectorTimes(room, p.id, playerData);

  annouceTyreWear(room, p, playerData);

  processLapAndCheckSessionEnd(pad, room, lapTime, playerAndDiscs);
}

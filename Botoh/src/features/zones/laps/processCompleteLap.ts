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
    return console.log("No circuit abreviated track name found");

  const circuitBestTime = getBestTime(ACTUAL_CIRCUIT.info.name);
  if (!circuitBestTime) return console.log("No circuit best time found");
  const isFastestLapRace = trySetBestLap(
    p.name,
    lapTime,
    playerData.currentLap - 1
  );

  handleBestTimes(room, p, lapTime, circuitBestTime[0], isFastestLapRace);

  handleHardQualiAttempts(room, p, lapTime, playerData);

  if (hasSector) announceSectorTimes(room, p.id, playerData);

  annouceTyreWear(room, p, playerData);

  processLapAndCheckSessionEnd(pad, room, lapTime, playerAndDiscs);
}

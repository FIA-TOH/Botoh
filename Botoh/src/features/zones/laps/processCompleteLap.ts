import {
  getAbbreviatedTrackName,
  bestTimes,
  updateBestTime,
} from "../../../circuits/bestTimes";
import {
  GameMode,
  gameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { updatePlayerTime } from "../../changeGameState/qualy/playerTime";
import { getNumberPositionQualy } from "../../changeGameState/qualy/showPositionQualy";
import { playerList } from "../../changePlayerState/playerList";
import {
  sendBestTimeRace,
  sendBestTimeEver,
  sendWorseTime,
  sendChatMessage,
  sendSuccessMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { tyresActivated } from "../../commands/tyres/handleEnableTyresCommand";
import {
  sendDiscordGeneralChatQualy,
  sendDiscordTrackRecord,
} from "../../discord/discord";
import { log } from "../../discord/logger";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
// import { rainEnabled, rainIntensity } from "../../rain/rain";
import { ACTUAL_CIRCUIT } from "../../roomFeatures/stadiumChange";
import { Tires } from "../../tires&pits/tires";
import { serialize, someArray } from "../../utils";
import { drsOn, enableDRS } from "../handleDRSZone";
import { broadcastLapTimeToPlayers } from "./broadcastTimeToPlayer";
import { processLapAndCheckSessionEnd } from "./processLapAndCheckSessionEnd";
import { trySetBestLap } from "./trackBestLap";

export function processCompletedLap(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject,
  hasSector: boolean
) {
  const p = pad.p;
  const playerData = playerList[p.id];
  const playerAndDiscs = getPlayerAndDiscs(room);

  if (playerData.currentLap === 2 && !drsOn) enableDRS(room);

  let lapTime = serialize(playerData.lapTime);
  if (hasSector) lapTime = serialize(someArray(playerData.sectorTime));

  const bestTimeP = serialize(playerData.bestTime);
  const abbreviatedTrackName = getAbbreviatedTrackName(
    ACTUAL_CIRCUIT.info.name
  );

  if (!abbreviatedTrackName) {
    log(`Circuit ${ACTUAL_CIRCUIT.info.name} not found on the name mapping.`);
    return;
  }

  const circuitBestTime = bestTimes[abbreviatedTrackName]?.[0] ?? 999.999;
  const isFastestLapRace = trySetBestLap(
    p.name,
    lapTime,
    playerData.currentLap - 1
  );

  if (typeof circuitBestTime === "number" && lapTime < circuitBestTime) {
    updateBestTime(ACTUAL_CIRCUIT.info.name, lapTime, p.name);
    playerData.bestTime = lapTime;

    sendBestTimeEver(room, MESSAGES.TRACK_RECORD(p.name, lapTime));
    sendDiscordTrackRecord(p.name, lapTime);
    updatePlayerTime(p.name, lapTime, p.id, playerData.leagueTeam);
  } else {
    if (isFastestLapRace) {
      sendBestTimeRace(room, MESSAGES.FASTEST_LAP(p.name, lapTime));
    }

    if (lapTime < bestTimeP || bestTimeP === undefined) {
      sendSuccessMessage(room, MESSAGES.LAP_TIME(lapTime), p.id);
      playerData.bestTime = lapTime;
      broadcastLapTimeToPlayers(room, lapTime, p.name);
      updatePlayerTime(p.name, lapTime, p.id, playerData.leagueTeam);
    } else {
      sendWorseTime(
        room,
        MESSAGES.WORSE_TIME(lapTime, serialize(lapTime - bestTimeP)),
        p.id
      );
      broadcastLapTimeToPlayers(room, lapTime, p.name, false);
    }
  }
  if (gameMode === GameMode.HARD_QUALY) {
    if (playerData.currentLap === 2) {
      sendDiscordGeneralChatQualy(
        `${
          playerData.currentLap - 1
        }st attemp: ${lapTime.toString()}s - P${getNumberPositionQualy(
          room,
          p.id
        )}`
      );
    } else if (playerData.currentLap === 3) {
      sendDiscordGeneralChatQualy(
        `${
          playerData.currentLap - 1
        }nd attemp: ${lapTime.toString()}s - P${getNumberPositionQualy(
          room,
          p.id
        )}`
      );
    } else if (playerData.currentLap === 4) {
      sendDiscordGeneralChatQualy(
        `${
          playerData.currentLap - 1
        }rd attemp: ${lapTime.toString()}s - P${getNumberPositionQualy(
          room,
          p.id
        )}`
      );
    } else {
      sendDiscordGeneralChatQualy(
        `${
          playerData.currentLap - 1
        }th attemp: ${lapTime.toString()}s - P${getNumberPositionQualy(
          room,
          p.id
        )}`
      );
    }
  }
  if (hasSector) {
    room.sendAnnouncement(
      `Sector 1: ${playerData.sectorTime[0]} | Sector 2: ${playerData.sectorTime[1]} | Sector 3: ${playerData.sectorTime[2]}`,
      p.id,
      0xff8f00
    );
  }
  // if (rainEnabled) {
  //   sendChatMessage(
  //     room,
  //     MESSAGES.RAIN_INTENSITY_LAP(Math.round(rainIntensity)),
  //     p.id
  //   );
  // }
  if (
    tyresActivated &&
    generalGameMode !== GeneralGameMode.GENERAL_QUALY &&
    playerData.tires !== Tires.FLAT
  )
    sendChatMessage(
      room,
      MESSAGES.TYRE_WEAR_LAP(100 - Math.round(playerData.wear)),
      p.id
    );

  processLapAndCheckSessionEnd(pad, room, lapTime, playerAndDiscs);
}

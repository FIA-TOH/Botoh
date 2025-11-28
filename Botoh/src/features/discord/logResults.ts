import {
  GameMode,
  gameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
import { getPlayersOrderedByQualiTime } from "../changeGameState/qualy/playerTime";
import { positionList } from "../changeGameState/race/positionList";
import { TIRE_AVATAR } from "../changePlayerState/handleAvatar";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { getBestPit } from "../tires&pits/trackBestPit";
import { getTimestamp } from "../utils";
import { laps } from "../zones/laps";
import { getBestLap } from "../zones/laps/trackBestLap";
import { sendDiscordResult } from "./discord";

function formatTimeSec(seconds: number): string {
  if (seconds <= 0 || seconds === Number.MAX_VALUE || !isFinite(seconds)) {
    return "--:--.---";
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);
  return `${minutes}:${secs.toString().padStart(2, "0")}.${millis
    .toString()
    .padStart(3, "0")}`;
}

export function sendQualiResultsToDiscord() {
  const orderedList = getPlayersOrderedByQualiTime();
  if (orderedList.length === 0) return;

  const pole = orderedList[0];

  let gameModeResult;
  if (generalGameMode === GeneralGameMode.GENERAL_QUALY) {
    gameModeResult = "QUALIFYING";
  } else if (gameMode === GameMode.TRAINING) {
    gameModeResult = "TRAINING";
  } else {
    gameModeResult = "OTHER";
  }

  const header =
    `\n🏁 ${gameModeResult} RESULTS - ${ACTUAL_CIRCUIT.info.name} 🏁` +
    `\nTime: ${getTimestamp()}` +
    "\nPos | Driver (Team)     | Gap       | Best Lap " +
    "\n---------------------------------------------------------------------";

  let body = "";
  orderedList.forEach((p, idx) => {
    const pos = (idx + 1).toString().padStart(2, " ");
    const team = p.team ? `(${p.team})` : "";
    const nameWithTeam = `${p.name.trim()} ${team}`.padEnd(20, " ");

    const bestLap = formatTimeSec(p.time);

    let gap = "--";
    if (idx > 0 && p.time > 0 && pole.time > 0) {
      const diff = p.time - pole.time;
      gap = "+" + formatTimeSec(diff);
    }

    body += `\n${pos}  | ${nameWithTeam} | ${gap.padEnd(9)} | ${bestLap.padEnd(
      9
    )}`;
  });

  sendDiscordResult(header + body);
}
export function sendRaceResultsToDiscord() {
  if (positionList.length === 0) return;
  let gameModeResult;
  if (gameMode === GameMode.RACE) {
    gameModeResult = "RACE";
  } else if (gameMode === GameMode.INDY) {
    gameModeResult = "INDY";
  } else {
    gameModeResult = "OTHER";
  }

  const winner = positionList[0];
  const header =
    "```" +
    `\n🏁 FINAL ${gameModeResult} RESULTS - ${ACTUAL_CIRCUIT.info.name} 🏁` +
    `\nTime: ${getTimestamp()}` +
    `\nLaps: ${laps}` +
    "\nPos | Driver (Team)     | Gap       | Total Time  | Fast Lap  | Laps | Pits" +
    "\n-------------------------------------------------------------------------------";

  let body = "";
  positionList.forEach((p, idx) => {
    const pos = (idx + 1).toString().padStart(2, " ");
    const team = p.team ? `(${p.team})` : "";
    const nameWithTeam = `${p.name.trim()} ${team}`.padEnd(20, " ");
    const totalTime = formatTimeSec(p.totalTime);
    const fastLap = formatTimeSec(p.time);
    const lapsStr = p.lap.toString().padStart(2, "0");

    let gap = "--";
    if (idx > 0 && p.totalTime > 0 && winner.totalTime > 0) {
      const diff = p.totalTime - winner.totalTime;
      gap = "+" + formatTimeSec(diff);
    }

    let pitsVisual = "";
    if (p.pitsInfo?.pit && p.pitsInfo.pit.length > 0) {
      const tyres = p.pitsInfo.pit.map((pit) => TIRE_AVATAR[pit.tyre]);
      const lapsPit = p.pitsInfo.pit.map((pit) => pit.lap);
      pitsVisual = `${tyres.join("→")}   (${lapsPit.join(", ")})`;
    }

    body += `\n${pos}  | ${nameWithTeam} | ${gap.padEnd(
      9
    )} | ${totalTime.padEnd(10)} | ${fastLap.padEnd(
      9
    )} | ${lapsStr}  | ${pitsVisual}`;
  });

  const bestLap = getBestLap();
  const bestPit = getBestPit();

  if (bestLap) {
    body += `\n\n⚡ Fastest Lap: ${bestLap.playerName} - ${formatTimeSec(
      bestLap.lapTime
    )} (Lap ${bestLap.lapNumber})`;
  }

  if (bestPit) {
    body += `\n🔧 Fastest Pit: ${
      bestPit.playerName
    } - ${bestPit.pitTime.toFixed(3)}s (Stop ${bestPit.pitNumber})`;
  }

  const footer = "\n```";
  sendDiscordResult(header + body + footer);
}

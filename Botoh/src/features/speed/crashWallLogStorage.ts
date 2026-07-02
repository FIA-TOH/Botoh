import {
  sendDiscordCutTrack,
  splitCutMessageIntoSafeBlocks,
} from "../discord/discord";

interface CrashWallLog {
  trackName: string;
  playerName: string;
  wallIndex: string | number;
  crashTime: string;
  didDamage: boolean;
}

let crashWallLogs: CrashWallLog[] = [];

export function addCrashWallLog(data: CrashWallLog) {
  try {
    crashWallLogs.push(data);
  } catch (err) {
    console.error("[CRASH WALL LOG STORAGE ERROR - ADD]:", err);
  }
}

export function clearCrashWallLogs() {
  crashWallLogs = [];
}

export function sendAllCrashWallLogsToDiscord() {
  try {
    if (crashWallLogs.length === 0) return;

    const header = "**CRASH WALL REPORT**\n";
    const lines = crashWallLogs.map((log, index) => {
      return (
        `#${index + 1}\n` +
        `Driver: **${log.playerName}**\n` +
        `Track: ${log.trackName}\n` +
        `Wall index: ${log.wallIndex}\n` +
        `Time: ${log.crashTime}\n` +
        `Damage wall: ${log.didDamage ? "yes" : "no"}\n` +
        `------------------------------------`
      );
    });

    const fullReport = header + "\n" + lines.join("\n");
    const chunks = splitCutMessageIntoSafeBlocks(fullReport);

    chunks.forEach((block) => sendDiscordCutTrack(block));
  } catch (err) {
    console.error("[CRASH WALL LOG STORAGE ERROR - SEND]:", err);
  }
}

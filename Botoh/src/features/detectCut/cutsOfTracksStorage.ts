import {
  sendDiscordCutTrack,
  splitCutMessageIntoSafeBlocks,
} from "../discord/discord";

interface CutOfTrack {
  trackName: string;
  cutLap: number;
  cutTime: string;
  cutSectors: number;
  playerName: string;
}

export let cutsOfTracksStorage: CutOfTrack[] = [];

export function addCutTrackToStorage(data: CutOfTrack) {
  try {
    cutsOfTracksStorage.push(data);
  } catch (err) {
    console.error("❌ [CUT_TRACK STORAGE ERROR - ADD]:", err);
  }
}

export function clearCutTrackStorage() {
  cutsOfTracksStorage = [];
}

export function sendAllCutsToDiscord() {
  try {
    if (cutsOfTracksStorage.length === 0) {
      return;
    }

    const header = "🏁 **CUT TRACK REPORT**\n";
    const lines = cutsOfTracksStorage.map((cut, index) => {
      return (
        `#${index + 1}\n` +
        `👤 Driver: **${cut.playerName}**\n` +
        `🛣️ Track: ${cut.trackName}\n` +
        `⏱️ Lap Time: ${cut.cutTime}\n` +
        `📏 Sectors: ${cut.cutSectors}\n` +
        `🔁 Lap: ${cut.cutLap}\n` +
        `------------------------------------`
      );
    });

    const fullReport = header + "\n" + lines.join("\n");

    const chunks = splitCutMessageIntoSafeBlocks(fullReport);

    chunks.forEach((block) => sendDiscordCutTrack(block));
  } catch (err) {
    console.error("❌ [CUT_TRACK STORAGE ERROR - SEND]:", err);
  }
}

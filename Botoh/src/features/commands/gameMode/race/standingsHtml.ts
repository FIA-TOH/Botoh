import * as fs from "fs";
import * as path from "path";
import { positionList } from "./positionList";
import { playerList } from "../../../changePlayerState/playerList";
import { getBestPit } from "../../../tires&pits/trackBestPit";
import { getBestLap } from "../../../zones/laps/trackBestLap";

export interface StandingsRow {
  position: number;
  name: string;
  pits: number;
  bestLap: number;
  laps: number;
  gap: string;
  team: string | null;
}

/**
 * Generate HTML standings table from positionList and playerList.
 * Returns HTML string ready to write to file.
 */
export function generateStandingsHtml(): string {
  const bestLap = getBestLap();
  const bestPit = getBestPit();

  const rows: StandingsRow[] = positionList.map((p, idx) => ({
    position: idx + 1,
    name: p.name,
    pits: p.pits,
    bestLap: p.time,
    laps: playerList[p.id]?.currentLap ?? 0,
    gap:
      idx === 0 ? "+0.00" : `+${(p.time - positionList[0].time).toFixed(3)}s`,
    team: p.team ?? null,
  }));

  const timestamp = new Date().toLocaleString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Race Standings</title>
  <style>
    /* Compact scoreboard style */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "Tomorrow", "Arial", sans-serif;
      background: #0f0f10;
      color: #fff;
      padding: 8px;
    }
    .container {
      width: 360px;
      margin: 6px auto;
    }
    .score-header {
      background: #1e0e0e;
      color: #ff3b30;
      padding: 8px 10px;
      border-radius: 6px 6px 0 0;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 14px;
    }
    .timestamp {
      text-align: center;
      font-size: 10px;
      color: #bdbdbd;
      margin: 6px 0 8px 0;
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 6px;
      font-size: 12px;
    }
    thead th {
      color: #ff3b30;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      background: transparent;
      padding: 4px 6px;
      text-align: left;
      letter-spacing: 1px;
    }
    tbody tr {
      color: #fff;
      height: 28px;
      display: table-row; /* preserve row layout */
    }
    tbody td {
      padding: 4px 6px;
      vertical-align: middle;
      background: #201818;
      border-radius: 6px;
      margin-bottom: 6px;
    }
    /* make each cell look like a pill by using box-shadow to separate cells */
    tbody td + td { margin-left: 6px; }
    .pos {
      width: 36px;
      color: #ff3b30;
      font-weight: 800;
      text-align: left;
      padding-left: 8px;
    }
    .name {
      text-transform: uppercase;
      font-weight: 700;
      width: 120px;
      color: #fff;
    }
    .team {
      width: 80px;
      text-transform: uppercase;
      color: #cfcfcf;
      font-weight: 700;
    }
    .gap {
      width: 60px;
      color: #dcdcdc;
      text-align: right;
      font-weight: 700;
    }
    .laps {
      width: 36px;
      text-align: center;
      color: #f2f2f2;
    }
    .pits {
      width: 36px;
      text-align: center;
      color: #f2f2f2;
    }
    .info-box {
      margin-top: 10px;
      padding: 8px;
      background: #151212;
      border-radius: 6px;
      font-size: 11px;
      color: #cfcfcf;
    }
    .info-row { margin-bottom: 6px; }
    .small { font-size: 11px; color: #bdbdbd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="score-header">FORMULA HAXBALL RACE</div>
    <div class="timestamp">Last updated: ${timestamp}</div>

    <table>
      <thead>
        <tr>
          <th>P</th>
          <th>NAME</th>
          <th>TEAM</th>
          <th>GAP</th>
          <th>LAPS</th>
          <th>PITS</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `
        <tr>
          <td class="pos">${r.position}</td>
          <td class="name">${escapeHtml(r.name)}</td>
          <td class="team">${escapeHtml(r.team ?? "")}</td>
          <td class="gap">${r.gap}</td>
          <td class="laps">${r.laps}</td>
          <td class="pits">${r.pits}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="info-box">
      ${
        bestLap
          ? `<div class="info-row"><span class="small">⚡ Fastest Lap:</span> <span>${escapeHtml(
              bestLap.playerName,
            )} - ${bestLap.lapTime.toFixed(3)}s (Lap ${bestLap.lapNumber})</span></div>`
          : ""
      }
      ${
        bestPit
          ? `<div class="info-row"><span class="small">🔧 Fastest Pit:</span> <span>${escapeHtml(
              bestPit.playerName,
            )} - ${bestPit.pitTime.toFixed(3)}s (Stop ${bestPit.pitNumber})</span></div>`
          : ""
      }
    </div>
  </div>

  <script>
    (function() {
      try {
        const evt = new EventSource('/events');
        evt.onmessage = function(e) { if (e.data === 'update') location.reload(); };
      } catch (err) { /* ignore */ }
    })();
  </script>
</body>
</html>
`;

  return html;
}

/**
 * Save standings HTML to a file. Default: project root standings.html
 */
export function saveStandingsHtml(destFile?: string): string {
  const out = destFile
    ? path.resolve(destFile)
    : path.resolve(__dirname, "..", "..", "..", "standings.html");

  const html = generateStandingsHtml();

  try {
    fs.writeFileSync(out, html, { encoding: "utf8" });
    console.log(`Standings saved to: ${out}`);
    return out;
  } catch (err) {
    console.error("Failed to save standings HTML:", err);
    throw err;
  }
}

/**
 * Escape HTML special characters to prevent injection.
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>\"']/g, (m) => map[m]);
}

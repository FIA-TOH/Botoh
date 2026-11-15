const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

test("a new race clears all old lap-history slots, including laps beyond the fixed default", () => {
  const lapPositions = Array.from({ length: 30 }, (_, i) => [{ id: 99, currentLap: i + 2 }]);
  const finishList = [{ name: "Old winner" }], positionList = [{ id: 99 }];
  const playerList = { 1: {} };
  let recordings = 0;
  const noop = new Proxy({}, { get: () => () => {} });
  const dependencies = {
    "fs": { existsSync: () => false },
    "path": path,
    "../zones/laps": { laps: 3 },
    "../zones/laps/handleLapChange": { lapPositions, finishList },
    "../commands/gameMode/race/positionList": { positionList },
    "../changePlayerState/playerList": { playerList },
    "../hostLeague/leagueMode": { LEAGUE_MODE: true },
    "../changeGameState/changeGameModes": { gameMode: "race", GameMode: { TRAINING: "training", BATTLE_ROYALE: "battle_royale" } },
    "../changeGameState/teams": { Teams: { RUNNERS: 1 } },
    "./stadiumChange": { ACTUAL_CIRCUIT: null },
  };
  const filename = path.resolve(__dirname, "../src/features/roomFeatures/gameStart.ts");
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, __dirname: path.dirname(filename), console,
    require: (name) => dependencies[name] ?? noop });
  const room = { getPlayerList: () => [{ id: 1, name: "Driver", team: 1 }], startRecording: () => recordings++ };
  exports.GameStart(room);
  for (let run = 0; run < 2; run++) {
    room.onGameStart(null);
    assert.equal(lapPositions.length, 3);
    assert.ok(lapPositions.every((lap) => lap.length === 0));
    assert.equal(finishList.length, 0);
    assert.equal(positionList.length, 0);
    lapPositions[24] = [{ id: 1, currentLap: 26 }];
  }
  assert.equal(recordings, 2);
});

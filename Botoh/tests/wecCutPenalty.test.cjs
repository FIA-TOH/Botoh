const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

function setup(wecEnabled) {
  const root = path.resolve(__dirname, "../src"), cache = new Map();
  const data = { currentLap: 1, currentSector: 1, kers: 100, lastLapValid: true };
  const messages = [], cuts = [];
  const room = { getScores: () => ({ time: 60 }) };
  const pad = { p: { id: 1, name: "Driver" }, disc: { x: 5, y: 0, radius: 1, xspeed: 3, yspeed: 0 } };
  const circuit = { map: "{}", info: { name: "Test", CutDetectSegments: [{ index: 1, penalty: 5, v0: [0, 0], v1: [10, 0] }] } };
  const stubs = {
    "features/changeGameState/wecMode.ts": { isWECModeEnabled: () => wecEnabled },
    "features/changeGameState/changeGameModes.ts": { generalGameMode: "race", GeneralGameMode: { GENERAL_RACE: "race" } },
    "features/changePlayerState/playerList.ts": { playerList: { 1: data } },
    "features/chat/chat.ts": { COLORS: {}, sendAlertMessage: (_, message) => messages.push(message) },
    "features/chat/messages.ts": { MESSAGES: new Proxy({}, { get: (_, key) => (...args) => ({ key, args }) }) },
    "features/discord/logger.ts": { log() {} },
    "features/hostLeague/leagueMode.ts": { LEAGUE_MODE: false },
    "features/roomFeatures/stadiumChange.ts": { ACTUAL_CIRCUIT: circuit },
    "features/utils.ts": { getTimestamp: () => "now", formatRaceTime: String },
    "features/detectCut/cutsOfTracksStorage.ts": { addCutTrackToStorage: (cut) => cuts.push(cut) },
    "features/speed/grip/multiplierConditions.ts": { calculateGripMultiplierForConditions: () => 1 },
    "features/speed/crashWallDetector.ts": { isCrashWallSlowdownActive: () => false },
  };
  function load(relative) {
    if (stubs[relative]) return stubs[relative];
    if (cache.has(relative)) return cache.get(relative);
    const filename = path.join(root, relative), exports = {};
    cache.set(relative, exports);
    const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(code, { exports, require: (name) => load(path.relative(root, path.resolve(path.dirname(filename), name)).split(path.sep).join("/") + ".ts") });
    return exports;
  }
  const detector = load("features/detectCut/detectCut.ts");
  detector.loadCutSegmentsFromCircuit(circuit);
  const penalty = load("features/detectCut/applyCutPenalty.ts");
  const grip = load("features/speed/grip/calculateTotalGripMultiplier.ts");
  return { data, messages, cuts, load,
    detect: () => detector.detectCut(pad, room),
    apply: () => penalty.applyCutPenalty(pad, 5, room),
    grip: () => grip.calculateTotalGripMultiplier(pad.p, pad.disc, data, 0, 60, room),
  };
}

test("WEC detects, logs and invalidates cuts without speed loss even if the zero-speed flag is off", () => {
  const app = setup(true);
  app.load("features/detectCut/enableCutPenalty.ts").setZeroRaceCutSpeedPenaltyEnabled(false);
  app.detect();
  assert.equal(app.messages[0].args[0], 0);
  assert.equal(app.cuts.length, 1);
  assert.equal(app.data.lastLapValid, false);
  assert.equal(app.data.cuttedTrackOnThisLap, true);
  assert.equal(app.data.cutPenaltyEndTime, undefined);
  assert.equal(app.data.cutPenaltyMultiplier, 1);
  assert.equal(app.grip(), 1);
});

test("direct penalty application and a pending older penalty cannot slow a WEC driver", () => {
  const app = setup(true);
  app.apply();
  assert.equal(app.data.cutPenaltyMultiplier, 1);
  app.data.cutPenaltyMultiplier = 0.97;
  app.data.cutPenaltyEndTime = 999;
  assert.equal(app.grip(), 1);
});

test("other race modes retain normal cut speed penalties", () => {
  const app = setup(false);
  app.detect();
  assert.equal(app.messages[0].args[0], 5);
  assert.equal(app.data.cutPenaltyEndTime, 65);
  assert.equal(app.data.cutPenaltyMultiplier, 0.97);
  assert.equal(app.grip(), 0.97);
});

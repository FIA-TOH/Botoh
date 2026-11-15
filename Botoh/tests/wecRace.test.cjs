const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

function setup() {
  const root = path.resolve(__dirname, "../src");
  const cache = new Map();
  const messages = [];
  const finishes = [];
  const history = [];
  const drivers = [1, 2, 3].map((id) => ({ id, name: `Driver ${id}`, team: 1 }));
  const players = Object.fromEntries(drivers.map((p) => [p.id, { currentLap: 1, lastLapValid: true }]));
  let time = 0;
  let wec = true;
  let stopped = 0;
  const modes = { gameMode: "race", GameMode: { RACE: "race", TRAINING: "training", HARD_QUALY: "hard_qualy" }, generalGameMode: "general_race", GeneralGameMode: { GENERAL_RACE: "general_race", GENERAL_QUALY: "general_qualy" } };
  const chat = {
    sendAlertMessage: (_, message) => messages.push(message),
    sendSuccessMessage: (_, message) => messages.push(message),
    sendBlueMessage: (_, message) => messages.push(message),
  };
  const stubs = {
    "features/changeGameState/changeGameModes.ts": modes,
    "features/changeGameState/wecMode.ts": { isWECModeEnabled: () => wec },
    "features/changeGameState/teams.ts": { Teams: { RUNNERS: 1, SPECTATORS: 0 } },
    "features/changePlayerState/playerList.ts": { playerList: players },
    "features/chat/chat.ts": chat,
    "features/chat/messages.ts": { MESSAGES: new Proxy({}, { get: (_, key) => (...args) => ({ key, args }) }) },
    "features/commands/gameMode/qualy/hardQualyFunctions.ts": { handleHardQualyEnd: () => false },
    "features/commands/gameMode/qualy/qualiMode.ts": { qualiTime: 5, raceTime: 40 },
    "features/commands/gameMode/qualy/showPositionQualy.ts": {},
    "features/zones/laps.ts": { laps: 3, setCurrentSessionLap() {} },
    "features/zones/laps/handleLapChange.ts": { lapPositions: history },
    "features/zones/laps/handleRaceFinish.ts": { handleRaceFinish: (p, _, lapTime, isWinner) => {
      finishes.push({ id: p.id, isWinner }); p.team = 0;
    } },
    "features/zones/laps/utils/annoucements/notifyCurrentLapAndPitInfo.ts": { notifyCurrentLapAndPitInfo() {} },
    "features/zones/laps/utils/annoucements/notifyPositionsOrLeader.ts": { notifyPositionOrLeaders() {} },
    "features/commands/flagsAndVSC/handleSCCommand.ts": { isPlayerLapped: () => false, isSCActive: () => false },
    "features/hostLeague/leagueMode.ts": { LEAGUE_MODE: false },
    "features/utils.ts": { getRunningPlayers: (pads) => pads.filter(({ p, disc }) => p.team === 1 && disc) },
    "features/changeGameState/gameStopeedNaturally.ts": { changeGameStoppedNaturally() {} },
  };
  function load(relative) {
    if (stubs[relative]) return stubs[relative];
    if (cache.has(relative)) return cache.get(relative);
    const filename = path.join(root, relative);
    const exports = {};
    cache.set(relative, exports);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(source, { exports, require: (request) => {
      const target = path.relative(root, path.resolve(path.dirname(filename), request)).split(path.sep).join("/") + ".ts";
      return load(target);
    } });
    return exports;
  }
  const pads = () => drivers.map((p) => ({ p, disc: p.team === 1 ? {} : null }));
  const room = { getScores: () => ({ time }), stopGame: () => stopped++ };
  const race = load("features/changeGameState/wecRace.ts");
  const clock = load("features/changeGameState/wecRaceAnnouncements.ts");
  const processing = load("features/zones/laps/processLapAndCheckSessionEnd.ts");
  const ending = load("features/changeGameState/EndRaceSession.ts");
  return {
    race, messages, finishes, history, players, drivers, room,
    get stopped() { return stopped; },
    setWec(value) { wec = value; },
    tick(value) { time = value; clock.updateWECRaceClock(room); },
    endTick() { ending.endRaceSession(pads(), room); },
    cross(id, lap, value) {
      time = value; players[id].currentLap = lap;
      const list = pads();
      processing.processLapAndCheckSessionEnd(list.find(({ p }) => p.id === id), room, 2405, list);
    },
  };
}

test("WEC exceeds the fixed three laps, announces 2400 seconds once, then gives the leader one complete lap", () => {
  const app = setup();
  app.cross(1, 4, 40);
  assert.equal(app.finishes.length, 0);
  app.tick(2399.99);
  assert.equal(app.messages.length, 0);
  app.tick(2400);
  app.tick(2400.5);
  assert.equal(app.messages.filter((m) => m.key === "WEC_24_HOURS_COMPLETED").length, 1);
  app.cross(2, 3, 2401); // A lapped GT cannot start the overall leader's final lap.
  assert.equal(app.race.getWECRaceState().finalLapStarted, false);
  app.cross(1, 5, 2420);
  assert.equal(app.finishes.length, 0);
  assert.equal(app.messages.filter((m) => m.key === "WEC_FINAL_LAP").length, 1);
  assert.equal(app.messages.at(-1).args[0], "Driver 1");
  app.cross(2, 4, 2450);
  assert.equal(app.finishes.length, 0);
  app.cross(1, 6, 2525);
  assert.deepEqual(app.finishes, [{ id: 1, isWinner: true }]);
  app.cross(2, 5, 2570);
  app.cross(3, 2, 2610);
  assert.deepEqual(app.finishes, [{ id: 1, isWinner: true }, { id: 2, isWinner: false }, { id: 3, isWinner: false }]);
});

test("same-lap follower cannot start or finish the final lap ahead of the actual leader", () => {
  const app = setup();
  app.players[1].currentLap = 20;
  app.cross(2, 20, 2400);
  assert.equal(app.race.getWECRaceState().finalLapStarted, false);
  app.cross(1, 21, 2410);
  app.cross(2, 21, 2415);
  assert.equal(app.finishes.length, 0);
  app.cross(1, 22, 2515);
  assert.equal(app.finishes[0].id, 1);
  assert.ok(app.history[20].length > 0); // Lap storage grows beyond the original three slots.
});

test("the replacement leader can finish if the leader retires during the final lap", () => {
  const app = setup();
  app.cross(1, 20, 2400);
  app.drivers[0].team = 0;
  app.cross(2, 18, 2450);
  assert.deepEqual(app.finishes, [{ id: 2, isWinner: true }]);
});

test("time expiration at a crossing starts one extra lap and cannot finish on that same crossing", () => {
  const app = setup();
  app.cross(1, 20, 2400);
  assert.equal(app.race.getWECRaceState().finalLapStarted, true);
  assert.equal(app.race.getWECRaceState().checkered, false);
  app.cross(1, 21, 2505);
  const duplicate = app.race.crossWECFinishLine(1, true);
  assert.equal(duplicate.finish, false);
  assert.equal(app.finishes.length, 1);
});

test("public WEC is not stopped by the old time cutoff; normal races still are", () => {
  const app = setup();
  app.tick(2500);
  app.endTick();
  assert.equal(app.stopped, 0);
  app.setWec(false);
  app.endTick();
  assert.equal(app.stopped, 1);
});

test("normal three-lap race finish remains unchanged", () => {
  const app = setup();
  app.setWec(false);
  app.cross(1, 4, 40);
  assert.deepEqual(app.finishes, [{ id: 1, isWinner: true }]);
  assert.equal(app.messages.length, 0);
});

test("continuous elapsed time and final-lap state persist until a real session reset", () => {
  const app = setup();
  // Samples come from the continuous room.getScores wrapper across repeated
  // stadium restarts, not the native clock that returns to zero each swap.
  for (let time = 0; time <= 2400; time += 10) app.tick(time);
  app.cross(1, 20, 2405);
  app.tick(2415);
  assert.equal(app.race.getWECRaceState().elapsed, 2415);
  assert.equal(app.race.getWECRaceState().finalLapStarted, true);
  assert.equal(app.messages.filter((m) => m.key === "WEC_24_HOURS_COMPLETED").length, 1);
  app.race.resetWECRace();
  assert.equal(app.race.getWECRaceState().elapsed, 0);
  assert.equal(app.race.getWECRaceState().finalLapStarted, false);
  assert.equal(app.race.getWECRaceState().timeExpired, false);
});

test("remaining time shows whole minutes/seconds, survives clock samples and never goes negative", () => {
  const { race } = setup();
  assert.equal(race.WEC_RACE_DURATION_SECONDS, 2400);
  let remaining = race.getWECRemainingTime(0);
  assert.equal(remaining.minutes, 40);
  assert.equal(remaining.seconds, 0);
  remaining = race.getWECRemainingTime(30);
  assert.equal(remaining.minutes, 39);
  assert.equal(remaining.seconds, 30);
  race.updateWECRaceTime(2390);
  assert.equal(race.getWECRemainingTime(0).seconds, 10);
  remaining = race.getWECRemainingTime(2400);
  assert.equal(remaining.minutes, 0);
  assert.equal(remaining.seconds, 0);
  assert.equal(race.getWECRemainingTime(2450).seconds, 0);
});

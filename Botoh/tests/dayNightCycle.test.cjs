const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

function compile(file, context) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, "../src/features/changeGameState", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(source, { exports, ...context });
  return exports;
}
const flush = () => new Promise(setImmediate);

function setup(options = {}) {
  let rawScores = { red: 0, blue: 0, time: 600, timeLimit: 2400, scoreLimit: 0 };
  let wec = true;
  let supported = true;
  let loaded = options.initialPhase ?? "day";
  let hooks = 0;
  let physics;
  let playerRestores = 0;
  let sceneryRestores = 0;
  const errors = [];
  const flags = { flag: "yellow", neutralization: "vsc" };
  const history = [{ lap: 4, time: 130 }];
  const initialDisc = { x: 100, y: 200, xspeed: 3, yspeed: -4, xgravity: 0.001, ygravity: -0.002, damping: 0.99, radius: 14.25, cGroup: 2, cMask: 63, invMass: 0.5, bCoeff: 0.5, color: 123 };
  const players = {
    1: { category: "gt", currentLap: 5, currentSector: 2, lapTime: 61, sectorTimeCounter: 10, wear: 35, kers: 65, lastLapTimeUpdate: performance.now(), inPitStop: false,
      newPitState: { isWaitingForPit: true, pitEmojiShowTime: 599.8, reactionTimeout: 602.8, selectedTires: "MEDIUM" },
      repairState: { isRepairing: true, repairEndTime: 605 }, pits: { pitsNumber: 1, pit: [{ lap: 2 }] } },
  };
  const player = { id: 1, name: "Driver", team: 1, admin: false, position: { x: 100, y: 200 } };
  let roster = [player];
  const map = (phase) => JSON.stringify({ name: phase, bg: { color: phase }, vertexes: [], segments: [], discs: [], playerPhysics: { acceleration: 0.1 } });
  const variants = { day: map("day"), night: map("night"), initial: options.initialPhase ?? "day" };
  const timerState = { paused: false };
  const api = compile("dayNightCycle.ts", {
    performance, queueMicrotask, globalThis,
    require: (name) => {
      assert.equal(name, "./raceTimers");
      return { raceTimers: { pause() { timerState.paused = true; }, resume() { timerState.paused = false; } } };
    },
  });
  const room = {
    getScores: () => rawScores,
    getPlayerList: () => structuredClone(roster),
    getPlayerDiscProperties: () => physics && { ...physics },
    getDiscCount: () => physics ? 1 : 0,
    getDiscProperties: () => physics && { ...physics },
    setPlayerDiscProperties: (_, props) => {
      playerRestores++;
      queueMicrotask(() => {
        physics = { ...physics, ...props };
        if (options.advanceAfterRestore) physics.x += physics.xspeed / 60;
      });
    },
    setDiscProperties: (_, props) => {
      sceneryRestores++;
      queueMicrotask(() => { physics = { ...physics, ...props }; });
    },
    setPlayerAvatar: (_, value) => { room.avatar = value; },
    stopGame: () => queueMicrotask(() => { rawScores = null; physics = null; room.onGameStop(null); }),
    setCustomStadium: (raw) => {
      const name = JSON.parse(raw).name;
      if (options.failNight && name === "night") throw Error("Simulated map failure");
      queueMicrotask(() => { loaded = name; room.onStadiumChange(name, null); });
    },
    startGame: () => queueMicrotask(() => {
      rawScores = { red: 0, blue: 0, time: 0, timeLimit: 2400, scoreLimit: 0 };
      physics = { ...initialDisc, x: -500, y: -600, xspeed: 0, yspeed: 0, color: 999 };
      room.onGameStart(null);
    }),
    onGameStop: () => { hooks++; players[1].currentLap = 0; flags.flag = "green"; history.length = 0; options.onNormalLifecycle?.(); },
    onGameStart: () => { hooks++; players[1].wear = 0; options.onNormalLifecycle?.(); },
    onStadiumChange: () => { hooks++; },
    onGameTick: () => { hooks++; },
    onPlayerChat: () => { hooks++; },
    onPlayerLeave: () => { hooks++; players[1].isInTheRoom = false; },
  };
  physics = { ...initialDisc };
  const controller = api.installDayNightCycle(room, {
    enabled: () => wec, circuit: () => ({ info: { hasDayNightCycle: supported } }),
    variants: () => options.missing ? null : variants, players, intervalMinutes: options.intervalMinutes ?? 10, error: (error) => errors.push(error),
  });
  room.setPlayerAvatar(1, "⚡");
  return { api, room, players, flags, history, initialDisc, errors, timerState, controller, variants,
    get loaded() { return loaded; }, get hooks() { return hooks; }, get physics() { return physics; },
    get playerRestores() { return playerRestores; }, get sceneryRestores() { return sceneryRestores; },
    setTime(time) { rawScores.time = time; }, setWec(value) { wec = value; }, setSupported(value) { supported = value; },
    leave() { roster = []; room.onPlayerLeave(player); },
    adminStop() { rawScores = null; physics = null; room.onGameStop({ id: 2 }); },
  };
}

test("10-minute swap preserves player/race objects, all physics, pit reaction and repair deadlines", async () => {
  const app = setup();
  const playerReference = app.players[1];
  const saved = structuredClone(playerReference);
  const lapClock = saved.lastLapTimeUpdate;
  app.room.onGameTick();
  assert.equal(app.controller.isTransitioning(), true);
  assert.equal(app.timerState.paused, true);
  app.room.onPlayerChat({ id: 1 }, "!command");
  await flush();
  assert.equal(app.loaded, "night");
  assert.equal(app.controller.isTransitioning(), false);
  assert.equal(app.timerState.paused, false);
  assert.equal(app.players[1], playerReference);
  assert.ok(app.players[1].lastLapTimeUpdate >= lapClock);
  saved.lastLapTimeUpdate = app.players[1].lastLapTimeUpdate;
  assert.deepEqual(app.players[1], saved);
  assert.deepEqual(app.physics, app.initialDisc);
  assert.deepEqual(app.flags, { flag: "yellow", neutralization: "vsc" });
  assert.equal(app.history.length, 1);
  assert.equal(app.room.avatar, "⚡");
  assert.equal(app.room.getScores().time, 600);
  assert.equal(app.hooks, 1); // Only the deferred chat, no reset/start/stadium hooks.
  app.setTime(0.25);
  assert.equal(app.room.getScores().time, 600.25);
  app.setTime(600);
  app.room.onGameTick();
  await flush();
  assert.equal(app.loaded, "day");
  assert.equal(app.room.getScores().time, 1200);
  assert.equal(app.players[1].newPitState.pitEmojiShowTime, 599.8);
});

test("mid tyre-change countdown and progress survive the swap", async () => {
  const app = setup();
  Object.assign(app.players[1], { inPitStop: true, pitCountdown: 3.25, pitInitialPos: { x: 100, y: 200 }, pitTargetTires: "MEDIUM", pitSteps: [{ kind: "success", threshold: 0 }] });
  const saved = structuredClone(app.players[1].pitSteps);
  app.room.onGameTick();
  await flush();
  assert.equal(app.players[1].inPitStop, true);
  assert.equal(app.players[1].pitCountdown, 3.25);
  assert.deepEqual(app.players[1].pitSteps, saved);
  assert.equal(app.players[1].pitTargetTires, "MEDIUM");
});

test("no swap outside WEC, before 10 minutes, or on unmarked circuits", () => {
  for (const scenario of ["wec-off", "unsupported", "early"]) {
    const app = setup();
    if (scenario === "wec-off") app.setWec(false);
    if (scenario === "unsupported") app.setSupported(false);
    if (scenario === "early") app.setTime(599.99);
    app.room.onGameTick();
    assert.equal(app.controller.isTransitioning(), false);
    assert.equal(app.hooks, 1);
  }
});

test("missing or physically incompatible maps never interrupt the race", () => {
  for (const missing of [true, false]) {
    const app = setup({ missing });
    if (!missing) app.variants.night = JSON.stringify({ name: "night", vertexes: [{ x: 999, y: 0 }] });
    app.room.onGameTick();
    assert.equal(app.controller.isTransitioning(), false);
    assert.equal(app.loaded, "day");
    assert.equal(app.errors.length, 1);
    assert.equal(app.room.getScores().time, 600);
  }
});

test("load failure rolls back to the original map without resetting the session", async () => {
  const app = setup({ failNight: true });
  app.room.onGameTick();
  await flush();
  assert.equal(app.loaded, "day");
  assert.equal(app.controller.isTransitioning(), false);
  assert.equal(app.players[1].currentLap, 5);
  assert.equal(app.room.getScores().time, 600);
  assert.deepEqual(app.physics, app.initialDisc);
  assert.equal(app.errors.length, 1);
  app.setTime(1200);
  app.room.onGameTick();
  assert.equal(app.controller.isTransitioning(), false);
});

test("real day/night Le Mans maps have identical physics and follow the naming convention", () => {
  const app = setup();
  const dir = path.resolve(__dirname, "../src/circuits/le_mans");
  const day = fs.readFileSync(path.join(dir, "lemansday.hbs"), "utf8");
  const night = fs.readFileSync(path.join(dir, "lemansnight.hbs"), "utf8");
  assert.equal(app.api.physicalMapSignature(day), app.api.physicalMapSignature(night));
  const pair = app.api.findDayNightVariants([{ map: day }, { map: night }], ["lemansday.hbs", "lemansnight.hbs"], 1);
  assert.equal(pair.initial, "night");
  assert.equal(pair.day, day);
  assert.equal(pair.night, night);
});

test("real pit reaction handler keeps the correct reaction time after restart", async () => {
  const app = setup();
  app.players[1].newPitState.isPitNewEnabled = true;
  app.room.onGameTick();
  await flush();
  app.setTime(0.05);
  const pit = compile("../tires&pits/newPitSystem/newPitManager.ts", {
    require: (name) => {
      if (name === "../../changePlayerState/playerList") return { playerList: app.players };
      if (name === "../../utils/dampingValues") return { isXKeyPressed: () => true };
      if (name === "../pitStopFunctions") return { generatePitResultFromReaction: () => ({ totalTime: 3 }) };
      if (name === "../../changePlayerState/handleAvatar") return { handleAvatar() {}, Situacions: {} };
      if (name === "../../chat/chat" || name === "../../chat/messages") return {};
      throw Error(name);
    },
  });
  const result = pit.handlePitKeyPress(1, app.physics, app.room);
  assert.equal(result.shouldStart, true);
  assert.equal(result.selectedTires, "MEDIUM");
  assert.ok(Math.abs(app.players[1].newPitState.reactionTime - 0.25) < 1e-9);
});

test("real repair handler finishes at the original deadline without movement cancellation", async () => {
  const app = setup();
  app.players[1].repairState.repairInitialPos = { x: 100, y: 200 };
  app.players[1].repairState.repairStartTime = 599;
  app.players[1].carDamage = 50;
  app.room.onGameTick();
  await flush();
  const repair = compile("../damage/repairSystem.ts", {
    require: (name) => {
      if (name === "../changePlayerState/playerList") return { playerList: app.players };
      if (name === "../changePlayerState/handleAvatar") return { handleAvatar() {}, restoreTyreOrCar() {}, Situacions: {} };
      if (name === "../chat/chat") return { sendSuccessMessage() {} };
      if (name === "../chat/messages") return { MESSAGES: { REPAIR_FINISHED: () => ({}) } };
      // The imports below are unused in the in-progress repair branch.
      return {};
    },
  });
  app.setTime(4.99);
  repair.updateRepairSystemForPlayer({ id: 1 }, app.physics, app.room, app.room.getScores().time);
  assert.equal(app.players[1].repairState.isRepairing, true);
  app.setTime(5);
  repair.updateRepairSystemForPlayer({ id: 1 }, app.physics, app.room, app.room.getScores().time);
  assert.equal(app.players[1].repairState.isRepairing, false);
  assert.equal(app.players[1].carDamage, 0);
});

test("a departure during the swap is processed after restoration and never resurrected", async () => {
  const app = setup();
  app.room.onGameTick();
  app.leave();
  await flush();
  assert.equal(app.controller.isTransitioning(), false);
  assert.equal(app.room.getPlayerList().length, 0);
  assert.equal(app.players[1].isInTheRoom, false);
  assert.equal(app.hooks, 1);
});

test("normal admin stop runs normal cleanup after an earlier lighting swap", async () => {
  const app = setup();
  app.room.onGameTick();
  await flush();
  app.adminStop();
  assert.equal(app.room.getScores(), null);
  assert.equal(app.players[1].currentLap, 0);
  assert.equal(app.flags.flag, "green");
  assert.equal(app.history.length, 0);
});

test("restores once at game start before the first new-game tick, without waiting for exact physics", async () => {
  const app = setup({ advanceAfterRestore: true });
  app.room.onGameTick();
  await flush();
  assert.equal(app.loaded, "night");
  assert.equal(app.controller.isTransitioning(), false);
  assert.equal(app.playerRestores, 1);
  assert.equal(app.sceneryRestores, 1);
  assert.ok(app.physics.x > app.initialDisc.x);
  app.room.onGameTick();
  app.room.onGameTick();
  assert.equal(app.playerRestores, 1);
  assert.equal(app.sceneryRestores, 1);
  await flush();
  assert.equal(app.controller.isTransitioning(), false);
  assert.equal(app.timerState.paused, false);
  assert.ok(app.physics.x > app.initialDisc.x);
  assert.equal(app.room.getScores().time, 600);
  for (let tick = 0; tick < 120; tick++) app.room.onGameTick();
  assert.equal(app.playerRestores, 1);
  assert.equal(app.sceneryRestores, 1);
  assert.equal(app.errors.length, 0);
});

test("WEC 2400-second threshold and final-lap state survive native clock resets from lighting swaps", async () => {
  const race = compile("wecRace.ts", {});
  const app = setup({ onNormalLifecycle: race.resetWECRace, intervalMinutes: 10 / 60 });
  app.setTime(2390);
  race.updateWECRaceTime(app.room.getScores().time);
  app.room.onGameTick();
  await flush();
  assert.equal(app.room.getScores().time, 2390);
  assert.equal(race.getWECRaceState().elapsed, 2390);
  app.setTime(10);
  assert.equal(race.updateWECRaceTime(app.room.getScores().time), true);
  race.crossWECFinishLine(1, true);
  app.setTime(600);
  app.room.onGameTick();
  await flush();
  assert.equal(app.room.getScores().time, 2990);
  assert.equal(race.getWECRaceState().timeExpired, true);
  assert.equal(race.getWECRaceState().finalLapStarted, true);
  assert.equal(race.crossWECFinishLine(1, true).isWinner, true);
});

for (const initialPhase of ["day", "night"]) {
  test(`100-second test cycle works starting from ${initialPhase}`, async () => {
    const app = setup({ initialPhase, intervalMinutes: 1.66666666 });
    app.setTime(99);
    app.room.onGameTick();
    assert.equal(app.controller.isTransitioning(), false);
    app.setTime(100);
    app.room.onGameTick();
    await flush();
    assert.equal(app.loaded, initialPhase === "day" ? "night" : "day");
    app.setTime(100);
    app.room.onGameTick();
    await flush();
    assert.equal(app.loaded, initialPhase);
    assert.equal(app.room.getScores().time, 200);
    assert.equal(app.errors.length, 0);
  });
}

test("Le Mans and Daytona disable automatic cycles and keep both variants selectable", () => {
  const api = setup().api;
  const enums = compile("../../circuits/Circuit.ts", {});
  for (const [folder, base, prefix] of [["le_mans", "lemans", "LEMANS"], ["daytona", "daytohnawec", "DAYTOHNAWEC"]]) {
    const dir = path.resolve(__dirname, "../src/circuits", folder);
    const pair = ["day", "night"].map((phase) => {
      const definition = compile(`../../circuits/${folder}/${base}${phase}.ts`, {
        __dirname: dir,
        require: (name) => {
          if (name === "fs") return fs;
          if (name === "path") return path;
          if (name === "../Circuit") return enums;
          if (name === "../bestTimes") return { bestTimes: {} };
          if (name === "./daytonaBanking") return compile("../../circuits/daytona/daytonaBanking.ts", {});
          throw Error(name);
        },
      })[prefix + phase.toUpperCase()];
      assert.equal(definition.info.hasDayNightCycle, false, `${base}${phase}`);
      return definition;
    });
    const names = [`${base}day.hbs`, `${base}night.hbs`];
    assert.equal(api.findDayNightVariants(pair, names, 0).initial, "day");
    assert.equal(api.findDayNightVariants(pair, names, 1).initial, "night");
  }
});

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

function setup() {
  const root = path.resolve(__dirname, "../src");
  const cache = new Map();
  const zone = { id: "test", baseArc: { v0: [10, 0], v1: [-10, 0], curve: 180 },
    detectors: [{ v0: [10, 0], v1: [30, 0] }, { v0: [-10, 0], v1: [-30, 0] }],
    maxDrag: 0.01, falloffDistance: 200 };
  const circuit = { info: { bankingZones: [zone] } };
  const player = { id: 1, admin: true, team: 1 };
  const data = { category: null, inPitStop: false, inPitlane: false };
  const disc = { x: 15, y: -2, xspeed: -6, yspeed: 0 };
  const raceControl = { flag: "green" };
  const vsc = { vsc: false };
  const messages = [], writes = [];
  const pads = () => [{ p: player, disc }];
  const room = { getScores: () => ({ time: 10 }),
    setPlayerDiscProperties: (id, properties) => writes.push(properties) };
  const stubs = {
    "features/roomFeatures/stadiumChange.ts": { ACTUAL_CIRCUIT: circuit },
    "features/changePlayerState/playerList.ts": { playerList: { 1: data } },
    "features/playerFeatures/getPlayerAndDiscs.ts": { getPlayerAndDiscs: pads },
    "features/utils.ts": { getRunningPlayers: (players) => players, vectorSpeed: Math.hypot },
    "features/safetyCar/vsc.ts": vsc,
    "features/commands/flagsAndVSC/handleSCCommand.ts": { isSCActive: () => false, isPlayerLapped: () => false },
    "features/commands/flagsAndVSC/raceControl.ts": { getRaceControlState: () => raceControl, RaceControlState: { YellowFlag: "yellow", RedFlag: "red" } },
    "features/speed/grip/calculateTotalGripMultiplier.ts": { calculateTotalGripMultiplier: () => 1 },
    "features/speed/pitAndVscRules.ts": { getPitAndVscGravity: () => ({ xgravity: 0, ygravity: 0 }) },
    "features/speed/slipstream/slipstreamUtils.ts": { calculateSlipstreamEffect: () => ({ effectiveSlipstream: 0 }) },
    "features/speed/directionChanger.ts": { getDirectionChangerGravity: () => ({ x: 0, y: 0 }) },
    "features/chat/chat.ts": { sendErrorMessage: (_, message) => messages.push(message), sendSuccessMessage: (_, message) => messages.push(message) },
    "features/chat/messages.ts": { MESSAGES: new Proxy({}, { get: (_, key) => (...args) => ({ key, args }) }) },
    "circuits/bestTimes.ts": { bestTimes: {} },
  };
  function load(relative) {
    if (stubs[relative]) return stubs[relative];
    if (cache.has(relative)) return cache.get(relative);
    const filename = path.join(root, relative), exports = {};
    cache.set(relative, exports);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(source, { exports, __dirname: path.dirname(filename), require: (name) => {
      if (name === "fs") return fs;
      if (name === "path") return path;
      return load(path.relative(root, path.resolve(path.dirname(filename), name)).split(path.sep).join("/") + ".ts");
    } });
    return exports;
  }
  const banking = load("features/speed/banking.ts");
  return { zone, circuit, player, data, disc, raceControl, vsc, messages, writes, banking, load, room,
    gravity: (zones = [zone], blocked = false, id = 1) => banking.getBankingGravity(zones, disc, blocked, id),
    sample(x, y, blocked = false, id = 1) {
      disc.x = x; disc.y = y;
      return banking.getBankingGravity([zone], disc, blocked, id);
    },
    enter(id = 1, blocked = false) {
      banking.resetBankingTracking(id);
      banking.getBankingGravity([zone], { ...disc, x: 15, y: -2 }, blocked, id);
      disc.x = 15; disc.y = 2;
      return banking.getBankingGravity([zone], disc, blocked, id);
    },
    tick: () => load("features/speed/distributrSpeed.ts").distributeSpeed(pads(), room),
    command: (...args) => load("features/commands/adminThings/handleBankingCommand.ts").handleBankingCommand(player, args, room),
    configure: (...args) => load("features/commands/adminThings/handleBankingCommand.ts").handleBankingSetCommand(player, args, room),
  };
}


function zero(g) { assert.equal(Math.hypot(g.x, g.y), 0); }

test("the nonlinear curve holds more punishment at the midpoint and reaches zero at the configured distance", () => {
  const app = setup();
  zero(app.sample(0, 10)); // No detector crossed, even though directly on the base.
  app.enter();
  const onBase = app.sample(0, 10);
  assert.ok(Math.abs(onBase.x - 0.06) < 1e-10); // 6 * 0.01, not clipped to the former 0.02 cap.
  const half = app.sample(0, 110);
  assert.ok(Math.abs(half.x - 0.03897114317) < 1e-9);
  zero(app.sample(0, 210));
  zero(app.sample(0, 310));
});

test("both finite detectors toggle entry/exit in either travel direction", () => {
  const app = setup();
  app.enter();
  assert.equal(app.banking.isPlayerInBanking(1, app.zone), true);
  app.sample(-15, 2);
  zero(app.sample(-15, -2));
  assert.equal(app.banking.isPlayerInBanking(1, app.zone), false);
  assert.ok(app.sample(-15, 2).x > 0); // Re-enter at the former exit.
  app.sample(15, 2);
  zero(app.sample(15, -2));
  assert.equal(app.banking.isPlayerInBanking(1, app.zone), false);
});

test("sampling or stopping on a gate does not repeatedly toggle, and exact line contact is handled", () => {
  const app = setup();
  app.sample(15, -2);
  zero(app.sample(15, 0));
  zero(app.sample(15, 0.1));
  app.sample(15, 2);
  for (let i = 0; i < 10; i++) app.sample(15, 2);
  assert.equal(app.banking.isPlayerInBanking(1, app.zone), true);
  app.sample(15, 0);
  app.sample(15, -2);
  assert.equal(app.banking.isPlayerInBanking(1, app.zone), false);
});

test("crossing the infinite extension beyond detector endpoints does not activate banking", () => {
  const app = setup();
  app.sample(35, -2);
  zero(app.sample(35, 2));
  assert.equal(app.banking.isPlayerInBanking(1, app.zone), false);
});

test("finite arc distance includes endpoints and gives the same answer with reversed signed curvature", () => {
  const app = setup();
  const distance = (p, arc = app.zone.baseArc) => app.banking.getBankingBaseDistance(p, arc);
  assert.ok(distance({ x: 0, y: 10 }) < 1e-10);
  assert.ok(Math.abs(distance({ x: 0, y: 110 }) - 100) < 1e-10);
  assert.ok(Math.abs(distance({ x: 0, y: -10 }) - Math.sqrt(200)) < 1e-10);
  const reversed = { v0: [-10, 0], v1: [10, 0], curve: -180 };
  assert.ok(Math.abs(distance({ x: 0, y: 60 }, reversed) - 50) < 1e-10);
  assert.equal(distance({ x: 0, y: 0 }, { v0: [-10, 0], v1: [10, 0], curve: 0 }), 0);
});

test("players are tracked independently; disabled banking, map changes and teleports clear state", () => {
  const app = setup();
  app.enter(1);
  assert.ok(app.sample(0, 10, false, 1).x > 0);
  zero(app.sample(0, 10, false, 2));
  zero(app.sample(1000, 1000, false, 1));
  zero(app.sample(0, 10, false, 1));
  app.enter(1);
  zero(app.gravity([], false, 1));
  zero(app.sample(0, 10, false, 1));
  app.enter(1);
  app.banking.setBankingEnabled(false);
  zero(app.gravity());
  app.banking.setBankingEnabled(true);
  zero(app.sample(0, 10));
  app.enter();
  app.banking.resetBankingTracking(1);
  zero(app.sample(0, 10));
});

test("blocked motion still tracks gates so ending VSC does not lose an entry", () => {
  const app = setup();
  zero(app.enter(1, true));
  assert.equal(app.banking.isPlayerInBanking(1, app.zone), true);
  assert.ok(app.sample(0, 10).x > 0);
  app.disc.xspeed = 0;
  zero(app.gravity());
});

test("speed integration applies exact resistance once per tick and suppresses it in pit, VSC and repair", () => {
  const app = setup();
  app.tick();
  app.disc.y = 2;
  app.tick();
  assert.equal(app.writes.length, 2);
  assert.ok(app.writes.at(-1).xgravity > 0);
  app.sample(0, 10);
  app.tick();
  assert.ok(Math.abs(app.writes.at(-1).xgravity - 0.06) < 1e-10);
  for (const activate of [
    () => { app.data.inPitlane = true; },
    () => { app.vsc.vsc = true; },
    () => { app.raceControl.flag = "red"; },
    () => { app.data.repairState = { isRepairing: true }; },
    () => { app.data.cutPenaltyEndTime = 11; },
  ]) {
    app.data.inPitlane = false; app.vsc.vsc = false; app.raceControl.flag = "green";
    app.data.repairState = undefined; app.data.cutPenaltyEndTime = undefined;
    activate(); app.tick();
    assert.equal(app.writes.at(-1).xgravity, 0);
  }
});

test("live admin tuning changes maximum drag and falloff, resets defaults and rejects invalid input", () => {
  const app = setup();
  app.enter(); app.sample(0, 10);
  app.configure("test", "maxDrag", "0,02");
  assert.equal(app.banking.getBankingSettings(app.zone).maxDrag, 0.02);
  assert.ok(Math.abs(app.writes.at(-1).xgravity - 0.12) < 1e-10);
  app.configure("test", "falloffDistance", "100");
  zero(app.sample(0, 110));
  app.configure("test", "reset");
  assert.equal(app.banking.getBankingSettings(app.zone).maxDrag, 0.01);
  assert.equal(app.banking.getBankingSettings(app.zone).falloffDistance, 200);
  for (const [key, value] of [["maxDrag", NaN], ["maxDrag", 0.06], ["falloffDistance", 0], ["falloffDistance", Infinity], ["exponent", 0], ["exponent", 9], ["exponent", NaN], ["__proto__", 1]]) {
    assert.equal(app.banking.configureBanking(app.zone, key, value), false);
  }
  app.player.admin = false;
  app.command("off"); app.configure("test", "maxDrag", "0.02");
  assert.equal(app.messages.at(-1).key, "ADMIN_ONLY");
  assert.equal(app.banking.isBankingEnabled(), true);
  assert.equal(app.banking.getBankingSettings(app.zone).maxDrag, 0.01);
});

test("Daytona uses the exact supplied vertices/detectors and shares tuning between day and night", () => {
  const app = setup();
  const day = app.load("circuits/daytona/daytohnawecday.ts");
  const night = app.load("circuits/daytona/daytohnawecnight.ts");
  const zone = day.DAYTOHNAWECDAY.info.bankingZones[0];
  assert.equal(zone, night.DAYTOHNAWECNIGHT.info.bankingZones[0]);
  for (const configured of day.DAYTOHNAWECDAY.info.bankingZones) {
    assert.equal(app.banking.getBankingSettings(configured).maxDrag, 0.001955);
    assert.equal(app.banking.getBankingSettings(configured).falloffDistance, 150);
    assert.equal(app.banking.getBankingSettings(configured).exponent, 2);
  }
  assert.equal(zone.baseArc.curve, 150);
  assert.equal(zone.baseArc.v0[0], -3341.8241155399764);
  assert.equal(zone.baseArc.v1[0], -2874.449378820837);
  assert.equal(zone.detectors[0].v1[0], -3455);
  assert.equal(zone.detectors[1].v1[1], -3283.2000000000003);
  const distance = app.banking.getBankingBaseDistance({ x: zone.baseArc.v1[0], y: zone.baseArc.v1[1] }, zone.baseArc);
  assert.ok(distance < 1e-8);
  const gate = zone.detectors[1];
  const x = (gate.v0[0] + gate.v1[0]) / 2, y = (gate.v0[1] + gate.v1[1]) / 2;
  const dx = gate.v1[0] - gate.v0[0], dy = gate.v1[1] - gate.v0[1], length = Math.hypot(dx, dy);
  app.banking.getBankingGravity([zone], { x: x - dy / length * 2, y: y + dx / length * 2, xspeed: -6, yspeed: 0 }, false, 1);
  const g = app.banking.getBankingGravity([zone], { x: x + dy / length * 2, y: y - dx / length * 2, xspeed: -6, yspeed: 0 }, false, 1);
  assert.equal(app.banking.isPlayerInBanking(1, zone), true);
  assert.ok(g.x > 0);
  assert.equal(app.banking.configureBanking(zone, "maxDrag", 0.02), true);
  assert.equal(app.banking.getBankingSettings(night.DAYTOHNAWECNIGHT.info.bankingZones[0]).maxDrag, 0.02);
});

test("default profile follows approximately 10, 9.6, 8.4, 6.5, 4.1, 1.7, 0 and remains monotonic", () => {
  const app = setup();
  delete app.zone.maxDrag; delete app.zone.falloffDistance;
  app.enter();
  const expected = [1, 0.959, 0.838, 0.650, 0.414, 0.169, 0];
  let previous = Infinity;
  for (let i = 0; i < expected.length; i++) {
    const g = app.sample(0, 10 + i * 25);
    const fraction = g.x / (6 * 0.001955);
    assert.ok(Math.abs(fraction - expected[i]) < 0.001);
    assert.ok(fraction <= previous);
    previous = fraction;
  }
  zero(app.sample(0, 185));
});

test("raising the exponent holds punishment farther out and reset returns to the default curve", () => {
  const app = setup();
  app.enter();
  const before = app.sample(0, 110).x;
  app.configure("test", "exponent", "3");
  assert.equal(app.banking.getBankingSettings(app.zone).exponent, 3);
  assert.ok(app.sample(0, 110).x > before);
  app.configure("test", "reset");
  assert.equal(app.banking.getBankingSettings(app.zone).exponent, 2);
  assert.ok(Math.abs(app.sample(0, 110).x - before) < 1e-10);
});

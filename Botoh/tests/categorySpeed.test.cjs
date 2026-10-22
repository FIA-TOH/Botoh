const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

function setup() {
  const data = { category: "gt", inPitStop: false };
  const p = { id: 1 };
  const disc = { xspeed: 3, yspeed: -4 };
  const direction = { x: 0.02, y: -0.01 };
  const base = { xgravity: -0.03, ygravity: 0.04 };
  let result;
  const room = { getScores: () => ({ time: 10 }), setPlayerDiscProperties: (_, props) => { result = props; } };
  const dependencies = {
    "../changePlayerState/playerList": { playerList: { 1: data } },
    "../playerFeatures/getPlayerAndDiscs": { getPlayerAndDiscs: () => [{ p, disc }] },
    "../safetyCar/vsc": { vsc: false },
    "../commands/flagsAndVSC/handleSCCommand": { isSCActive: () => false, isPlayerLapped: () => false },
    "../commands/flagsAndVSC/raceControl": { getRaceControlState: () => ({}), RaceControlState: { YellowFlag: "yellow" } },
    "../utils": { getRunningPlayers: (players) => players, vectorSpeed: Math.hypot },
    "./grip/calculateTotalGripMultiplier": { calculateTotalGripMultiplier: () => 1 },
    "./pitAndVscRules": { applyPitAndVscRules: () => base },
    "./slipstream/slipstreamUtils": { calculateSlipstreamEffect: () => ({ effectiveSlipstream: 0 }) },
    "./directionChanger": { getDirectionChangerGravity: () => direction },
  };
  function load(filename) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, "../src/features/speed", filename), "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    vm.runInNewContext(source, { exports, require: (request) => {
      if (request === "./categoryGravity") return load("categoryGravity.ts");
      assert.ok(dependencies[request], request);
      return dependencies[request];
    } });
    return exports;
  }
  const speed = load("handleSpeed.ts");
  return { data, disc, base, direction, tick: () => { speed.controlPlayerSpeed([{ p, disc }], room); return result; } };
}

test("GT adds proportional resistance against movement while preserving other gravity sources", () => {
  const app = setup();
  let gravity = app.tick();
  assert.ok(Math.abs(gravity.xgravity - (-0.03 + 0.02 - 0.003)) < 1e-12);
  assert.ok(Math.abs(gravity.ygravity - (0.04 - 0.01 + 0.004)) < 1e-12);
  app.disc.xspeed = -3;
  app.disc.yspeed = 4;
  gravity = app.tick();
  assert.ok(Math.abs(gravity.xgravity - (-0.03 + 0.02 + 0.003)) < 1e-12);
  assert.ok(Math.abs(gravity.ygravity - (0.04 - 0.01 - 0.004)) < 1e-12);
});

test("Hyper, cleared categories and stationary GT add no resistance", () => {
  const app = setup();
  for (const category of ["hyper", null]) {
    app.data.category = category;
    const gravity = app.tick();
    assert.equal(gravity.xgravity, app.base.xgravity + app.direction.x);
    assert.equal(gravity.ygravity, app.base.ygravity + app.direction.y);
  }
  app.data.category = "gt";
  app.disc.xspeed = 0;
  app.disc.yspeed = 0;
  const gravity = app.tick();
  assert.equal(gravity.xgravity, app.base.xgravity + app.direction.x);
  assert.equal(gravity.ygravity, app.base.ygravity + app.direction.y);
});

test("GT category never moves a player immobilized at the pit stop", () => {
  const app = setup();
  app.data.inPitStop = true;
  const props = app.tick();
  assert.equal(props.xspeed, 0);
  assert.equal(props.yspeed, 0);
  assert.equal(props.xgravity, 0);
  assert.equal(props.ygravity, 0);
});

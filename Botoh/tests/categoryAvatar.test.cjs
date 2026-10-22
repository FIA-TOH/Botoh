const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

function setup() {
  const player = { id: 1 };
  const data = { category: null, sandbagPenalty: 0, tires: "SOFT", showTires: true, pubAvatar: "🙂", kers: 80 };
  const tyres = { tyresActivated: true, Tires: { SOFT: "SOFT" } };
  const timers = new Map();
  let avatar;
  let nextTimer = 0;
  let scuderiaEnabled = false;
  const room = { setPlayerAvatar: (_, value) => { avatar = value; } };
  function load(relative, requireLocal) {
    const filename = path.resolve(__dirname, "../src", relative);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    const exports = {};
    vm.runInNewContext(source, {
      exports,
      require: requireLocal,
      setTimeout: (callback) => { const id = ++nextTimer; timers.set(id, callback); return id; },
      clearTimeout: (id) => timers.delete(id),
      clearInterval: (id) => timers.delete(id),
    });
    return exports;
  }
  const playerState = { playerList: { 1: data }, getEffectiveLeagueScuderiaId: () => "team" };
  const dependencies = {
    "../discord/logger": { log() {} },
    "../hostLeague/leagueMode": { LEAGUE_MODE: true },
    "../public/publicAuth": { getPublicRankAvatarByPlayerId: () => "🏅" },
    "../scuderias/scuderias": { getLeagueScuderia: () => ({ emoji: "⭐" }) },
    "../scuderias/scuderiaAvatar": { isScuderiaAvatarEnabled: () => scuderiaEnabled },
    "../tires&pits/tires": tyres,
    "./playerList": playerState,
  };
  const avatars = load("features/changePlayerState/handleAvatar.ts", (name) => {
    assert.ok(dependencies[name], name);
    return dependencies[name];
  });
  const categoryDependencies = {
    "../../../changePlayerState/playerList": playerState,
    "../../../changePlayerState/handleAvatar": avatars,
    "../../../chat/chat": { sendErrorMessage() {}, sendSuccessMessage() {} },
    "../../../chat/messages": { MESSAGES: new Proxy({}, { get: () => () => ({}) }) },
    "../../../changeGameState/wecMode": { isWECModeEnabled: () => true },
  };
  const command = load("features/commands/gameMode/wec/handleCategoryCommand.ts", (name) => {
    assert.ok(categoryDependencies[name], name);
    return categoryDependencies[name];
  });
  return {
    data, tyres, avatars,
    get avatar() { return avatar; },
    category: (value) => command.handleCategoryCommand(player, [value], room),
    show: (situation, arg) => avatars.handleAvatar(situation, player, room, arg),
    restore: () => avatars.restorePlayerPersistentAvatar(1, room),
    enableScuderia: () => { scuderiaEnabled = true; },
    expire: () => { const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); },
  };
}

test("category command immediately updates GT and Hyper avatars above sandbag", () => {
  const app = setup();
  app.data.sandbagPenalty = 5;
  app.enableScuderia();
  app.category("gt");
  assert.equal(app.avatar, "🚗");
  app.show(app.avatars.Situacions.Sandbag);
  assert.equal(app.avatar, "🚗");
  app.category("hyper");
  assert.equal(app.avatar, "🏎️");
  app.restore();
  assert.equal(app.avatar, "🏎️");
});

test("clearing category restores sandbag, tyres, default and team avatars", () => {
  const app = setup();
  app.category("gt");
  app.data.sandbagPenalty = 5;
  app.category("clear");
  assert.equal(app.avatar, "🐢");
  app.data.sandbagPenalty = 0;
  app.show(app.avatars.Situacions.Category);
  assert.equal(app.avatar, "🔴");
  app.tyres.tyresActivated = false;
  app.restore();
  assert.equal(app.avatar, "🙂");
  app.enableScuderia();
  app.restore();
  assert.equal(app.avatar, "⭐");
});

test("higher priority ERS survives category changes and restores the latest category", () => {
  const app = setup();
  app.category("gt");
  app.show(app.avatars.Situacions.Ers);
  assert.equal(app.avatar, "80");
  app.category("hyper");
  app.show(app.avatars.Situacions.Sandbag);
  assert.equal(app.avatar, "80");
  app.expire();
  assert.equal(app.avatar, "🏎️");
  app.show(app.avatars.Situacions.Ers);
  app.category("clear");
  assert.equal(app.avatar, "80");
  app.expire();
  assert.equal(app.avatar, "🔴");
});

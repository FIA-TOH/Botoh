const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

// Isolate room commands from external services while exercising the real
// configuration, race-mode transition, category handler and player reset.
function setup(leagueMode = true) {
  const root = path.resolve(__dirname, "../src");
  const cache = new Map();
  const state = {};
  const messages = [];
  const players = {};
  let scores = null;
  let gameState = "stopped";
  const admin = { id: 1, name: "Admin", admin: true };
  const driver = { id: 2, name: "Driver", admin: false };
  const setter = (key) => (value) => { state[key] = value; };
  const argumentSetter = (key) => (_, args) => { state[key] = args[0]; };
  const chat = {
    COLORS: {},
    sendErrorMessage: (_, message) => messages.push(message),
    sendSuccessMessage: (_, message) => messages.push(message),
  };
  const stubs = {
    "features/chat/chat.ts": chat,
    "features/chat/messages.ts": {
      getPlayerLanguage: () => "en",
      MESSAGES: new Proxy({}, { get: (_, key) => (...args) => ({ key, args }) }),
    },
    "features/chat/language.ts": { DEFAULT_LANGUAGE: "en" },
    "features/changeGameState/gameState.ts": { getGameState: () => gameState },
    "features/changePlayerState/playerList.ts": { playerList: players, idToAuth: {}, clearPreparedPitTire() {} },
    "features/changePlayerState/handleAvatar.ts": { handleAvatar() {}, Situacions: {} },
    "features/changePlayerState/rejoinManager.ts": { rejoinManager: {} },
    "features/changePlayerState/ghost.ts": { setGhostMode: (_, value) => { state.ghost = value; } },
    "features/discord/logger.ts": { log() {} },
    "features/hostLeague/leagueMode.ts": { LEAGUE_MODE: leagueMode },
    "features/zones/maps.ts": { CIRCUITS: [{ map: "test-map" }], currentMapIndex: 0 },
    "features/zones/laps.ts": { laps: 10, DEFAULT_LAPS: 10 },
    "features/commands/gameMode/qualy/qualiMode.ts": { qualiTime: 5, raceTime: 40 },
    "features/commands/adminThings/handleChangeLaps.ts": { changeLaps: setter("laps") },
    "features/commands/adminThings/handleRREnabledCommand.ts": { handleRREnabledCommand: argumentSetter("rr") },
    "features/commands/adminThings/handlePitCommand.ts": { handlePitCommand: argumentSetter("pit") },
    "features/commands/adminThings/handleManageTyresCommand.ts": { setManageTyresEnabled: setter("manageTyres") },
    "features/commands/gameState/handlePresentationLapCommand.ts": { handlePresentationLapCommand: argumentSetter("presentation") },
    "features/commands/flagsAndVSC/blueFlags.ts": { setBlueFlagsEnabled: setter("blueFlags") },
    "features/commands/scuderia/handleSetScuderia.ts": { setTeamCommandEnabled: setter("teamCommand"), clearManualTeamSelections() {} },
    "features/scuderias/scuderiaAvatar.ts": { setScuderiaAvatar: setter("scuderiaAvatar") },
    "features/scuderias/scuderiaDevelopment.ts": { setScuderiaDevelopmentEnabled: setter("development") },
    "features/teamBoxes/teamCircuitBoxes.ts": { setTeamCircuitBoxesEnabled: setter("teamBoxes") },
    "features/debris/enableDebris.ts": { enableDebris: setter("debris") },
    "features/speed/crashWallDetector.ts": { enableDamage: setter("damage"), enableCrashWallSlowdown: setter("crashSlowdown") },
    "features/speed/fuel&Ers/ers.ts": { enableErs: setter("ers"), enableErsPenalty: setter("ersPenalty") },
    "features/speed/handleSlipstream.ts": { enableGas: setter("gas"), enableSlipstream: setter("slipstream") },
    "features/tires&pits/tireBlowManager.ts": { setBlowoutTyresActivated: setter("blowouts") },
    "features/tires&pits/handleTireWear.ts": { setTyreWearEnabled: setter("wear") },
    "features/tires&pits/tires.ts": { enableTyres: setter("tyres"), setRaceTyresInQualyEnabled: setter("raceTyresInQualy"), Tires: { SOFT: "soft" }, TIRE_STARTING_SPEED: { soft: 1 } },
  };
  function load(relative) {
    if (stubs[relative]) return stubs[relative];
    if (cache.has(relative)) return cache.get(relative).exports;
    const filename = path.join(root, relative);
    const module = { exports: {} };
    cache.set(relative, module);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const requireLocal = (request) => {
      if (!request.startsWith(".")) throw Error(`Unexpected dependency: ${request}`);
      const resolved = path.resolve(path.dirname(filename), request) + ".ts";
      return load(path.relative(root, resolved).split(path.sep).join("/"));
    };
    vm.runInNewContext(source, { exports: module.exports, module, require: requireLocal }, { filename });
    return module.exports;
  }
  const room = {
    getScores: () => scores,
    getPlayerList: () => [admin, driver],
    sendAnnouncement() {},
    setTimeLimit: setter("timeLimit"),
    setCustomStadium: setter("stadium"),
  };
  const config = load("features/commands/adminThings/handleConfigCommand.ts");
  const category = load("features/commands/gameMode/wec/handleCategoryCommand.ts");
  const playerModule = load("features/changePlayerState/players.ts");
  players[driver.id] = playerModule.createPlayerInfo();
  return {
    state, messages, room, admin, driver, players, config, category, playerModule, load,
    apply: (value = "wec", by = admin) => config.handleConfigCommand(by, [value], room),
    setCategory: (...args) => category.handleCategoryCommand(driver, args, room),
    start: (paused = false) => { scores = {}; gameState = paused ? "paused" : "running"; },
  };
}

for (const leagueMode of [true, false]) {
  test(`WEC overrides previous presets and race defaults (league=${leagueMode})`, () => {
    const app = setup(leagueMode);
    app.apply("ftoh");
    app.load("features/changeGameState/changeGameModes.ts").changeGameMode("indy", app.room);
    app.apply("WEC");
    assert.equal(app.config.getActiveConfigType(), "wec");
    const modes = app.load("features/changeGameState/changeGameModes.ts");
    assert.equal(modes.gameMode, modes.GameMode.RACE);
    assert.equal(modes.generalGameMode, modes.GeneralGameMode.GENERAL_RACE);
    for (const key of ["slipstream", "ers"]) assert.equal(app.state[key], true, key);
    for (const key of ["tyres", "wear", "raceTyresInQualy", "gas", "ghost", "blowouts", "ersPenalty", "debris", "crashSlowdown", "manageTyres", "scuderiaAvatar", "development", "teamBoxes", "blueFlags", "teamCommand"]) {
      assert.equal(app.state[key], false, key);
    }
    assert.equal(app.state.damage, "log");
    assert.equal(app.state.pit, "new");
    assert.equal(app.state.presentation, "off");
    assert.equal(app.state.rr, "off");
    assert.equal(app.load("features/commands/flagsAndVSC/handleSafetyCommand.ts").isRealSafetyEnabled(), true);
    const cuts = app.load("features/detectCut/enableCutPenalty.ts");
    assert.equal(cuts.detectCutEnabled, true);
    assert.equal(cuts.zeroRaceCutSpeedPenaltyEnabled, true);
    assert.equal(cuts.softCutPenalty, false);
  });
}

test("only an admin in a stopped room can activate WEC", () => {
  for (const scenario of ["non-admin", "running", "paused"]) {
    const app = setup();
    if (scenario !== "non-admin") app.start(scenario === "paused");
    app.apply("wec", scenario === "non-admin" ? app.driver : app.admin);
    assert.equal(app.config.getActiveConfigType(), null);
    assert.deepEqual(app.state, {});
    assert.equal(app.messages.length, 1);
  }
});

test("category is self-selected, validated, preserved on reset and cleared to null", () => {
  const app = setup();
  assert.equal(app.players[2].category, null);
  app.setCategory("hyper");
  assert.equal(app.players[2].category, null);
  assert.equal(app.messages.at(-1).key, "CATEGORY_WEC_ONLY");
  app.apply();
  app.setCategory("HYPER");
  assert.equal(app.players[2].category, "hyper");
  for (const args of [[], ["invalid"], ["gt", "extra"]]) {
    app.setCategory(...args);
    assert.equal(app.players[2].category, "hyper");
    assert.equal(app.messages.at(-1).key, "CATEGORY_USAGE");
  }
  app.setCategory("gt");
  app.playerModule.resetPlayer(app.driver, app.room, app.driver.id);
  assert.equal(app.players[2].category, "gt");
  app.setCategory("clear");
  assert.equal(app.players[2].category, null);
  app.apply("fh");
  app.setCategory("hyper");
  assert.equal(app.players[2].category, null);
  assert.equal(app.messages.at(-1).key, "CATEGORY_WEC_ONLY");
});

test("leaving WEC through any session mode clears every category and disables the command", () => {
  for (const mode of ["race", "qualy", "training", "indy", "waiting", "hard_qualy", "battle_royale"]) {
    const app = setup();
    app.apply();
    app.setCategory("gt");
    app.players[1] = { category: "hyper" };
    app.players[99] = { category: "gt", isInTheRoom: false };
    app.load("features/changeGameState/changeGameModes.ts").changeGameMode(mode, app.room);
    for (const player of Object.values(app.players)) assert.equal(player.category, null, mode);
    assert.equal(app.config.getActiveConfigType(), null, mode);
    app.setCategory("gt");
    assert.equal(app.messages.at(-1).key, "CATEGORY_WEC_ONLY", mode);
    app.apply();
    app.setCategory("hyper");
    assert.equal(app.players[2].category, "hyper", mode);
  }
});

test("other configurations clear categories, including direct public configuration", () => {
  for (const preset of ["ftoh", "fh", "haxbula", "ftohpublic", "direct-public"]) {
    const app = setup();
    app.apply();
    app.setCategory("hyper");
    if (preset === "direct-public") app.config.applyFTOHPublicConfig(app.room, app.admin);
    else app.apply(preset);
    assert.equal(app.players[2].category, null, preset);
    app.setCategory("gt");
    assert.equal(app.messages.at(-1).key, "CATEGORY_WEC_ONLY", preset);
  }
});

test("rejected configuration commands do not clear WEC categories", () => {
  const app = setup();
  app.apply();
  app.setCategory("gt");
  app.apply("invalid");
  app.apply("fh", app.driver);
  assert.equal(app.config.getActiveConfigType(), "wec");
  assert.equal(app.players[2].category, "gt");
});

test("reapplying WEC preserves categories and keeps the command enabled", () => {
  const app = setup();
  app.apply();
  app.setCategory("gt");
  app.apply();
  assert.equal(app.players[2].category, "gt");
  assert.equal(app.config.getActiveConfigType(), "wec");
  app.setCategory("hyper");
  assert.equal(app.players[2].category, "hyper");
});

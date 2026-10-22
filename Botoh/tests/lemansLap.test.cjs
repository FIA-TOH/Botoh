const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

function setup(circuitPath, exportName) {
  const root = path.resolve(__dirname, "../src");
  const cache = new Map();
  const maps = { CIRCUITS: [], currentMapIndex: 0 };
  function load(relative) {
    if (cache.has(relative)) return cache.get(relative);
    const filename = path.join(root, relative);
    const exports = {};
    cache.set(relative, exports);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText;
    vm.runInNewContext(source, { exports, __dirname: path.dirname(filename), require: (request) => {
      if (request === "fs") return fs;
      if (request === "path") return path;
      const resolved = path.relative(root, path.resolve(path.dirname(filename), request)).split(path.sep).join("/") + ".ts";
      if (resolved === "circuits/bestTimes.ts") return { bestTimes: {} };
      if (resolved === "features/zones/maps.ts") return maps;
      if (resolved === "features/zones/laps.ts") return { laps: 10 };
      if (resolved === "features/changeGameState/teams.ts") return { Teams: { RUNNERS: 1 } };
      return load(resolved);
    } });
    return exports;
  }
  const circuit = load(circuitPath)[exportName];
  maps.CIRCUITS.push(circuit);
  return { circuit, utils: load("features/utils.ts"), laps: load("features/zones/laps/handleLapChange.ts") };
}

for (const [file, name] of [["le_mans/lemansnight", "LEMANSNIGHT"], ["kyalami/kyalamiSeasonTres", "KYALAMISEASONTRES"]]) {
  test(`${name}: finish and sectors contain valid detectable rectangles`, () => {
    const { circuit, utils, laps } = setup(`circuits/${file}.ts`, name);
    for (const key of ["finishLine", "sectorOne", "sectorTwo", "sectorThree"]) {
      const bounds = circuit.info[key].bounds;
      assert.ok(bounds.minX < bounds.maxX, `${key}: X bounds`);
      assert.ok(bounds.minY < bounds.maxY, `${key}: Y bounds`);
      const pad = { p: { id: 1 }, disc: { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 } };
      assert.equal(utils.inHitbox(pad, bounds), true, key);
      if (key === "finishLine") {
        assert.equal(laps.ifInLapChangeZone(pad, { getScores: () => ({ time: 1 }) }), true);
        assert.equal(laps.ifInLapChangeZone(pad, { getScores: () => ({ time: 0 }) }), false);
      }
    }
  });
}

test("Le Mans detects the racing straight and accepts the leftward crossing", () => {
  const { circuit, utils, laps } = setup("circuits/le_mans/lemansnight.ts", "LEMANSNIGHT");
  const room = { getScores: () => ({ time: 10 }) };
  const pad = { p: { id: 1 }, disc: { x: -4749, y: 4050, xspeed: -2, yspeed: 0 } };
  assert.equal(laps.ifInLapChangeZone(pad, room), true);
  assert.equal(utils.inHitbox(pad, circuit.info.sectorOne.bounds), true);
  assert.equal(utils.checkIfTrolling(pad, circuit.info.finishLine.passingDirection), false);
  pad.disc.x = -4700;
  assert.equal(laps.ifInLapChangeZone(pad, room), false);
});

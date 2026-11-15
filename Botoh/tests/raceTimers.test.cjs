const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

function setup() {
  let now = 10000;
  let next = 0;
  const jobs = new Map();
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, "../src/features/changeGameState/raceTimers.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(source, {
    exports, performance: { now: () => now }, Date: { now: () => now },
    globalThis: {
      setTimeout: (callback, delay) => { const id = ++next; jobs.set(id, { callback, due: now + delay }); return id; },
      clearTimeout: (id) => jobs.delete(id),
    },
  });
  return {
    timers: exports.createRaceTimerScheduler(),
    advance(milliseconds) {
      const target = now + milliseconds;
      while (true) {
        const entry = [...jobs].filter(([, job]) => job.due <= target).sort((a, b) => a[1].due - b[1].due)[0];
        if (!entry) break;
        const [id, job] = entry;
        now = job.due;
        jobs.delete(id);
        job.callback();
      }
      now = target;
    },
  };
}

test("avatar timeout retains remaining duration and stable cancellation handle", () => {
  const app = setup();
  let count = 0;
  app.timers.setTimeout(() => count++, 1000);
  const canceled = app.timers.setTimeout(() => count += 100, 1500);
  app.advance(400);
  app.timers.pause();
  const wallClock = app.timers.now();
  app.advance(5000);
  assert.equal(count, 0);
  assert.equal(app.timers.now(), wallClock);
  app.timers.clearTimeout(canceled);
  app.timers.resume();
  app.advance(599);
  assert.equal(count, 0);
  app.advance(1);
  assert.equal(count, 1);
  assert.equal(app.timers.now(), wallClock + 600);
  app.advance(5000);
  assert.equal(count, 1);
});

test("safety-car interval resumes without catch-up bursts and can cancel itself", () => {
  const app = setup();
  let count = 0;
  const handle = app.timers.setInterval(() => {
    count++;
    if (count === 3) app.timers.clearInterval(handle);
  }, 1000);
  app.advance(1200);
  assert.equal(count, 1);
  app.timers.pause();
  app.advance(8000);
  app.timers.resume();
  app.advance(799);
  assert.equal(count, 1);
  app.advance(1);
  assert.equal(count, 2);
  app.advance(4000);
  assert.equal(count, 3);
});

test("timers scheduled during transition start only after resume", () => {
  const app = setup();
  let fired = false;
  app.timers.pause();
  app.timers.setTimeout(() => { fired = true; }, 200);
  app.advance(1000);
  assert.equal(fired, false);
  app.timers.resume();
  app.advance(199);
  assert.equal(fired, false);
  app.advance(1);
  assert.equal(fired, true);
});

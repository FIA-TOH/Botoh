type Timer = {
  callback: () => void;
  remaining: number;
  due: number;
  repeat: number | null;
  native?: NodeJS.Timeout;
};

// Keep stable handles: avatar/SC callbacks can cancel or replace their own timer.
export function createRaceTimerScheduler() {
  const timers = new Map<NodeJS.Timeout, Timer>();
  let paused = false;
  let pausedAt = 0;
  let totalPaused = 0;
  function arm(handle: NodeJS.Timeout, timer: Timer) {
    timer.due = performance.now() + timer.remaining;
    timer.native = globalThis.setTimeout(() => {
      if (!timers.has(handle) || paused) return;
      if (timer.repeat === null) timers.delete(handle);
      timer.callback();
      if (timer.repeat !== null && timers.has(handle)) {
        timer.remaining = timer.repeat;
        if (!paused) arm(handle, timer);
      }
    }, timer.remaining);
  }
  function schedule(callback: () => void, milliseconds = 0, repeat: number | null = null) {
    const handle = {} as NodeJS.Timeout;
    const timer: Timer = { callback, remaining: Math.max(0, milliseconds), due: 0, repeat };
    timers.set(handle, timer);
    if (!paused) arm(handle, timer);
    return handle;
  }
  function cancel(handle?: NodeJS.Timeout | null) {
    if (!handle) return;
    const timer = timers.get(handle);
    globalThis.clearTimeout(timer?.native ?? handle);
    timers.delete(handle);
  }
  return {
    setTimeout: (callback: () => void, milliseconds = 0) => schedule(callback, milliseconds),
    setInterval: (callback: () => void, milliseconds: number) => schedule(callback, milliseconds, Math.max(1, milliseconds)),
    clearTimeout: cancel,
    clearInterval: cancel,
    now: () => (paused ? pausedAt : Date.now()) - totalPaused,
    pause() {
      if (paused) return;
      paused = true;
      pausedAt = Date.now();
      timers.forEach((timer) => {
        timer.remaining = Math.max(0, timer.due - performance.now());
        globalThis.clearTimeout(timer.native);
      });
    },
    resume() {
      if (!paused) return;
      totalPaused += Date.now() - pausedAt;
      paused = false;
      timers.forEach((timer, handle) => arm(handle, timer));
    },
  };
}

export const raceTimers = createRaceTimerScheduler();
export const { setTimeout, clearTimeout, setInterval, clearInterval } = raceTimers;

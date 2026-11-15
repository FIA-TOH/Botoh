# WEC day/night cycle

The cycle runs only while WEC is enabled and the active circuit has
`info.hasDayNightCycle: true`. Automatic cycling is currently disabled in both
day/night variants of Le Mans and Daytona WEC (`hasDayNightCycle: false`).
Both variants must be registered in `CIRCUITS` and `CIRCUIT_FILE_NAMES`, named
`<base>day.hbs` and `<base>night.hbs`. It starts with the variant selected for
the session, then alternates every 1.66666666 minutes (~100 seconds) of race
time for testing. The planned event default is 13.3333333 minutes (~800 seconds).
Set
`WEC_DAY_NIGHT_MINUTES` before starting the bot to change the interval.

## State and transition

`installDayNightCycle` wraps the installed room callbacks once, in `room.ts`.
During an internal lighting swap it bypasses the normal game-stop, stadium
and game-start callbacks. A normal stop/start or manual map selection still
runs the original callbacks. All bot race state therefore stays in place,
including references captured by pending callbacks:

| System | Preservation |
| --- | --- |
| PlayerInfo / playerList | Same objects and nested state; no resetPlayer call |
| PlayerObject | Same native player IDs, names, admin/team membership; snapshot of the exposed object |
| Players' discs | Position, speed, gravity, damping, collision masks, radius, mass, restitution and color restored |
| Stadium discs / camera ball | Physics restored by disc index; new scenery colors retained |
| Clock | getScores returns continuous logical elapsed time; transition time excluded |
| Lap / sector clocks | lastLapTimeUpdate adjusted for the real transition duration |
| Laps, sectors, positions, gap history, records | Existing module objects retained, no lifecycle cleanup |
| Flags, SC, VSC, AFK counters | Existing module objects and continuous deadlines retained |
| ERS, wear, damage, speed modifiers | Player state retained; crash cooldown wall clock frozen |
| Pit reaction | pitReadyTime, pitEmojiShowTime, reactionTimeout and damping restored |
| Tyre change | pitCountdown, pitSteps, pitTargetTires, initial position and failures retained |
| Repair | Repair position, ready/reaction/end times and damage retained |
| Avatars | Latest bot avatar restored; current situation and remaining timeout retained |
| Cut / crash / direction detectors | Same detector caches and touch state; no reloading cut segments |
| Weather | No restart of monitoring or reset of current weather |
| Recording / results | Existing recorder retained; no intermediate results or Discord replay submission |
| Rejoin / prepared tyres | Stores retained, including scheduled rejoin teleport timers |

Room mutations in the bundled `haxball.js` API run asynchronously through a
promise queue. The transition follows `onGameStop -> onStadiumChange ->
onGameStart`. Inside `onGameStart`, discs and avatars are restored exactly once,
before the first new-game tick, to avoid exposing spawn positions to the camera.
The transition completes after the asynchronous mutation queue.
Later ticks never reapply the saved position: the engine has already resumed
movement and can round physical values, so equality with the snapshot must
not be used as an acknowledgement. No fixed sleep or artificial pause/unpause
countdown is introduced. This minimizes the gap without guaranteeing an
invisible transition under all host/network conditions.

Timers used for avatar alerts, safety-car countdown/blinking, sector indicators,
minimum-pit warnings, finish countdowns and delayed rejoin teleporting use
`raceTimers`. Timers pause with their remaining duration and resume without
catch-up bursts. New room player events and chat commands received during a
swap are processed after restoration, rather than against a temporary empty
world. Leave events remain genuine departures and are not resurrected.

## Validation and recovery

Before the first stop, both variants are parsed and their nonvisual data is
compared. Geometry, disc count/order, spawn points, physics and collision
settings must match. Only stadium name, background and color/editor-selection
fields may differ. Missing or incompatible variants disable the cycle for
that session without stopping the race.

A load or restoration timeout attempts to restore the original variant and
the captured physics, then disables further swaps for that session. If the
original variant also cannot be restored, a normal stop runs the usual
cleanup rather than silently continuing with corrupt physics. Errors go to
the server log.

## API limits and verification

The public room API has no setter for the native scoreboard clock or scores,
nor for a player's held keyboard input bits. The native clock shown by the
client and recorded replay restarts when the engine restarts; the bot clock
remains continuous. Held movement/kick keys are cleared by the native stop
operation. Restored disc velocity/gravity/damping preserves the immediate
physics, but clients may need to release/repress a held key. Names/auth/admin
membership are retained natively, not recreated through unsupported setters.

Thus this is preservation of bot state and exposed physics, not a full native
engine snapshot. Exact preservation of the native clock and held inputs would
require a separately maintained engine extension. Automated tests simulate
the asynchronous API and exercise the real pit reaction and repair handlers;
a hosted multiplayer test is still required before relying on the feature in
a race. In particular, test held inputs, kick/reaction across the boundary,
client visual continuity, recorder output, spectators, a disconnect during
the swap and a manual stop.

Run `node --test tests/*.test.cjs` from `Botoh`.

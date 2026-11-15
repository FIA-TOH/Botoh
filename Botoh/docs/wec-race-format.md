# WEC race format

WEC races run for 2400 seconds (40 minutes) of continuous bot race time, followed by one
complete leader lap. `WEC_RACE_DURATION_SECONDS` defines the default duration.
Admins can change the duration while the game is stopped:

```text
!wec_time 300
!wec_time 2400
!wec_time
```

Values are positive whole seconds. The final leader lap is always retained.
The command without arguments queries the current duration, including during
a running session. Changes are rejected while running or paused. The chosen
duration survives normal session/mode resets and lighting swaps, and returns
to the 2400-second default when the bot process restarts. Race format messages
and the remaining-time notices use the configured duration.

The native time limit is disabled, and the normal fixed lap limit is ignored
while WEC is active. Other modes retain their usual limits.

1. At the configured duration, a single localized broadcast celebrates the simulated
   24 hours of endurance and explains that the leader will start the final
   lap at their next crossing.
2. On the first leader crossing at or after the configured duration, a second broadcast
   names the leader and announces the final lap. This crossing cannot finish
   the race.
3. On the next leader crossing, the winner receives the checkered flag.
4. Each remaining driver finishes at their next valid crossing, including
   drivers a lap or more behind. WEC does not force everyone into spectators
   after the old 30-second public-room grace period.
5. Once no drivers remain running, the existing normal race-stop path
   publishes results and performs cleanup.

The leader is determined at the crossing from the running drivers' lap
progress, excluding spectators and retirees. A driver already on the same or
a later lap is ahead of the crossing driver. The replacement leader can finish
if the original leader retires during the final lap.

The timer uses `room.getScores().time` through the installed continuous-clock
wrapper in `dayNightCycle.ts`, not the native stadium time. Actual elapsed
time, expiration status, final-lap status and the set of finished drivers live
in `wecRace.ts`. Lighting swaps bypass normal lifecycle callbacks and preserve
this state; a normal session start/stop or leaving WEC resets it. Pauses and
lighting-transition time are excluded by the continuous clock.

Lap history grows as needed. WEC lap notices show remaining minutes and seconds
instead of `Lap x/3`; remaining time is clamped to zero in overtime. Finish
results use the continuous race elapsed time.

Messages are registered in the existing message system in Portuguese,
English, Spanish, French and Turkish. Tests cover the 2400-second boundary,
the complete extra lap, same-lap followers, lapped GT finishers, a leader
retiring, native clock resets during lighting swaps, normal race behavior and
resetting the WEC format on mode exit.

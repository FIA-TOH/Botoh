# Banking: gated arc-distance resistance

Banking is enabled only on circuits with optional info.bankingZones. Daytona
WEC Day and Night share the final-left definition and live settings.

## Exact Daytona geometry

- Base arc: (-3341.8241155399764, -1192.138867821734) to
  (-2874.449378820837, -3102.6847891408274), curve +150 degrees.
  Reversing these vertices requires -150 degrees for the same left-hand arc.
- Top detector: (-3341.8241155399764, -1192.138867821734) to (-3455, -1038).
- Bottom detector: (-2874.449378820837, -3102.6847891408274) to
  (-2879.28, -3283.2000000000003).

The movement segment of the player's centre is tested against each finite
entry/exit detector every tick. Crossing either detector toggles that player's
inside/outside state, in either direction. Merely touching/stopping on a
line does not toggle repeatedly. A 0.5-unit stable-side tolerance prevents
jitter, and crossing a detector's infinite extension does not count.

Players start outside. After spawning, teleporting, re-enabling banking or
changing maps, they must cross a detector to enter. Steps over 200 units
between samples are treated as teleports and clear the previous zone state.
Normal starts/stops and player departures clear tracking; internal day/night
swaps preserve it because the logical session and shared zones remain intact.

## Resistance

While inside, calculate the exact shortest distance d from the centre of the
player disc to the finite base arc. The disc radius is not subtracted. Within
the arc's angular span this is the absolute radial distance to its circle;
outside the span it is the distance to the nearest arc endpoint.

    t = clamp(d / falloffDistance, 0, 1)
    drag = maxDrag * (1 - t ^ exponent) ^ 1.5
    extraXGravity = -xSpeed * drag
    extraYGravity = -ySpeed * drag

Default values:

| Centre distance to base | Extra resistance coefficient |
| --- | --- |
| 0 px | 0.001955 (100%) |
| 25 px | ~0.001874 (95.9%) |
| 50 px | ~0.001638 (83.8%) |
| 75 px | ~0.001270 (65.0%) |
| 100 px | ~0.000810 (41.4%) |
| 125 px | ~0.000331 (16.9%) |
| 150 px or farther | 0 |

The default exponent is 2. This nonlinear power profile keeps the inner half
punitive and releases resistance more rapidly beyond the middle. Increasing
the exponent holds punishment farther out before the falloff. It changes the
shape, not the maximum drag or the distance at which resistance becomes zero.

This replaces the previous radial boost model. It has no outside boost,
heading weighting, edge fades or absolute force cap that would weaken the
requested coefficient. Resistance opposes motion and does not steer or
teleport the car. The shorter inside path remains a property of map geometry.
Overlapping zones do not stack: the first active zone supplies the force.

Crossings are tracked during neutralization too. Physical resistance remains
suppressed in pitlane/pit stops, repair/reaction, VSC/SC, yellow/red flags and
active cut-speed penalties. Existing GT resistance, grip and other forces
are composed with banking in one final gravity update. Configured maps use
the speed controller each tick to avoid stale forces after an exit.

## Live admin commands

    !banking on
    !banking off
    !banking status
    !banking_set final-left maxDrag 0.001955
    !banking_set final-left falloffDistance 150
    !banking_set final-left exponent 2
    !banking_set final-left status
    !banking_set final-left reset

The same commands accept oval-right for the second Daytona zone.
maxDrag accepts 0 through 0.05; falloffDistance accepts a finite value greater
than 0 through 10000; exponent accepts 1 through 8. Decimal commas work. Invalid settings and non-admin
commands do not mutate state. Adjustments refresh the force immediately.
Settings are runtime-only, shared between Daytona Day and Night, and reset
to circuit defaults when the process restarts or the reset command is used.
The former innerDrag/outerBoost/radius parameters no longer apply.

Automated tests exercise exact distances/coefficients, finite-arc endpoints,
reversed signed curvature, both gate directions, exact-line contact, gate
extensions, independent players, map/teleport/reset behavior, neutralization,
per-tick integration, admin tuning and the exact supplied Daytona coordinates.
Live driving validation is still needed.

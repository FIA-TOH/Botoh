# Analysis: handleSpeed, gameTick and Gravity Simulation

## 📊 General Flow: How Everything Connects

```
┌─────────────────────────────────────────────────────────────────┐
│                     onGameTick (60 Hz)                          │
│              [Haxball Headless Host Engine]                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GameTick(room)                                 │
│            src/features/roomFeatures/gameTick.ts                 │
├─────────────────────────────────────────────────────────────────┤
│  1. endRaceSession()         - Checks race end                  │
│  2. updateGripCounter()      - Updates grip counter             │
│  3. updateErs()              - Manages ERS                      │
│  4. setBallPosition()        - Positions ball                   │
│  5. ▶ distributeSpeed()      - DISTRIBUTES SPEED LOAD          │
│  6. handlePitlane()          - Manages pit lane                 │
│  7. checkPlayerSector()      - Sector detection                 │
│  8. mainLapCommand()         - Laps                             │
│  9. Detecta cortes           - Penalties                        │
│  10. Gerencia pneus          - Tire wear                        │
│  11. afkKick()               - Removes inactive players         │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │   distributeSpeed(playersAndDiscs)  │
        │   src/features/speed/distributrSpeed.ts
        ├─────────────────────────────────────┤
        │ • Counts active players             │
        │ • Calculates processing/frame      │
        │ • Balances load:                   │
        │   - 60Hz main                      │
        │   - Min 3 ticks per player         │
        │   - 25% reduction (reductionFactor) │
        │ • Prioritizes pit lane (+3x)        │
        │ • Selects player subset             │
        └────────────┬────────────────────────┘
                     │
                     ▼ (Passes only subset)
        ┌──────────────────────────────────────┐
        │   controlPlayerSpeed()               │
        │   src/features/speed/handleSpeed.ts  │
        ├──────────────────────────────────────┤
        │ For each player in subset:          │
        │  1. Calculates slipstream effect     │
        │  2. Calculates grip multiplier       │
        │  3. ▶ applyPitAndVscRules()         │
        │     → APPLIES GRAVITY                │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │   applyPitAndVscRules()              │
        │   src/features/speed/pitAndVscRules │
        ├──────────────────────────────────────┤
        │ room.setPlayerDiscProperties()       │
        │  {                                   │
        │    xgravity: -x * (1 - grip),        │
        │    ygravity: -y * (1 - grip)         │
        │  }                                   │
        │                                      │
        │ Gravity applies:                    │
        │ • Friction in normal movement       │
        │ • Pit lane: strong deceleration     │
        │ • Safety car: 1.5% braking          │
        │ • Curves: lateral damping            │
        └──────────────────────────────────────┘
```

---

## 🎮 Details: What Happens Each Frame (16.67ms)

### **Phase 1: GameTick is Called**
```typescript
// In room.ts - line 73
GameTick(room);  // Executed 60 times per second

// In gameTick.ts - line 34
export function GameTick(room: RoomObject) {
  room.onGameTick = function () {
    const playersAndDiscs = getPlayerAndDiscs(room);
    const players = getRunningPlayers(playersAndDiscs);
    
    // ... (other processing)
    
    // CRITICAL MOMENT: Distribute speed
    distributeSpeed(playersAndDiscs, room);
    
    // ... (continues with pit lane, sector, etc)
  };
}
```

---

### **Phase 2: Speed Distribution (Load Balancing)**
```typescript
// In distributrSpeed.ts

export function distributeSpeed(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  const totalPlayers = players.length;
  
  // ====== PROCESSING CALCULATION ======
  const ticksPerSecond = 60;           // Haxball runs at 60 ticks/s
  const minTicksPerPlayer = 3;         // Each player needs to be processed 3x/second
  const reductionFactor = 0.75;        // 25% reduction
  
  const requiredProcessPerSecond = totalPlayers * minTicksPerPlayer;
  // Ex: 8 players * 3 = 24 processings/second needed
  
  const avgProcessPerTick = 
    (requiredProcessPerSecond / ticksPerSecond) * reductionFactor;
  // Ex: (24 / 60) * 0.75 = 0.3 processings/frame
  
  accumulated += avgProcessPerTick;
  const processThisTick = Math.floor(accumulated);
  accumulated -= processThisTick;
  
  // ====== PLAYER SELECTION ======
  const playersToProcess = [];
  
  for (let i = 0; i < processThisTick; i++) {
    const player = players[nextPlayerIndex];
    if (player) {
      const playerAndDisc = playersAndDiscs.find(
        (pd) => pd.p.id === player.p.id
      );
      
      if (playerAndDisc) {
        const playerInfo = playerList[player.p.id];
        
        // PRIORITY: Pit lane players are processed 3x
        if (playerInfo?.inPitlane) {
          playersToProcess.push(playerAndDisc, playerAndDisc, playerAndDisc);
        } else {
          playersToProcess.push(playerAndDisc);
        }
      }
    }
    
    // Round-robin: next player
    nextPlayerIndex = (nextPlayerIndex + 1) % totalPlayers;
  }
  
  // FINALLY: Apply speed to selected subset
  controlPlayerSpeed(playersToProcess, room);
}
```

**Logic:**
- `📊 Distributes load` to avoid overloading processing
- `🏁 Prioritizes pit lane` (processed up to 3x per frame)
- `🔄 Rotates between players` via round-robin
- **Result:** Each player processed ~3x per second at 60 Hz

---

### **Phase 3: Speed Calculation (controlPlayerSpeed)**
```typescript
// In handleSpeed.ts

export function controlPlayerSpeed(
  playersAndDiscsSubset: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const currentTime = room.getScores()?.time || 0;
  const playersAndDiscs = getPlayerAndDiscs(room);
  const playersRunning = getRunningPlayers(playersAndDiscs);
  
  playersAndDiscsSubset.forEach(({ p, disc }) => {
    const playerInfo = playerList[p.id];
    
    // ====== 1. STOP IN PIT STOP ======
    if (playerInfo.inPitStop) {
      room.setPlayerDiscProperties(p.id, {
        xspeed: 0,
        yspeed: 0,
        xgravity: 0,
        ygravity: 0,
      });
      return;  // Skip rest of processing
    }
    
    // ====== 2. CALCULATE SLIPSTREAM EFFECT (DRAFT) ======
    const slipstreamData = calculateSlipstreamEffect(
      p,                    // Current player
      disc,                 // Disc properties
      playersRunning,       // All players
      currentTime,
      playerInfo,
      vsc                   // Safety car active?
    );
    // Returns: { effectiveSlipstream: 0.0001 } to 0.0003
    
    // ====== 3. CALCULATE FINAL GRIP ======
    const gripMultiplier = calculateTotalGripMultiplier(
      p,
      disc,
      playerInfo,
      slipstreamData.effectiveSlipstream,  // ← Considers draft
      currentTime,
      room
    );
    // Returns: 0.95 to 1.05 (dynamic grip)
    
    // ====== 4. APPLY RULES AND GRAVITY ======
    applyPitAndVscRules(
      p,
      disc,
      room,
      gripMultiplier,      // ← Uses calculated grip
      playerInfo,
      currentTime,
      vsc
    );
    
    playerList[p.id] = playerInfo;
  });
}
```

---

### **Phase 4: Gravity Application (CRUCIAL)**
```typescript
// In pitAndVscRules.ts - THIS IS WHERE THE MAGIC HAPPENS!

export function applyPitAndVscRules(
  p: PlayerObject,
  disc: DiscPropertiesObject,
  room: RoomObject,
  gripMultiplier: number,
  playerInfo: PlayerInfo,
  currentTime: number,
  vsc: boolean,
) {
  let limiter = 0;
  
  // ====== CHECK LIMITERS ======
  // 1. In pit lane?
  if (playerInfo.inPitlane) {
    limiter = ACTUAL_CIRCUIT.info.pitSpeed ?? constants.DEFAULT_PIT_SPEED;
    // Typical: 0.97 (3% deceleration)
  }
  // 2. Safety car active?
  else if (vsc) {
    limiter = gameMode === GameMode.INDY
      ? constants.SAFETY_CAR_INDY_SPEED  // 0.993
      : constants.SAFETY_CAR_SPEED;       // 0.985 (1.5% deceleration)
  }
  
  const { xspeed: x, yspeed: y } = disc;
  
  // ====== GRAVITY FORMULA ======
  if (limiter > 0) {
    // Pit lane or safety car: apply limiter
    room.setPlayerDiscProperties(p.id, {
      xgravity: -x * (1 - limiter),      // xgravity = -(xvelocity * deceleration_factor)
      ygravity: -y * (1 - limiter),
    });
    // If x=0.5 and limiter=0.97: xgravity = -0.5 * 0.03 = -0.015
  } 
  else if (gripMultiplier) {
    // Normal condition: use grip
    room.setPlayerDiscProperties(p.id, {
      xgravity: -x * (1 - gripMultiplier),  // Friction proportional to grip
      ygravity: -y * (1 - gripMultiplier),
    });
    // If x=0.5 and grip=0.99: xgravity = -0.5 * 0.01 = -0.005
  }
}
```

---

## 🚗 Gravity System in Haxball

### **What Is Gravity?**
In Haxball, `xgravity` and `ygravity` are **deceleration vectors** that make the disc lose speed each frame.

### **Base Formula:**
$$\text{gravity} = -\text{velocity} \times (1 - \text{grip})$$

Where:
- `velocity`: current disc velocity (xspeed, yspeed)
- `grip`: grip multiplier (0.90 to 1.05)
- `1 - grip`: friction/deceleration factor

### **Practical Gravity Examples:**

| Situation | Velocity | Grip | Gravity | Result |
|-----------|----------|------|----------|---------|
| Dry straight | 0.5 | 0.99 | -0.005 | Decelerates slowly |
| Wet straight | 0.5 | 0.85 | -0.075 | Decelerates a lot |
| Pit lane | 0.5 | 0.97 | -0.015 | Moderate deceleration |
| Safety car | 0.5 | 0.985 | -0.0075 | Little deceleration |
| ERS active | 0.5 | 1.05 | +0.025 | **ACCELERATES** (grip > 1) |

---

## 📈 How to Calculate Grip (Traction)

```
┌─────────────────────────────────────────────┐
│  calculateTotalGripMultiplier()              │
├─────────────────────────────────────────────┤
│ 1. Base: tire type + weather condition     │
│    - Dry (rain=0%): 0.99 to 1.0           │
│    - Wet (rain=100%): 0.85 to 0.9         │
│    - Transition: interpolated             │
│                                             │
│ 2. Wear: more worn = less grip           │
│    - 0% wear: grip * 1.0                 │
│    - 100% wear: grip * 0.7               │
│                                             │
│ 3. ERS: when active, increases grip       │
│    - ERS active: grip += 0.02             │
│    - ERS empty: grip -= 0.006             │
│                                             │
│ 4. Slipstream: draft improves grip        │
│    - Near car = +0.0003 extra            │
│                                             │
│ 5. Penalties: cut reduces grip           │
│    - Cut penalty: grip * 0.8 for 5 sec   │
│                                             │
│ ▶ Final Result: gripMultiplier (0.7-1.1)
└─────────────────────────────────────────────┘
```

---

## 🎯 Speed Change Simulation with Gravity

### **Method 1: Manual Simulation Without Haxball**
To test before applying in the game:

```typescript
interface DiscState {
  xspeed: number;
  yspeed: number;
  xgravity: number;
  ygravity: number;
}

function simulatePhysics(
  disc: DiscState,
  iterations: number = 1
): DiscState {
  for (let i = 0; i < iterations; i++) {
    // Each iteration = 1 frame (16.67ms at 60Hz)
    disc.xspeed += disc.xgravity;
    disc.yspeed += disc.ygravity;
  }
  return disc;
}

// Example 1: Normal deceleration (grip 0.99)
let disc1: DiscState = {
  xspeed: 0.5,
  yspeed: 0.3,
  xgravity: -0.5 * (1 - 0.99),  // -0.005
  ygravity: -0.3 * (1 - 0.99),  // -0.003
};

console.log("Frame 0:", disc1);
console.log("Frame 1:", simulatePhysics({ ...disc1 }, 1));
// Frame 1: { xspeed: 0.495, yspeed: 0.297, ... }

// Example 2: Rain (grip 0.85)
let disc2: DiscState = {
  xspeed: 0.5,
  yspeed: 0.3,
  xgravity: -0.5 * (1 - 0.85),  // -0.075
  ygravity: -0.3 * (1 - 0.85),  // -0.045
};

console.log("Rain Frame 1:", simulatePhysics({ ...disc2 }, 1));
// Frame 1: { xspeed: 0.425, yspeed: 0.255, ... } (decelerates 15% vs 1%)
```

---

### **Method 2: Apply Dynamically in Game**

Your code already does this in lines 20-27 of **pitAndVscRules.ts**:

```typescript
// Your current system:
room.setPlayerDiscProperties(p.id, {
  xgravity: -x * (1 - gripMultiplier),
  ygravity: -y * (1 - gripMultiplier),
});

// Haxball automatically applies each frame:
// xspeed += xgravity
// yspeed += ygravity
```

---

### **Method 3: Simulation with Curves (Lateral Damping)**

```typescript
// If direction change > 8.5°, add lateral damping
function applyDampingOnCurves(
  disc: DiscState,
  angleChange: number,
  dampingFactor: number = 0.05
): DiscState {
  if (angleChange > 8.5) {
    // Perpendicular to movement
    const perpX = -disc.yspeed;
    const perpY = disc.xspeed;
    
    disc.xgravity += perpX * dampingFactor;
    disc.ygravity += perpY * dampingFactor;
  }
  return disc;
}
```

---

## 📊 System Constants

```typescript
// In constants.ts

export const constants = {
  // Speed and Performance
  NORMAL_SPEED: 1,
  DRS_SPEED_GAIN: 0.001,
  ERS_PENALTY: -0.006,
  JUMP_START_PENALTY: -0.005,
  FULL_GAS_SPEED: 0.00025,
  ZERO_GAS_PENALTY: 0.005,
  PENALTY_SPEED: 0.97,
  
  // Pit Lane and Safety Car
  DEFAULT_PIT_SPEED: 0.97,           // 3% deceleration
  SAFETY_CAR_SPEED: 0.985,           // 1.5% deceleration
  SAFETY_CAR_INDY_SPEED: 0.993,      // 0.7% deceleration
  
  // Slipstream (draft)
  MAX_SLIPSTREAM: 0.0003,            // Maximum extra acceleration
  RESIDUAL_SLIPSTREAM_TIME: 2.2,     // Residual time (seconds)
  SLIPSTREAM_ACTIVATION_DISTANCE: 600,
  SLIPSTREAM_LATERAL_TOLERANCE: 38,
  
  // Rain
  SLIDE_FACTOR: 2.5,                 // Slide multiplier
};
```

---

## 🔧 Complete Player Flow

### **Second 1.000 (Frame 60)**

```
1. onGameTick called
   ↓
2. GameTick() starts
   ↓
3. distributeSpeed() 
   → Checks: 8 players, needs ~0.3 processing/frame
   → Selects 1 player (because Math.floor(0.3) = 0)
   
4. controlPlayerSpeed([Player_1, disc_1])
   → slipstreamData = No draft (0.0)
   → gripMultiplier = 0.99 (dry, no wear)
   
5. applyPitAndVscRules()
   → Not in pit lane
   → No safety car
   → limiter = 0
   → Applies:
      xgravity = -0.5 * (1 - 0.99) = -0.005
      ygravity = -0.3 * (1 - 0.99) = -0.003
   
6. Haxball engine:
   → xspeed = 0.5 + (-0.005) = 0.495
   → yspeed = 0.3 + (-0.003) = 0.297
   
7. Next frame, gravity recalculated with new velocity

Result: Realistic deceleration ✓
```

---

## ⚠️ Critical Points to Understand

### **1. Why 60 Hz?**
- Haxball runs 60 ticks per second
- Each tick = 16.67 ms
- Gravity changes have immediate effect

### **2. Why distribute load?**
- Processing all players every frame = heavy
- With 8 players: only 0.3 process per frame
- But each processes ~3x per second
- Result: smooth effect even without continuous processing

### **3. Pit lane has priority?**
- Pit lane players: processed 3x per frame
- Normal players: 1x per frame (on average)
- Ensures pit limiter is strictly respected

### **4. Is gravity continuous?**
- YES! If you don't recalculate, player continues decelerating
- Therefore, velocity is dynamically recalculated
- Each player can have different gravity

---

## 🎬 Use Case: Implement Curve Braking

You want to add automatic braking in curves (like real F1):

```typescript
// In a new file: features/speed/curveDeceleration.ts

export function calculateCurveDeceleration(
  playerPosition: { x: number; y: number },
  playerVelocity: { xspeed: number; yspeed: number },
  trackGeometry: { radiusCurve: number }  // curve radius
) {
  const speed = Math.hypot(playerVelocity.xspeed, playerVelocity.yspeed);
  
  // Maximum speed in curve = sqrt(grip * gravity * radius)
  // Simplified: maxSpeed = radius * 0.3
  const maxSpeedInCurve = trackGeometry.radiusCurve * 0.3;
  
  if (speed > maxSpeedInCurve) {
    // Apply extra gravity to brake
    const excessSpeed = speed - maxSpeedInCurve;
    const brakeFactor = 0.1 * excessSpeed;  // Braking intensity
    
    return {
      xgravity: -(playerVelocity.xspeed / speed) * brakeFactor,
      ygravity: -(playerVelocity.yspeed / speed) * brakeFactor,
    };
  }
  
  return { xgravity: 0, ygravity: 0 };
}
```

Then, in `applyPitAndVscRules.ts`:
```typescript
// Add BEFORE applying normal gravity:
const curveDecel = calculateCurveDeceleration(
  p.position,
  { xspeed: x, yspeed: y },
  getCurrentCurveInfo()  // you implement
);

if (curveDecel.xgravity !== 0) {
  room.setPlayerDiscProperties(p.id, curveDecel);
  return;  // Don't apply normal gravity
}
```

---

## 📚 Reference Files

| File | Main Function | Lines |
|------|---------------|-------|
| [gameTick.ts](src/features/roomFeatures/gameTick.ts#L34) | Main 60 Hz loop | 34-90 |
| [handleSpeed.ts](src/features/speed/handleSpeed.ts#L7) | Orchestrates calculations | 7-58 |
| [pitAndVscRules.ts](src/features/speed/pitAndVscRules.ts#L5) | **Applies gravity** | 5-29 |
| [distributrSpeed.ts](src/features/speed/distributrSpeed.ts#L7) | Load distribution | 7-51 |
| [constants.ts](src/features/speed/constants.ts#L1) | System constants | 1-42 |

---

## 🎓 Summary in One Sentence

**Each frame (60x/second), `GameTick` balances load between players, `handleSpeed` calculates grip based on tires/weather/ERS, and `applyPitAndVscRules` applies gravity proportional to grip to simulate realistic friction.**


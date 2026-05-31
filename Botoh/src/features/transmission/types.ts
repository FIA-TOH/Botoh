/**
 * Transmission system – type definitions.
 *
 * The transmission is a *virtual* layer on top of Haxball physics.
 * - RPM is NOT physical: it's derived from speed and the active gear.
 * - Each gear acts as a torque multiplier on the gravity vector AND an
 *   artificial speed cap applied through extra damping.
 * - All numeric tuning lives in `defaults.ts` or per-scuderia overrides;
 *   nothing magic should appear in `engine.ts` / `shifter.ts` / `gearbox.ts`.
 */

export enum GearboxType {
  MANUAL_SEQUENTIAL = "manual_seq",
  MANUAL_HPATTERN = "manual_h",
  AUTOMATIC = "automatic",
  CVT_FAKE = "cvt_fake",
}

/**
 * A single gear definition.
 * - `torqueMultiplier`: scales the accelerator gravity vector.
 *    >1 in low gears (more push), <1 in high gears (smoother).
 * - `maxSpeedFactor`: 0..1 fraction of the car's global top speed that this
 *    gear can reach. Reaching that fraction triggers extra artificial damping.
 * - `rpmRange`: [rpmAtZeroSpeed, rpmAtMaxForThisGear]. Used to compute the
 *    virtual RPM linearly.
 */
export interface GearSpec {
  gear: number;
  torqueMultiplier: number;
  maxSpeedFactor: number;
  rpmRange: [number, number];
}

/**
 * Hooks invoked by `gearbox.ts` for systems that don't exist yet
 * (engine temperature, transmission wear, telemetry, etc.).
 * They're optional and called only when defined.
 */
export interface TransmissionHooks {
  onShift?: (playerId: number, fromGear: number, toGear: number) => void;
  onLimiter?: (playerId: number, rpm: number) => void;
  onRpmTick?: (playerId: number, rpm: number, gear: number) => void;
}

/**
 * Static, per-car/per-scuderia configuration.
 * Lives on `leagueScuderia.transmission`; falls back to DEFAULT_TRANSMISSION.
 */
export interface TransmissionConfig {
  type: GearboxType;
  gears: GearSpec[];
  /** Final drive ratio. Multiplies all torque uniformly. */
  finalDrive: number;
  /** Drivetrain efficiency (0..1). Multiplies all torque uniformly. */
  drivetrainLoss: number;
  /** Shift duration in milliseconds (real time). */
  shiftTimeMs: number;
  /** Idle RPM (RPM at zero speed in any gear). */
  idleRpm: number;
  /** Engine redline (hard ceiling). */
  redline: number;
  /** Torque multiplier applied above redline (power cut). 0..1. */
  rpmCutFactor: number;
  /** Base engine-braking force magnitude when throttle is released. */
  engineBrakeBase: number;
  /** Multiplier applied to torque when KERS is active. */
  kersTorqueMultiplier: number;
  /** Auto-shift thresholds (only used by AUTOMATIC / CVT_FAKE). */
  autoUpshiftRpm?: number;
  autoDownshiftRpm?: number;
  /** Extra damping added to enforce the per-gear speed cap. */
  speedCapDampingBoost: number;
  /** Fraction of speed lost on the first tick of a shift. Set to 1.0 for none. */
  shiftSpeedLoss: number;
  /** Torque multiplier kept during the shift window (0..1). Bigger = smoother. */
  shiftTorqueFactor: number;
  /** RPM threshold for the early upshift hint (avatar warning). */
  shiftHintRpm?: number;
  /** Downshift protection: refuse if current speed > target.maxSpeedFactor * this. */
  downshiftSpeedTolerance: number;
  hooks?: TransmissionHooks;
}

/**
 * Per-player live state. Stored on PlayerInfo.transmission.
 * Created lazily on first transmission tick when the player has a league scuderia.
 */
export interface TransmissionState {
  currentGear: number;
  rpm: number;
  isShifting: boolean;
  /** Real-time (ms) when the current shift completes. */
  shiftEndTime: number;
  /** Tick count of the last completed shift (for cooldown across shifts). */
  lastShiftTime: number;
  /** True when the engine accelerator gravity is ~zero this tick. */
  throttleReleased: boolean;
  /** True while RPM was above redline this tick. */
  limiterActive: boolean;
  /** Last time we sent a "limiter hit" chat warning (throttle). */
  lastLimiterWarnTime: number;
  /** Current driver-selected mode. May differ from the config's default. */
  mode: GearboxType;
  /** Pending shift direction during the shift window (+1 / -1 / 0). */
  pendingShiftDirection: 0 | 1 | -1;
  /** Gear we will land on when the shift completes. */
  pendingGear: number;
  /** True once this tick we've already applied shiftSpeedLoss for this shift. */
  shiftLossApplied: boolean;
  /** True while the shift-hint avatar is currently being displayed. */
  shiftHintActive: boolean;
}

/**
 * Result of `gearbox.update` for one player on one tick.
 * Caller (handleSpeed) composes these into the final disc properties.
 */
export interface TransmissionOutput {
  torqueMultiplier: number;
  dampingBoost: number;
  brakeForce: number;
  rpm: number;
  limiterActive: boolean;
  gearChangedTo: number | null;
  /** +1 / -1 / 0. Non-zero only on the tick the shift completes. */
  shiftDirection: number;
  /** True when RPM is near the optimal upshift point (drive the avatar hint). */
  shouldHintShift: boolean;
}

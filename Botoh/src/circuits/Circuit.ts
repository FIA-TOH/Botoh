export enum Direction {
  LEFT,
  RIGHT,
  UP,
  DOWN,
}

export enum SpecificDirection {
  LEFT,
  RIGHT,
  UP,
  DOWN,
  LEFTDOWN,
  LEFTUP,
  RIGHTDOWN,
  RIGHTUP,
}


export interface HitboxBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface DirectedHitboxBounds {
  bounds: HitboxBounds;
  passingDirection: Direction;
}

export type DirectionChangerDetector = {
  index: string;
  direction: SpecificDirection;
  v0: [number, number];
  v1: [number, number];
  force: number,
  sector: number,
};

export type CutSegment = {
  index: number;
  penalty: number;
  v0: [number, number];
  v1: [number, number];
};

export interface CircuitInfo {
  finishLine: DirectedHitboxBounds;
  name: string;
  boxLine: HitboxBounds;
  pitlaneStart: HitboxBounds;
  pitlaneEnd: HitboxBounds;
  drsStart: HitboxBounds[];
  drsEnd: HitboxBounds[];
  checkpoints: DirectedHitboxBounds[];
    firstPlace?: { x: number; y: number };
  lastPlace: { x: number; y: number };
  BestTime?: (string | number)[];
  MainColor?: number[];
  AvatarColor?: number;
  Angle?: number;
  Limit?: number;
  Votes?: number;
  sectorOne?: DirectedHitboxBounds;
  sectorTwo?: DirectedHitboxBounds;
  sectorThree?: DirectedHitboxBounds;
  pitSpeed?: number;
  TireDegradationPercentage?: number;
  CutDetectSegments?: CutSegment[];
  haveDebris?: boolean;
  physicsType?: CircuitPhysics;
  DirectionChangerDetector?: DirectionChangerDetector[],
  new_safetycar?: boolean,
}

export interface Circuit {
  map: string;
  info: CircuitInfo;
}

export enum CircuitPhysics {
  CLASSIC = "classic",
  F1_NEWGEN = "f1_newgen",
  INDY = "indy",
  WEC_NEWGEN = "wec_newgen",
  SEMINEWGEN = "seminewgen",
  RALLY = "rally",
}

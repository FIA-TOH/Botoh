export enum Direction {
  LEFT,
  RIGHT,
  UP,
  DOWN,
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
}

export interface Circuit {
  map: string;
  info: CircuitInfo;
}

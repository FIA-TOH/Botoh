export enum RaceControlState {
  GreenFlag = "green",
  YellowFlag = "yellow",
  RedFlag = "red",
  BlueFlag = "blue",
  BlackFlag = "black",
  VirtualSafetyCar = "vsc",
  SafetyCar = "sc",
}

export type FlagState =
  | RaceControlState.GreenFlag
  | RaceControlState.YellowFlag
  | RaceControlState.RedFlag
  | RaceControlState.BlueFlag
  | RaceControlState.BlackFlag;

export type NeutralizationState =
  | RaceControlState.VirtualSafetyCar
  | RaceControlState.SafetyCar;

export type FlagCommandArg = FlagState | "reset";

const FLAG_STATES = new Set<FlagState>([
  RaceControlState.GreenFlag,
  RaceControlState.YellowFlag,
  RaceControlState.RedFlag,
  RaceControlState.BlueFlag,
  RaceControlState.BlackFlag,
]);

export interface RaceControlSnapshot {
  flag: FlagState;
  neutralization: NeutralizationState | null;
}

const raceControlState: RaceControlSnapshot = {
  flag: RaceControlState.GreenFlag,
  neutralization: null,
};

export function getRaceControlState(): Readonly<RaceControlSnapshot> {
  return raceControlState;
}

export function setFlagState(flag: FlagState): void {
  raceControlState.flag = flag;
}

export function setNeutralizationState(
  neutralization: NeutralizationState | null
): void {
  raceControlState.neutralization = neutralization;
}

export function resetRaceControlState(): void {
  raceControlState.flag = RaceControlState.GreenFlag;
  raceControlState.neutralization = null;
}

export function isFlagState(value: string): value is FlagState {
  return FLAG_STATES.has(value as FlagState);
}

export function isFlagCommandArg(value: string): value is FlagCommandArg {
  return value === "reset" || isFlagState(value);
}

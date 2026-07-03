export interface RR_POSITION_INTERFACE {
  x: number;
  y: number;
}

export let RR_POSITION: RR_POSITION_INTERFACE | undefined = undefined;

export function clearRRPosition() {
  RR_POSITION = undefined;
}

export function setRRPosition(x: number, y: number) {
  RR_POSITION = { x, y };
}

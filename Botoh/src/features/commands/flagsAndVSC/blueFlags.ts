let blueFlagsEnabled = true;

export function setBlueFlagsEnabled(enabled: boolean): void {
  blueFlagsEnabled = enabled;
}

export function areBlueFlagsEnabled(): boolean {
  return blueFlagsEnabled;
}

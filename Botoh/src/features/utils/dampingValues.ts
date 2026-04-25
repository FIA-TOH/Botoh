
export const DAMPING_VALUES = {
  X_KEY: [0.986, 0.9905] as const
} as const;

export function isXKeyPressed(damping: number): boolean {
  return DAMPING_VALUES.X_KEY.some(value => value === damping);
}
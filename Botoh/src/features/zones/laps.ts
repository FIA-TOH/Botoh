export const DEFAULT_LAPS = 3

export let laps = DEFAULT_LAPS
export let currentSessionLap = 0

export function setLaps(newValue: number) {
    laps = newValue
}

export function setCurrentSessionLap(newValue: number) {
    currentSessionLap = Math.max(currentSessionLap, newValue)
}

export function resetCurrentSessionLap() {
    currentSessionLap = 0
}

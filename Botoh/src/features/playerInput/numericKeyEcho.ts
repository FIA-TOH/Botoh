import { onExternalKeyDown } from "./playerInputServer";

/** Converts an internal key name to a ≤2-char avatar string. */
function keyToAvatar(key: string): string {
  // Named keys → short symbol
  const map: Record<string, string> = {
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    " ": "SP",
    enter: "↵",
    backspace: "⌫",
    escape: "⎋",
    shift: "⇧",
    control: "⌃",
    alt: "⌥",
    tab: "⇥",
    delete: "⌦",
    home: "⇱",
    end: "⇲",
    pageup: "⇞",
    pagedown: "⇟",
  };
  const lower = key.toLowerCase();
  if (map[lower]) return map[lower];
  // Single printable character → use as-is (uppercase)
  if (key.length === 1) return key.toUpperCase();
  // Longer names → first 2 chars uppercase
  return key.slice(0, 2).toUpperCase();
}

// Kept function name for compatibility with existing imports in room.ts.
export function NumericKeyEcho(room: RoomObject): void {
  onExternalKeyDown((playerId, key) => {
    const player = room.getPlayer(playerId);
    if (!player) return;
    room.setPlayerAvatar(playerId, keyToAvatar(key));
  });
}

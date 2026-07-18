import { roomPassword } from "../../../roomconfig.json";

function getOptionalEnvValue(name: string) {
  const value = process.env[name]?.trim();

  if (!value || value.startsWith("your-")) {
    return undefined;
  }

  return value;
}

export function getLeagueRoomPassword() {
  return (
    getOptionalEnvValue("LEAGUE_ROOM_PASSWORD") ||
    getOptionalEnvValue("ROOM_PASSWORD") ||
    roomPassword ||
    "ftoh"
  );
}

export function keepLeagueRoomPassword(room: RoomObject) {
  room.setPassword(getLeagueRoomPassword());
}

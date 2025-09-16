import { updatePlayerActivity } from "../afk/afk";

export function PlaerActivity(room: RoomObject) {
  room.onPlayerActivity = function (byPlayer) {
    updatePlayerActivity(byPlayer);
  };
}

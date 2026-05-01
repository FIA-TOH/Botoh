import { updatePlayerActivity } from "../afk/afk";

export function PlayerActivity(room: RoomObject) {
  room.onPlayerActivity = function (byPlayer) {
    updatePlayerActivity(byPlayer, room);
  };
}

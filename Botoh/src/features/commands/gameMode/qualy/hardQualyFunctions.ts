import { playerList } from "../../../changePlayerState/playerList";
import { hasQualyTimeEnded } from "../../../counters/timeOnTheRoomCounter";
import { kickPlayer } from "../../../utils";

export let maxLapsQualy = 3;
export let maxQualyTime = 300; // seconds

export function setMaxLapsQualy(laps: number) {
  maxLapsQualy = laps;
}

export function setMaxQualyTime(time: number) {
  maxQualyTime = time;
}

export function kickIfQualyTimeEnded(
  room: RoomObject,
  player: PlayerObject
): boolean {
  if (player.name === "Admin") {
    return false;
  }

  if (playerList[player.id].didHardQualy === true) {
    playerList[player.id].timeWhenEntered = 0;
    kickPlayer(player.id, "Qualy ended", room);
    return true;
  }

  if (
    !playerList[player.id].timeWhenEntered ||
    playerList[player.id].timeWhenEntered === 0 ||
    playerList[player.id].timeWhenEntered === Infinity
  ) {
    return false;
  }

  if (room.getScores()) {
    const elapsed =
      room.getScores().time - playerList[player.id].timeWhenEntered;

    if (elapsed > maxQualyTime) {
      playerList[player.id].timeWhenEntered = 0;
      kickPlayer(player.id, "Max qualy time", room);
      return true;
    }
  }

  return false;
}

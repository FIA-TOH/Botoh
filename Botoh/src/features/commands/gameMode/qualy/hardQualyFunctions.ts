import { gameMode, GameMode } from "../../../changeGameState/changeGameModes";
import { PlayerInfo, playerList } from "../../../changePlayerState/playerList";
import { sendDiscordGeneralChatQualy } from "../../../discord/discord";
import { kickPlayer } from "../../../utils";
import { getNumberPositionQualy } from "./showPositionQualy";

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
  player: PlayerObject,
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

export function handleHardQualiAttempts(
  room: RoomObject,
  p: PlayerObject,
  lapTime: number,
  playerData: PlayerInfo,
) {
  if (gameMode !== GameMode.HARD_QUALY) return;

  const lapAttempt = playerData.currentLap - 1;
  const pos = getNumberPositionQualy(room, p.id);

  const suffix =
    lapAttempt === 1
      ? "st"
      : lapAttempt === 2
        ? "nd"
        : lapAttempt === 3
          ? "rd"
          : "th";

  sendDiscordGeneralChatQualy(
    `${lapAttempt}${suffix} attemp: ${lapTime}s - P${pos}`,
  );
}

export function handleHardQualyEnd(
  p: PlayerObject,
  room: RoomObject,
  currentLap: number,
): boolean {
  if (gameMode !== GameMode.HARD_QUALY) return false;

  if (currentLap - 1 >= maxLapsQualy) {
    const playerId = p.id;

    setTimeout(() => {
      const stillInRoom = room.getPlayerList().some((pl) => pl.id === playerId);
      if (stillInRoom) {
        kickPlayer(playerId, "Qualy ended", room);
      }
    }, 3000);

    return true;
  }

  return false;
}

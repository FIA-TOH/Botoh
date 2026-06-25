import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { restorePlayerPersistentAvatar } from "../../changePlayerState/handleAvatar";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import {
  hasLeagueScuderia,
  leagueScuderia,
} from "../../scuderias/scuderias";

let teamCommandEnabled = true;

export function setTeamCommandEnabled(enabled: boolean): void {
  teamCommandEnabled = enabled;
}

export function isTeamCommandEnabled(): boolean {
  return teamCommandEnabled;
}

export function clearManualTeamSelections(room: RoomObject): void {
  room.getPlayerList().forEach((roomPlayer) => {
    const player = playerList[roomPlayer.id];
    if (!player?.manualLeagueScuderia) return;

    player.manualLeagueScuderia = null;
    restorePlayerPersistentAvatar(roomPlayer.id, room);
  });
}

export function handleSetScuderia(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!LEAGUE_MODE) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  const value = args[0];
  const player = playerList[byPlayer.id];

  if (!player) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (!value) {
    sendErrorMessage(room, MESSAGES.TEAM_COMMAND_USAGE(), byPlayer.id);
    return;
  }

  if (value.toLowerCase() === "remove") {
    if (!player.manualLeagueScuderia) {
      sendErrorMessage(room, MESSAGES.SCUDERIA_REMOVE_EMPTY(), byPlayer.id);
      return;
    }

    player.manualLeagueScuderia = null;
    restorePlayerPersistentAvatar(byPlayer.id, room);
    sendSuccessMessage(room, MESSAGES.SCUDERIA_REMOVED(), byPlayer.id);
    return;
  }

  if (!teamCommandEnabled) {
    sendErrorMessage(room, MESSAGES.TEAM_COMMAND_DISABLED(), byPlayer.id);
    return;
  }

  if (hasLeagueScuderia(value)) {
    const scuderiaKey = value;
    player.manualLeagueScuderia = scuderiaKey;
    restorePlayerPersistentAvatar(byPlayer.id, room);

    sendSuccessMessage(
      room,
      MESSAGES.SCUDERIA_DEFINED(
        leagueScuderia[scuderiaKey].name.toString(),
        leagueScuderia[scuderiaKey].tag.toString()
      ),
      byPlayer.id
    );

    return;
  }

  const scuderiaEntry = Object.entries(leagueScuderia).find(
    ([, scuderia]) => scuderia.tag.toLowerCase() === value.toLowerCase()
  );

  if (scuderiaEntry) {
    const [scuderiaKey, scuderia] = scuderiaEntry;
    player.manualLeagueScuderia = scuderiaKey;
    restorePlayerPersistentAvatar(byPlayer.id, room);
    sendSuccessMessage(
      room,
      MESSAGES.SCUDERIA_DEFINED(
        scuderia.name.toString(),
        scuderia.tag.toString()
      ),
      byPlayer.id
    );
    return;
  }
  sendErrorMessage(
    room,
    MESSAGES.SCUDERIA_ERROR(value.toString()),
    byPlayer.id
  );
}

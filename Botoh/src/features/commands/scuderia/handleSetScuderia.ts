import { playerList } from "../../changePlayerState/playerList";
import { sendErrorMessage, sendSuccessMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { LEAGUE_MODE } from "../../hostLeague/leagueMode";
import { leagueScuderia } from "../../scuderias/scuderias";

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

  if (!value) {
    room.sendAnnouncement("Error: !team [XX]", byPlayer.id, 0xff0000);
    return;
  }

  if (value in leagueScuderia) {
    const scuderiaKey = value as keyof typeof leagueScuderia;
    player.leagueScuderia = scuderiaKey as string;

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
    player.leagueScuderia = scuderiaKey as string;
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

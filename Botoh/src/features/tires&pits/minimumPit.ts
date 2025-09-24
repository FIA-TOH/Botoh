import { Teams } from "../changeGameState/teams";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";

let minimumPitStops = LEAGUE_MODE ? 0 : 1;

export function defineMinimumPitStops(quantity: number) {
  minimumPitStops = quantity;
}

export function processIfMinimumPitStopsMet(
  player: PlayerObject,
  currentLap: number,
  totalLaps: number,
  pitStops: number,
  room: RoomObject
) {
  const requiredPits = minimumPitStops + 1;
  const remainingLaps = totalLaps - currentLap + 1;

  const missingPits = requiredPits - pitStops;

  if (missingPits <= 0) {
    return;
  }

  if (remainingLaps < missingPits) {
    room.setPlayerTeam(player.id, Teams.SPECTATORS);
    sendAlertMessage(room, MESSAGES.DSQ_MINIMUM_PITS(), player.id);
    return;
  }

  if (remainingLaps === missingPits) {
    setTimeout(() => {
      const scores = room.getScores();
      if (scores && scores.time > 1) {
        handleAvatar(Situacions.NeedPit, player, room);
        sendAlertMessage(room, MESSAGES.NEED_PIT_THIS_LAP(), player.id);
      }
    }, 3000);
  }
}

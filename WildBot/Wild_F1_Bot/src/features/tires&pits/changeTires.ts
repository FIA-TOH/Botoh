import { Teams } from "../changeGameState/teams";
import { handleAvatar } from "../changePlayerState/handleAvatar";
import { playerList } from "../changePlayerState/playerList";
import { sendErrorMessage, sendChatMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { ifInBoxZone } from "./pits";
import { Tires, TIRE_STARTING_SPEED } from "./tires";

export function changeTires(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  chosen: Tires,
  room: RoomObject
) {
  if (player.p.team !== Teams.RUNNERS) {
    sendErrorMessage(room, MESSAGES.NOT_RUNNER(), player.p.id);
    return false;
  }

  if (room.getScores() === null) {
    sendErrorMessage(room, MESSAGES.NOT_STARTED(), player.p.id);
    return false;
  }

  if (
    !ifInBoxZone(player, room) &&
    room.getScores().time > 0 &&
    chosen != Tires.FLAT
  ) {
    sendErrorMessage(room, MESSAGES.NOT_IN_BOXES(), player.p.id);
    return false;
  }

  playerList[player.p.id].wear = 0;
  playerList[player.p.id].alertSent = {};
  playerList[player.p.id].tires = chosen;
  playerList[player.p.id].lapsOnCurrentTire = -1;
  playerList[player.p.id].gripCounter = 0;
  playerList[player.p.id].maxSpeed = TIRE_STARTING_SPEED[chosen];
  sendChatMessage(room, MESSAGES.CHANGED_TIRES(player.p.name, chosen));

  handleAvatar("ChangeTyre", player.p, room);
}

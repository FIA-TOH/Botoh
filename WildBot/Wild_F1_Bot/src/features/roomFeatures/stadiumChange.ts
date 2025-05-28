import { Circuit } from "../../circuits/Circuit";
import { sendErrorMessage } from "../chat/chat";
import { handleChangeMap, CIRCUITS } from "../zones/maps";
import { MESSAGES } from "../chat/messages";
import { Teams } from "../changeGameState/teams";
import { log } from "../discord/logger";

export let ACTUAL_CIRCUIT: Circuit;

export function StadiumChange(room: RoomObject) {
  room.onStadiumChange = function (newStadiumName, byPlayer) {
    if (byPlayer !== null) {
      sendErrorMessage(room, MESSAGES.NO_MANUAL_MAPS(), byPlayer.id);
      handleChangeMap(0, room);
    }
    log(newStadiumName, CIRCUITS);

    let c = CIRCUITS.find((x) => x.info.name == newStadiumName);
    if (c) {
      ACTUAL_CIRCUIT = c;
    }

    log(c);

    if (
      c &&
      c.info.Angle &&
      c.info.AvatarColor !== undefined &&
      c.info.AvatarColor !== 0 &&
      c.info.MainColor
    ) {
      log(c);

      room.setTeamColors(
        Teams.RUNNERS,
        c.info.Angle,
        c.info.AvatarColor,
        c.info.MainColor
      );
    }
  };
}

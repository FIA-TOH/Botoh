import { Circuit } from "../../circuits/Circuit";
import { sendErrorMessage } from "../chat";
import { handleChangeMap, CIRCUITS } from "../maps";
import { MESSAGES } from "../messages";
import { Teams } from "../teams";

export let ACTUAL_CIRCUIT: Circuit;

export function StadiumChange(room: RoomObject) {
  room.onStadiumChange = function (newStadiumName, byPlayer) {
    if (byPlayer !== null) {
      sendErrorMessage(room, MESSAGES.NO_MANUAL_MAPS(), byPlayer.id);
      handleChangeMap(0, room);
    }
    console.log(newStadiumName, CIRCUITS);

    let c = CIRCUITS.find((x) => x.info.name == newStadiumName);
    if (c) {
      ACTUAL_CIRCUIT = c;
    }

    console.log(c);

    if (
      c &&
      c.info.Angle &&
      c.info.AvatarColor !== undefined &&
      c.info.AvatarColor !== 0 &&
      c.info.MainColor
    ) {
      console.log(c);

      room.setTeamColors(
        Teams.RUNNERS,
        c.info.Angle,
        c.info.AvatarColor,
        c.info.MainColor
      );
    }
  };
}

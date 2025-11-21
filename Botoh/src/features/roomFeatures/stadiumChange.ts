import { Circuit } from "../../circuits/Circuit";
import { sendErrorMessage } from "../chat/chat";
import { handleChangeMap, CIRCUITS } from "../zones/maps";
import { MESSAGES } from "../chat/messages";
import { Teams } from "../changeGameState/teams";
import { log } from "../discord/logger";
import { loadCutSegmentsFromCircuit } from "../detectCut/detectCut";

export let ACTUAL_CIRCUIT: Circuit;

export function StadiumChange(room: RoomObject) {
  room.onStadiumChange = function (newStadiumName, byPlayer) {
    if (byPlayer !== null) {
      sendErrorMessage(room, MESSAGES.NO_MANUAL_MAPS(), byPlayer.id);
      handleChangeMap(0, room);
    }
    log("New circuit loaded: ", newStadiumName);

    let c = CIRCUITS.find((x) => x.info.name == newStadiumName);
    if (c) {
      loadCutSegmentsFromCircuit(c);
      ACTUAL_CIRCUIT = c;
    }

    if (
      c &&
      c.info.Angle !== undefined &&
      c.info.AvatarColor !== undefined &&
      c.info.AvatarColor !== 0 &&
      c.info.MainColor
    ) {
      room.setTeamColors(
        Teams.RUNNERS,
        c.info.Angle,
        c.info.AvatarColor,
        c.info.MainColor
      );
    }
  };
}

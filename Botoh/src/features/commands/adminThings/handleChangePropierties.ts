import { sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { leagueScuderia } from "../../scuderias/scuderias";
import { changeConstant, constants } from "../../speed/constants";

export function handleChangePropierties(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  if (!args) {
    room.sendAnnouncement(
      "Correct use: !constants [CONSTANT] [value]",
      byPlayer.id,
      0xff0000
    );
  }
  const key = args[0].toUpperCase() as keyof typeof constants;
  const value = Number(args[1]);

  if (!value || !key) {
    room.sendAnnouncement("Error", byPlayer.id, 0xff0000);
    return;
  }

  if (!(key in constants)) {
    room.sendAnnouncement(`Constant "${args[0]}" not found.`, byPlayer.id);
    return;
  }

  if (isNaN(value)) {
    room.sendAnnouncement(`Second argument needs to be a number`, byPlayer.id);
    return;
  }

  changeConstant(key, value);
  // for (const scudName in leagueScuderia) {
  //   const scud = leagueScuderia[scudName];
  //   if (!scud?.engine) continue;

  //   if (key.startsWith("ASTON_MAIA_ENGINE")) {
  //     scud.engine.initialAccelerationNerf =
  //       constants.ASTON_MAIA_ENGINE_INITIAL_ACCELERATION_BOOST;
  //     scud.engine.medialAccelerationNerf =
  //       constants.ASTON_MAIA_ENGINE_MEDIAL_ACCELERATION_BOOST;
  //     scud.engine.finalAccelerationNerf =
  //       constants.ASTON_MAIA_ENGINE_FINAL_ACCELERATION_BOOST;
  //   } else if (key.startsWith("PENSHIRYU_ENGINE")) {
  //     scud.engine.initialAccelerationNerf =
  //       constants.PENSHIRYU_ENGINE_INITIAL_ACCELERATION_BOOST;
  //     scud.engine.medialAccelerationNerf =
  //       constants.PENSHIRYU_ENGINE_MEDIAL_ACCELERATION_BOOST;
  //     scud.engine.finalAccelerationNerf =
  //       constants.PENSHIRYU_ENGINE_FINAL_ACCELERATION_BOOST;
  //   }
  // }
  room.sendAnnouncement(`${key} changed to: ${value}`, byPlayer.id);
}

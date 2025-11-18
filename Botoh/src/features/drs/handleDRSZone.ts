import { getRunningPlayers, inHitbox } from "../utils";
import { playerList } from "../changePlayerState/playerList";
import { CIRCUITS, currentMapIndex } from "../zones/maps";
import { log } from "../discord/logger";

function ifInDRSStartZone(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    CIRCUITS[currentMapIndex].info.drsStart.some((hitbox) =>
      inHitbox(player, hitbox)
    )
  );
}

function ifInDRSEndZone(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    CIRCUITS[currentMapIndex].info.drsEnd.some((hitbox) =>
      inHitbox(player, hitbox)
    )
  );
}

let startZoneLastTime = 0;

const DRS_DELTA = 1;

export let drsOn = false;

export function enableDRS(room: RoomObject) {
  drsOn = true;
  // sendNonLocalizedSmallChatMessage(room, "DRS ENABLED")
}

export function checkPlayersDRSZone(
  playersAndDiscs: {
    p: PlayerObject;
    disc: DiscPropertiesObject;
  }[],
  room: RoomObject
) {
  getRunningPlayers(playersAndDiscs).forEach((pad) => {
    if (!drsOn) {
      return;
    }

    if (ifInDRSEndZone(pad, room) && playerList[pad.p.id].drs) {
      //EXITING DRS ZONE
      log("Exited DRS ZONE: " + pad.p.name);
      playerList[pad.p.id].drs = false;
    }
    if (ifInDRSStartZone(pad, room) && !playerList[pad.p.id].drs) {
      ///ENTERED DRS ZONE
      log("ENTERED DRS ZONE: " + pad.p.name);
      if (startZoneLastTime < DRS_DELTA) {
        playerList[pad.p.id].drs = true;
      }
      startZoneLastTime = 0;
      return;
    }
  });
  startZoneLastTime += 1 / 60;
}

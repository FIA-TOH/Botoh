import { positionList } from "../changeGameState/race/positionList";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";

import { getRunningPlayers } from "../utils";
import { isFollowPlayerValid } from "./setBallPosition";

export let followPlayerId: number | null = null;
let followPositionIndex: number | null = null;
let mode: "auto" | "position" | "player" = "position";

export function setFollowPlayer(id: number, notChangeMode?: boolean) {
  followPlayerId = id;
  if (!notChangeMode) {
    mode = "player";
  }
}

export function setFollowPosition(index: number) {
  followPositionIndex = index;
  mode = "position";
}

export function setCameraAuto() {
  followPlayerId = null;
  followPositionIndex = null;
  mode = "auto";
}
export function updateFollowPlayerId(room: RoomObject) {
  if (mode === "auto") {
    if (positionList.length > 0) {
      followPlayerId = positionList[0].id;
    } else {
      const playersAndDiscs = getPlayerAndDiscs(room);
      const runningPlayers = getRunningPlayers(playersAndDiscs);
      followPlayerId =
        runningPlayers.length > 0 ? runningPlayers[0].p.id : null;
    }

    if (!isFollowPlayerValid(room, followPlayerId)) {
      followPlayerId = null;
      room.setDiscProperties(0, {
        xspeed: 0,
        yspeed: 0,
        xgravity: 0,
        ygravity: 0,
      });
    }
    return;
  }

  if (mode === "position" && followPositionIndex != null) {
    const index = followPositionIndex - 1;
    if (index >= 0 && positionList[index]) {
      followPlayerId = positionList[index].id;
    } else {
      setCameraAuto();
      updateFollowPlayerId(room);
    }
  }
}

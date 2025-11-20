import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
import { getPlayersOrderedByQualiTime } from "../changeGameState/qualy/playerTime";
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
  const playersAndDiscs = getPlayerAndDiscs(room);
  const runningPlayers = getRunningPlayers(playersAndDiscs);

  if (mode === "auto") {
    let candidateIds: number[] = [];

    if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
      candidateIds = positionList.map((p) => p.id);
    } else if (
      generalGameMode === GeneralGameMode.GENERAL_QUALY ||
      gameMode === GameMode.TRAINING
    ) {
      candidateIds = getPlayersOrderedByQualiTime().map((p) => p.id);
    }

    if (candidateIds.length === 0) {
      candidateIds = runningPlayers.map((rp) => rp.p.id);
    }

    followPlayerId = null;
    for (const id of candidateIds) {
      if (runningPlayers.some((rp) => rp.p.id === id)) {
        followPlayerId = id;
        break;
      }
    }

    if (!followPlayerId) {
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
    let candidateId: number | null = null;

    if (generalGameMode === GeneralGameMode.GENERAL_RACE) {
      if (index >= 0 && positionList[index]) {
        candidateId = positionList[index].id;
      }
    } else if (generalGameMode === GeneralGameMode.GENERAL_QUALY) {
      const orderedList = getPlayersOrderedByQualiTime();
      if (index >= 0 && orderedList[index]) {
        candidateId = orderedList[index].id;
      }
    }

    if (candidateId && runningPlayers.some((rp) => rp.p.id === candidateId)) {
      followPlayerId = candidateId;
    } else {
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

  if (mode === "player") {
    if (!isFollowPlayerValid(room, followPlayerId)) {
      followPlayerId = null;
      room.setDiscProperties(0, {
        xspeed: 0,
        yspeed: 0,
        xgravity: 0,
        ygravity: 0,
      });
    }
  }
}

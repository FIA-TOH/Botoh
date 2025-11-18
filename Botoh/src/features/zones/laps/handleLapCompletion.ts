import {
  generalGameMode,
  GeneralGameMode,
  gameMode,
  GameMode,
} from "../../changeGameState/changeGameModes";
import { updatePositionList } from "../../changeGameState/race/positionList";
import { playerList } from "../../changePlayerState/playerList";
import { checkBlueFlag } from "../handleSectorChange";
import { processCompletedLap } from "./processCompleteLap";
import { resetLapData } from "./resetLapData";

export function handleLapCompletion(
  pad: {
    p: PlayerObject;
    disc: DiscPropertiesObject;
  },
  room: RoomObject,
  hasSector: boolean,
  players: {
    p: PlayerObject;
    disc: DiscPropertiesObject;
  }[]
) {
  const p = pad.p;
  const data = playerList[p.id];

  const currentLap = ++data.currentLap;
  data.lapChanged = true;

  if (currentLap > 1) {
    processCompletedLap(pad, room, hasSector);
  }

  resetLapData(data, p.id, room);

  if (
    generalGameMode !== GeneralGameMode.GENERAL_QUALY &&
    gameMode !== GameMode.TRAINING
  ) {
    updatePositionList(players, room);
    checkBlueFlag(p, room);
  }
}

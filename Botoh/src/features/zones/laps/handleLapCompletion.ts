import {
  generalGameMode,
  GeneralGameMode,
  gameMode,
  GameMode,
} from "../../changeGameState/changeGameModes";
import { playerList } from "../../changePlayerState/playerList";
import { handleBattleRoyaleLap } from "../../commands/gameMode/battleRoyale.ts/handleBattleRoyaleLaps";
import { updatePositionList } from "../../commands/gameMode/race/positionList";
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
  }[],
) {
  const p = pad.p;
  const data = playerList[p.id];

  const currentLap = ++data.currentLap;
  data.lapChanged = true;

  if (currentLap > 1) {
    processCompletedLap(pad, room, hasSector);
  }

  resetLapData(data, p.id, room);

  if (gameMode === GameMode.BATTLE_ROYALE) {
    handleBattleRoyaleLap(p, room);
    return;
  }
  if (
    generalGameMode !== GeneralGameMode.GENERAL_QUALY &&
    gameMode !== GameMode.TRAINING
  ) {
    updatePositionList(players, room);
    checkBlueFlag(p, room);
  }
}

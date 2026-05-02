import { ghostMode } from "../changePlayerState/ghost";
import { playerList } from "../changePlayerState/playerList";
import { resetPlayer } from "../changePlayerState/players";
import { Teams } from "../changeGameState/teams";
import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
import { updatePlayerActivity } from "../afk/afk";
import { followPlayerId } from "../cameraAndBall/cameraFollow";
import { moveToBox } from "../comeBackRace.ts/moveToBox";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { decideBlowoutPoint } from "../tires&pits/tireBlowManager";
import { moveToRRPosition } from "../commands/playerState/handleRRCommand";

export function TeamChange(room: RoomObject) {
  room.onPlayerTeamChange = function (changedPlayer: PlayerObject) {
    const playerObj = playerList[changedPlayer.id];
    
    if (!playerObj?.canRejoin) {
      resetPlayer(changedPlayer, room, changedPlayer.id);
    }
    updatePlayerActivity(changedPlayer);

    if (
      changedPlayer.id === followPlayerId &&
      changedPlayer.team !== Teams.RUNNERS
    ) {
      return;
    }

    if (changedPlayer.team === Teams.RUNNERS && room.getScores()) {
      handleAvatar(Situacions.ChangeTyre, changedPlayer, room);
      decideBlowoutPoint(changedPlayer);
      if (
        room.getScores().time > 0 &&
        gameMode !== GameMode.HARD_QUALY &&
        gameMode !== GameMode.WAITING &&
        !playerObj?.canRejoin 
      ) {
        if (generalGameMode === GeneralGameMode.GENERAL_QUALY && !LEAGUE_MODE) {
          moveToRRPosition(changedPlayer, room);
        } else {
          moveToBox(changedPlayer, room, "end");
        }
      }
    }

    if (ghostMode && changedPlayer.team === Teams.RUNNERS) {
      room.setPlayerDiscProperties(changedPlayer.id, {
        cGroup: room.CollisionFlags.c0 | room.CollisionFlags.redKO,
      });
    }
  };
}

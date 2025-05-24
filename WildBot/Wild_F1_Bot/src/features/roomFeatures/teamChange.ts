import { ghostMode } from "../changePlayerState/ghost";
import { playerList } from "../changePlayerState/playerList";
import { resetPlayer } from "../changePlayerState/players";
import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { Teams } from "../changeGameState/teams";
import { ACTUAL_CIRCUIT } from "./stadiumChange";

export function TeamChange(room: RoomObject) {
  room.onPlayerTeamChange = function (changedPlayer: PlayerObject) {
    resetPlayer(changedPlayer, room, changedPlayer.id);
    if (changedPlayer.team === Teams.RUNNERS && room.getScores()) {
      handleAvatar("ChangeTyre", changedPlayer, room);
      if (room.getScores().time > 0 && gameMode !== GameMode.QUALY) {
        const boxLine = ACTUAL_CIRCUIT.info.boxLine;
        const middleX = (boxLine.minX + boxLine.maxX) / 2;
        const middleY = (boxLine.minY + boxLine.maxY) / 2;
        playerList[changedPlayer.id].inPitlane = true;
        room.setPlayerDiscProperties(changedPlayer.id, {
          x: middleX,
          y: middleY,
        });
      }
    }
    if (ghostMode && changedPlayer.team === Teams.RUNNERS) {
      room.setPlayerDiscProperties(changedPlayer.id, {
        cGroup: room.CollisionFlags.c0 | room.CollisionFlags.redKO,
      });
    }
  };
}
function handleAvatar(
  arg0: string,
  changedPlayer: PlayerObject,
  room: RoomObject
) {
  throw new Error("Function not implemented.");
}

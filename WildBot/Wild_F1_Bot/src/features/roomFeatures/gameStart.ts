import { handleGameStateChange } from "../gameState";
import { finishList, positionList, lapPositions } from "../handleLapChange";
import { laps } from "../laps";
import { resetPlayer } from "../players";
import { resetAllRainEvents } from "../rain";

export function GameStart(room: RoomObject) {
  room.onGameStart = function (byPlayer) {
    byPlayer == null
      ? console.log(`Game started`)
      : console.log(`Game started by ${byPlayer.name}`);
    handleGameStateChange("running");

    resetAllRainEvents();
    room.getPlayerList().forEach((p) => {
      resetPlayer(p, room, p.id, true);
    });
    finishList.splice(0, finishList.length);
    positionList.splice(0, positionList.length);
    for (let i = 0; i < laps; i++) {
      lapPositions[i] = [];
    }
  };
}

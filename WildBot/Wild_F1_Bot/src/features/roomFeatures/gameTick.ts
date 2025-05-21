import { endRaceSession } from "../changeGameState/EndRaceSession";
import { distributeSpeed } from "../distributrSpeed";
import { updateErs } from "../ers";
import { updateGripCounter } from "../grip";
import { presentationLap } from "../handleCommands";
import { checkPlayerLaps } from "../handleLapChange";
import { checkPlayerSector } from "../handleSectorChange";
import { handleSuzukaTp } from "../handleSuzukaTp";
import handleTireWear from "../handleTireWear";
import { handlePitlane } from "../pits";
import { getRunningPlayers } from "../utils";

export function GameTick(room: RoomObject) {
  room.onGameTick = function () {
    const playersAndDiscs = room.getPlayerList().map((p) => ({
      p: p,
      disc: room.getPlayerDiscProperties(p.id),
    }));
    const players = getRunningPlayers(playersAndDiscs);
    handlePitlane(playersAndDiscs, room);
    distributeSpeed(playersAndDiscs, room);
    checkPlayerSector(playersAndDiscs, room);
    checkPlayerLaps(playersAndDiscs, room);
    endRaceSession(playersAndDiscs, room);
    updateGripCounter(playersAndDiscs);
    updateErs(playersAndDiscs, room);
    players.forEach((pad) => {
      const p = pad.p;
      if (!presentationLap) {
        handleTireWear(p, room);
      }
      handleSuzukaTp(pad, room);
    });
    // logPlayerSpeed(playersAndDiscs, room);
    // checkPlayersDRSZone(playersAndDiscs, room);
  };
}

import { endRaceSession } from "../changeGameState/EndRaceSession";
import { distributeSpeed } from "../speed/distributrSpeed";
import { updateErs } from "../speed/fuel&Ers/ers";
import { presentationLap } from "../commands/handleCommands";
import { checkPlayerLaps } from "../zones/handleLapChange";
import { checkPlayerSector } from "../zones/handleSectorChange";

import { handlePitlane } from "../tires&pits/pits";
import { getRunningPlayers } from "../utils";
import { updateGripCounter } from "../speed/grip/grip";
import handleTireWear from "../tires&pits/handleTireWear";
import { handleSuzukaTp } from "../zones/handleSuzukaTp";

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

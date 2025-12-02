import { playerList } from "../changePlayerState/playerList";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import { vsc } from "../safetyCar/vsc";
import { getRunningPlayers } from "../utils";
import { calculateTotalGripMultiplier } from "./grip/calculateTotalGripMultiplier";
import { applyPitAndVscRules } from "./pitAndVscRules";
import { calculateSlipstreamEffect } from "./slipstream/slipstreamUtils";

/**
 * Function that sets a players max speed.
 *
 * Note: This does require a high tick-rate. At least on Chrome, this requires the headless host tab to be visible/selected.
 */
export function controlPlayerSpeed(
  playersAndDiscsSubset: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const currentTime = room.getScores()?.time || 0;

  const playersAndDiscs = getPlayerAndDiscs(room);

  const playersRunning = getRunningPlayers(playersAndDiscs);

  playersAndDiscsSubset.forEach(({ p, disc }) => {
    const playerInfo = playerList[p.id];

    if (playerInfo.inPitStop) {
      room.setPlayerDiscProperties(p.id, {
        xspeed: 0,
        yspeed: 0,
        xgravity: 0,
        ygravity: 0,
      });
      return;
    }

    const slipstreamData = calculateSlipstreamEffect(
      p,
      disc,
      playersRunning,
      currentTime,
      playerInfo,
      vsc
    );

    const gripMultiplier = calculateTotalGripMultiplier(
      p,
      disc,
      playerInfo,
      slipstreamData.effectiveSlipstream,
      currentTime,
      room
    );

    applyPitAndVscRules(
      p,
      disc,
      room,
      gripMultiplier,
      playerInfo,
      currentTime,
      vsc
    );

    playerList[p.id] = playerInfo;
  });
}

// function detectStartJump(
//     p: PlayerObject, disc: DiscPropertiesObject,
//     room: RoomObject
//   ): boolean {
//     const scores = room.getScores();
//     if (!scores) return false;

//     const reactionTimeTooFast = scores.time > 0 && scores.time < 0.05;
//     const playerMoving = disc.xspeed != 0 || disc.yspeed != 0;
//     const playerData = playerList[p.id];

//     if (!playerData) return false;

//     if(reactionTimeTooFast){
//         console.log(disc.xspeed, disc.yspeed);
//     }

//     if(scores.time == 0){
//         room.setPlayerDiscProperties(p.id, {
//             xspeed: 0,
//             yspeed: 0
//         })
//         return false;
//     }
//     if (playerData.penaltyCounter > 0) {
//       playerData.penaltyCounter -= 1;
//       return true;
//     }

//     if (reactionTimeTooFast && playerMoving) {
//       playerData.penaltyCounter = 120;
//       return true;
//     }
//     playerData.penaltyCounter = 0;
//     return false;
//   }

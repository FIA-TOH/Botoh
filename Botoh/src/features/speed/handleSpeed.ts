import { playerList } from "../changePlayerState/playerList";
import { getRunningPlayers } from "../utils";
import { vsc } from "../safetyCar/vsc";
import { calculateTotalGripMultiplier } from "./grip/calculateTotalGripMultiplier";
import { applyPitAndVscRules } from "./pitAndVscRules";
import { calculateSlipstreamEffect } from "./slipstream/slipstreamUtils";

/**
 * Main controller function
 */
export function controlPlayerSpeed(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const currentTime = room.getScores()?.time || 0;

  const playersRunning = getRunningPlayers(playersAndDiscs);

  playersAndDiscs.forEach(({ p, disc }) => {
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
      currentTime
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

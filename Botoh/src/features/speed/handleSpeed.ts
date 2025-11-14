import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { playerList } from "../changePlayerState/playerList";
import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";
import { grip } from "../rain/rainGrip";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { Tires, tyresActivated } from "../tires&pits/tires";
import { getRunningPlayers } from "../utils";
import { constants } from "./constants";
import { applyLateralSlip } from "./damping";
import { calculateGripMultiplierForConditions } from "./grip/multiplierConditions";
import { slipstreamEnabled, calculateSlipstream } from "./handleSlipstream";

export const TIRE_AVATAR: {
  [key in Tires]: string;
} = {
  SOFT: "🔴",
  MEDIUM: "🟡",
  HARD: "⚪",
  INTER: "🟢",
  WET: "🔵",
  FLAT: "⚫",
  TRAIN: "🟣",
};

export let vsc = false;
export function changeVSC() {
  vsc = !vsc;
}

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
    const { xspeed: x, yspeed: y } = disc;
    const norm = Math.hypot(x, y);

    const unitX = norm !== 0 ? x / norm : 0;
    const unitY = norm !== 0 ? y / norm : 0;

    // Slipstream
    let effectiveSlipstream = 0;
    let hasSlipstream = false;

    if (slipstreamEnabled) {
      const slipstream = calculateSlipstream(
        { p, disc },
        playersRunning.filter((other) => other.p.id !== p.id)
      );

      const isInActiveSlipstream =
        slipstream > constants.SLIPSTREAM_RESIDUAL_VALUE &&
        !playerInfo.inPitlane &&
        !vsc;

      if (isInActiveSlipstream) {
        playerInfo.slipstreamEndTime = undefined;
      } else if (playerInfo.slipstreamEndTime === undefined) {
        playerInfo.slipstreamEndTime = currentTime;
      }

      const withinResidualTime =
        playerInfo.slipstreamEndTime !== undefined &&
        currentTime - playerInfo.slipstreamEndTime <=
          constants.RESIDUAL_SLIPSTREAM_TIME;

      effectiveSlipstream = withinResidualTime
        ? constants.SLIPSTREAM_RESIDUAL_VALUE
        : slipstream;
      hasSlipstream = effectiveSlipstream > 0;
    }
    const isUsingErs = disc.damping === 0.986;
    const isUsingErsInco = playerInfo.kers <= 0 && isUsingErs;

    let gripMultiplier = calculateGripMultiplierForConditions(
      p,
      playerInfo.tires,
      playerInfo.wear,
      norm,
      disc,
      effectiveSlipstream,
      isUsingErsInco,
      isUsingErs
    );

    // Situações especiais (pit lane / VSC)
    let gripLimiter = 0;

    if (playerInfo.inPitlane) {
      gripLimiter = ACTUAL_CIRCUIT.info.pitSpeed ?? constants.DEFAULT_PIT_SPEED;
    } else if (vsc) {
      gripLimiter =
        gameMode === GameMode.INDY
          ? constants.SAFETY_CAR_INDY_SPEED
          : constants.SAFETY_CAR_SPEED;
    }

    // Aplicar efeitos
    //Punicao
    if (
      playerInfo.cutPenaltyEndTime &&
      currentTime <= playerInfo.cutPenaltyEndTime
    ) {
      const multiplier =
        playerInfo.cutPenaltyMultiplier ?? constants.PENALTY_SPEED;
      gripMultiplier = (gripMultiplier ?? 1) * multiplier;
    } else {
      playerInfo.cutPenaltyEndTime = undefined;
      playerInfo.cutPenaltyMultiplier = undefined;
    }

    if (gripLimiter > 0) {
      const newGravityX = -x * (1 - gripLimiter);
      const newGravityY = -y * (1 - gripLimiter);

      room.setPlayerDiscProperties(p.id, {
        xgravity: newGravityX,
        ygravity: newGravityY,
      });
    } else if (tyresActivated && gripMultiplier) {
      const newGravityX = -x * (1 - gripMultiplier);
      const newGravityY = -y * (1 - gripMultiplier);

      room.setPlayerDiscProperties(p.id, {
        xgravity: newGravityX,
        ygravity: newGravityY,
      });
    }

    // Atualiza playerInfo no playerList
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

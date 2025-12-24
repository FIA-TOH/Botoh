import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { vectorSpeed } from "../utils";
import { constants } from "./constants";
import { getPlayerSlipstreamBoost } from "./development/chassi";

export let slipstreamEnabled = false;
export let gasEnabled = false;

export function enableSlipstream(boolean: boolean) {
  slipstreamEnabled = boolean;
}
export function enableGas(boolean: boolean) {
  gasEnabled = boolean;
}

function distanceFromPointToLine(
  playerDisc: DiscPropertiesObject,
  otherDisc: DiscPropertiesObject
) {
  const x1 = otherDisc.x;
  const y1 = otherDisc.y;

  const x2 = otherDisc.x + otherDisc.xspeed;
  const y2 = otherDisc.y + otherDisc.yspeed;

  const x3 = playerDisc.x;
  const y3 = playerDisc.y;

  // Calculate the coefficients of the line equation Ax + By + C = 0
  let A = y2 - y1;
  let B = x1 - x2;
  let C = x2 * y1 - x1 * y2;

  // Calculate the distance using the point-line distance formula
  return Math.abs(A * x3 + B * y3 + C) / Math.sqrt(A * A + B * B);
}

export // Function to calculate the slipstream effect
function calculateSlipstream(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  others: {
    p: PlayerObject;
    disc: DiscPropertiesObject;
  }[]
) {
  const disc = player.disc;
  let minSlipstream = 0;

  others.forEach((other) => {
    const otherDisc = other.disc;

    if (!otherDisc || !disc) {
      return;
    }

    const dx = otherDisc.x - disc.x;
    const dy = otherDisc.y - disc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0 && distance <= constants.SLIPSTREAM_ACTIVATION_DISTANCE) {
      const angleToOther = Math.atan2(
        otherDisc.y - disc.y,
        otherDisc.x - disc.x
      );
      const playerDirection = Math.atan2(disc.yspeed, disc.xspeed);
      const otherDirection = Math.atan2(otherDisc.yspeed, otherDisc.xspeed);
      const directionDifference = Math.abs(playerDirection - otherDirection);

      const normalizedDirectionDifference = Math.min(
        directionDifference,
        Math.abs(2 * Math.PI - directionDifference)
      );
      const isInFront = Math.cos(playerDirection - angleToOther) > 0.5;

      if (isInFront && normalizedDirectionDifference < Math.PI / 4) {
        const otherSpeed = vectorSpeed(otherDisc.xspeed, otherDisc.yspeed);
        const proximityFactor =
          1 - distance / constants.SLIPSTREAM_ACTIVATION_DISTANCE; // 0 → 1
        const distanceToLine = distanceFromPointToLine(disc, otherDisc);
        const lateralEffect = Math.max(
          0,
          1 - distanceToLine / constants.SLIPSTREAM_LATERAL_TOLERANCE
        ); // 0 → 1
        const effectModifier = proximityFactor * lateralEffect;

        const slipstreamEffect = otherSpeed * effectModifier;

        if (slipstreamEffect > minSlipstream) {
          minSlipstream = slipstreamEffect;
        }
      }
    }
  });

  const playerMaxSlipstream = getPlayerSlipstreamBoost(player.p);

  const finalSlipstream = Math.min(
    gameMode !== GameMode.INDY ? playerMaxSlipstream : playerMaxSlipstream / 2,
    minSlipstream / 100
  );

  // console.log(`\n Final slipstream to the player ${player.p.id}: ${finalSlipstream.toFixed(5)}\n`);
  return finalSlipstream;
}

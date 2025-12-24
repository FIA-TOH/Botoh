import { PlayerInfo } from "../../changePlayerState/playerList";
import { constants } from "../constants";
import { calculateSlipstream, slipstreamEnabled } from "../handleSlipstream";

export function calculateSlipstreamEffect(
  p: PlayerObject,
  disc: DiscPropertiesObject,
  playersRunning: { p: PlayerObject; disc: DiscPropertiesObject }[],
  currentTime: number,
  playerInfo: PlayerInfo,
  vsc: boolean
) {
  let effectiveSlipstream = 0;

  if (!slipstreamEnabled) {
    return { effectiveSlipstream: 0 };
  }

  const slipstream = calculateSlipstream(
    { p, disc },
    playersRunning.filter((o) => o.p.id !== p.id)
  );

  const isActive =
    slipstream > constants.SLIPSTREAM_RESIDUAL_VALUE &&
    !playerInfo.inPitlane &&
    !vsc;

  if (isActive) {
    playerInfo.slipstreamEndTime = undefined;
  } else if (playerInfo.slipstreamEndTime === undefined) {
    playerInfo.slipstreamEndTime = currentTime;
  }

  const withinResidual =
    playerInfo.slipstreamEndTime !== undefined &&
    currentTime - playerInfo.slipstreamEndTime <=
      constants.RESIDUAL_SLIPSTREAM_TIME;

  effectiveSlipstream = withinResidual
    ? constants.SLIPSTREAM_RESIDUAL_VALUE
    : slipstream;

  playerInfo.finalSlipstream = effectiveSlipstream;

  return { effectiveSlipstream };
}

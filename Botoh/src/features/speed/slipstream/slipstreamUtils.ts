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
  console.log(`Slipstream bruto para ${p.id}:`, slipstream.toFixed(4));

  const isActive =
    slipstream > constants.SLIPSTREAM_RESIDUAL_VALUE &&
    !playerInfo.inPitlane &&
    !vsc;

  if (isActive) {
    playerInfo.slipstreamEndTime = undefined;
  } else if (playerInfo.slipstreamEndTime === undefined) {
    playerInfo.slipstreamEndTime = currentTime;
  }
  console.log(`Slipstream aplicado (${p.id}) =>`, {
    slipstream: slipstream.toFixed(4),
    active: isActive,
    residualWindow:
      playerInfo.slipstreamEndTime !== undefined
        ? (currentTime - playerInfo.slipstreamEndTime).toFixed(2)
        : null,
    effectiveSlipstream: effectiveSlipstream.toFixed(4),
  });
  const withinResidual =
    playerInfo.slipstreamEndTime !== undefined &&
    currentTime - playerInfo.slipstreamEndTime <=
      constants.RESIDUAL_SLIPSTREAM_TIME;

  effectiveSlipstream = withinResidual
    ? constants.SLIPSTREAM_RESIDUAL_VALUE
    : slipstream;

  return { effectiveSlipstream };
}

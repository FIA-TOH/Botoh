import { PlayerInfo } from "../changePlayerState/playerList";

const GT_EXTRA_RESISTANCE = 0.003;

export function getCategoryGravity(
  player: Pick<PlayerInfo, "category">,
  disc: Pick<DiscPropertiesObject, "xspeed" | "yspeed">,
): { x: number; y: number } {
  if (player.category !== "gt") return { x: 0, y: 0 };

  return {
    x: -disc.xspeed * GT_EXTRA_RESISTANCE,
    y: -disc.yspeed * GT_EXTRA_RESISTANCE,
  };
}

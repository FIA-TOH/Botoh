import { PlayerInfo } from "../changePlayerState/playerList";
import { constants } from "./constants";

export function getCategoryGravity(
  player: Pick<PlayerInfo, "category">,
  disc: Pick<DiscPropertiesObject, "xspeed" | "yspeed">,
): { x: number; y: number } {
  if (player.category !== "gt") return { x: 0, y: 0 };

  return {
    x: -disc.xspeed * constants.GT_EXTRA_RESISTANCE,
    y: -disc.yspeed * constants.GT_EXTRA_RESISTANCE,
  };
}

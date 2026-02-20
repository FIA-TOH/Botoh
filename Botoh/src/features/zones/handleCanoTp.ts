import { ghostMode } from "../changePlayerState/ghost";
import { updatePlayerCollision } from "../changePlayerState/updatePlayerCollision";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { inHitbox } from "../utils";

const canoEnteringTunnelHitBox = {
  minX: -1029,
  maxX: -906,
  minY: 260,
  maxY: 292,
};

const canoLeavingTunnelHitBox = {
  minX: -1115,
  maxX: -819,
  minY: 15,
  maxY: 47,
};

const canoEnteringChangeCGroupHitBox = {
  minX: -1062,
  maxX: -820,
  minY: 660,
  maxY: 692,
};

const canoLeavingChangeCGroupHitBox = {
  minX: -1147,
  maxX: -800,
  minY: -70,
  maxY: -38,
};

export function handleChangePlayerSizeCano(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject,
) {
  if (
    room.getScores().time > 0 &&
    ACTUAL_CIRCUIT.info.name === "Circuito Urbano de La Villa Cano - By Ximb"
  ) {
    if (inHitbox(player, canoEnteringTunnelHitBox) && player.disc.radius != 5) {
      room.setPlayerDiscProperties(player.p.id, {
        radius: 5,
      });
    }

    if (inHitbox(player, canoLeavingTunnelHitBox) && player.disc.radius === 5) {
      room.setPlayerDiscProperties(player.p.id, {
        radius: 15,
      });
    }
  }
}

export function handleChangeCollisionPlayerCano(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject,
) {
  if (
    room.getScores().time > 0 &&
    ACTUAL_CIRCUIT.info.name === "Circuito Urbano de La Villa Cano - By Ximb"
  ) {
    if (
      inHitbox(player, canoEnteringChangeCGroupHitBox) &&
      player.disc.radius != 5
    ) {
      updatePlayerCollision(room, [player], room.CollisionFlags.c1);
    }

    if (inHitbox(player, canoLeavingChangeCGroupHitBox)) {
      if (ghostMode) {
        updatePlayerCollision(room, [player], room.CollisionFlags.c0);
      } else {
        updatePlayerCollision(room, [player], room.CollisionFlags.red);
      }
    }
  }
}

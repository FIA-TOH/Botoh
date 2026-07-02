import { applyPlayerCollision } from "../changePlayerState/playerCollision";
import { playerList } from "../changePlayerState/playerList";
import { updatePlayerCollision } from "../changePlayerState/updatePlayerCollision";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { constants } from "../speed/constants";
import { inHitbox } from "../utils";

const suzukaTunnelHitBox = {
  minX: -581,
  maxX: -463,
  minY: 755,
  maxY: 899,
};

const suzukaEnteringTunnelHitBox = {
  minX: -463,
  maxX: -197,
  minY: 900,
  maxY: 932,
};

const suzukaLeavingTunnelHitBox = {
  minX: -1025,
  maxX: -391,
  minY: 723,
  maxY: 755,
};

const suzukaEnteringChangeCGroupHitBox = {
  minX: -362,
  maxX: 89,
  minY: 1023,
  maxY: 1055,
};

const suzukaLeavingChangeCGroupHitBox = {
  minX: -1025,
  maxX: -391,
  minY: 723,
  maxY: 755,
};

export function handleSuzukaTp(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  if (
    room.getScores().time > 0 &&
    ACTUAL_CIRCUIT.info.name === "Suzuka International Circuit - By Ximb" &&
    inHitbox(player, {
      minX: -372,
      maxX: 82,
      minY: 978,
      maxY: 1010,
    })
  ) {
    room.setPlayerDiscProperties(player.p.id, {
      y: 710,
      x: player.p.position.x - 385,
    });
  }
}
export function handleChangePlayerSizeSuzuka(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  if (
    room.getScores().time > 0 &&
    ACTUAL_CIRCUIT.info.name === "Suzuka International Circuit - By Ximb"
  ) {
    if (
      inHitbox(player, suzukaEnteringTunnelHitBox) &&
      player.disc.radius != 5
    ) {
      room.setPlayerDiscProperties(player.p.id, {
        radius: 5,
      });
    }

    if (
      inHitbox(player, suzukaLeavingTunnelHitBox) &&
      player.disc.radius === 5
    ) {
      room.setPlayerDiscProperties(player.p.id, {
        radius: constants.DEFAULT_PLAYER_RADIUS,
      });
    }
  }
}

export function handleChangeCollisionPlayerSuzuka(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  if (
    room.getScores().time > 0 &&
    ACTUAL_CIRCUIT.info.name === "Suzuka International Circuit - By Ximb"
  ) {
    if (
      inHitbox(player, suzukaEnteringChangeCGroupHitBox) &&
      player.disc.radius != 5 &&
      !playerList[player.p.id]?.inPitlane
    ) {
      updatePlayerCollision(room, [player], room.CollisionFlags.c1);
    }

    if (
      inHitbox(player, suzukaLeavingChangeCGroupHitBox) &&
      player.disc.radius === 5
    ) {
      applyPlayerCollision(room, player.p.id);
    }
  }
}

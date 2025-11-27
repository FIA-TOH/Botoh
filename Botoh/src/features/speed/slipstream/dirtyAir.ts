// import { constants } from "../constants";
// import { getCarDirtyAir } from "../development/chassi";

// export function calculateDirtyAir(
//   player: { p: PlayerObject; disc: DiscPropertiesObject },
//   others: { p: PlayerObject; disc: DiscPropertiesObject }[]
// ) {
//   let maxDirtyAir = 0;

//   for (const other of others) {
//     const dx = other.disc.x - player.disc.x;
//     const dy = other.disc.y - player.disc.y;

//     const dist = Math.sqrt(dx * dx + dy * dy);

//     const isAhead = Math.abs(dx) < 200 && dy < 0;

//     if (!isAhead) continue;

//     if (dist <= constants.DIRTY_AIR_DISTANCE) continue;

//     const falloff = Math.max(0, dist - constants.DIRTY_AIR_DISTANCE) / 200;
//     const scaling = Math.min(1, falloff);

//     const generated = getCarDirtyAir(other.p);

//     const applied = generated * scaling;

//     maxDirtyAir = Math.max(maxDirtyAir, applied);
//   }

//   return Math.min(maxDirtyAir, constants.MAX_DIRTY_AIR);
// }

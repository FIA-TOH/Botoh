import { playerList } from "../changePlayerState/playerList";
import { changeTires } from "./changeTires";
import { Tires } from "./tires";
import { emitPitMessage } from "./pitMessaging";

export function performPitStop(
  room: RoomObject,
  byPlayer: PlayerObject,
  tiresKey: Tires,
  disc: DiscPropertiesObject
) {
  changeTires({ p: byPlayer, disc }, tiresKey, room);

  const playerState = playerList[byPlayer.id];
  playerState.tires = tiresKey;
  playerState.kers = Math.min(playerState.kers + 20, 100);
  playerState.pits.pit.push({
    tyre: tiresKey,
    lap: playerState.currentLap,
  });

  delete playerState.pitTargetTires;
  delete playerState.pitInitialPos;
  delete playerState.pitSteps;
  playerState.inPitStop = false;
}
export function detectPitPerTick(
  pad: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  const state = playerList[pad.p.id];
  if (!state.inPitStop || !state.pitCountdown || !state.pitInitialPos) return;

  const disc = room.getPlayerDiscProperties(pad.p.id);
  if (!disc) return;

  if (
    Math.hypot(disc.x - state.pitInitialPos.x, disc.y - state.pitInitialPos.y) >
    0.3
  ) {
    state.pitCountdown = state.pitFailures?.totalTime;
    delete state.pitTargetTires;
    delete state.pitInitialPos;
    delete state.pitSteps;
    state.inPitStop = false;
    room.sendAnnouncement("Ação de pit cancelada por movimento!", pad.p.id);
    return;
  }

  state.pitCountdown -= 1 / 60;

  const EPS = 1e-4;
  while (state.pitSteps && state.pitSteps.length > 0) {
    const next = state.pitSteps[0];
    if (state.pitCountdown <= next.threshold + EPS) {
      emitPitMessage(room, next.kind, next.statuses, pad.p.id);
      state.pitSteps.shift();

      if (next.kind === "success" && state.pitTargetTires) {
        performPitStop(room, pad.p, state.pitTargetTires, disc);
      }
    } else {
      break;
    }
  }
}

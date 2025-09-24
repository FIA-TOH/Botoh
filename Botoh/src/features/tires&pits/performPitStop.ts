import { playerList } from "../changePlayerState/playerList";
import { changeTires } from "./changeTires";
import { Tires } from "./tires";
import { emitPitMessage } from "./pitMessaging";
import { sendAlertMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";

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

  const pitTime = playerState.pitFailures?.totalTime ?? 0;
  const currentLap = playerState.currentLap;

  const existingPitIndex = playerState.pits.pit.findIndex(
    (p) => p.lap === currentLap
  );

  if (existingPitIndex !== -1) {
    playerState.pits.pit[existingPitIndex] = {
      tyre: tiresKey,
      lap: currentLap,
      time: pitTime,
    };
  } else {
    playerState.pits.pit.push({
      tyre: tiresKey,
      lap: currentLap,
      time: pitTime,
    });
    playerState.pits.pitsNumber++;
  }

  delete playerState.pitTargetTires;
  delete playerState.pitInitialPos;
  delete playerState.pitSteps;
  playerState.inPitStop = false;
  handleAvatar(Situacions.Correct, byPlayer, room);
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
    sendAlertMessage(room, MESSAGES.CANCELED_CHANGE_TYRES(), pad.p.id);
    return;
  }

  state.pitCountdown -= 1 / 60;

  const EPS = 1e-4;
  while (state.pitSteps && state.pitSteps.length > 0) {
    const next = state.pitSteps[0];
    if (state.pitCountdown <= next.threshold + EPS) {
      emitPitMessage(room, next.kind, next.statuses, pad.p);
      state.pitSteps.shift();

      if (next.kind === "success" && state.pitTargetTires) {
        performPitStop(room, pad.p, state.pitTargetTires, disc);
      }
    } else {
      break;
    }
  }
}

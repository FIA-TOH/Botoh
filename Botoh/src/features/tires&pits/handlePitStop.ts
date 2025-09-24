// tires&pits/handlePitStop.ts
import { playerList } from "../changePlayerState/playerList";
import { sendAlertMessage, sendSmallChatMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { performPitStop } from "./performPitStop";
import { Tires } from "./tires";
import { buildPitSteps, emitPitMessage } from "./pitMessaging";

export function handlePitStop(
  room: RoomObject,
  byPlayer: PlayerObject,
  tiresKey: Tires
) {
  const state = playerList[byPlayer.id];

  state.inPitStop = true;

  const currentDisc = room.getPlayerDiscProperties(byPlayer.id);
  if (!currentDisc) return;

  if (room.getScores()?.time === 0 || state.pitFailures === undefined) {
    performPitStop(room, byPlayer, tiresKey, currentDisc);
    return;
  }

  room.setPlayerDiscProperties(byPlayer.id, {
    xspeed: 0,
    yspeed: 0,
    xgravity: 0,
    ygravity: 0,
  });

  state.pitTargetTires = tiresKey;
  state.pitInitialPos = { x: byPlayer.position.x, y: byPlayer.position.y };

  const total = state.pitFailures?.totalTime ?? 0;
  state.pitCountdown = total;

  state.pitSteps = buildPitSteps(state.pitFailures);

  emitPitMessage(room, "changing", ["🟨", "⬜", "⬜", "⬜"], byPlayer);
}

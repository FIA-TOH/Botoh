import {
  sendErrorMessage,
  sendAlertMessage,
  sendChatMessage,
} from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export let BALL_ATTRACTION_TO_PLAYER: number = 0.5;
export let BALL_MAX_SPEED: number = 15;
export let DEAD_ZONE_BALL: number = 5;

export function handleCameraProperties(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }
  if (room.getScores() === null) {
    sendChatMessage(room, MESSAGES.NO_WAIT_TIME(), byPlayer.id);
    return false;
  }

  const propertie = args[0];
  const numberPropertie = args[1];

  if (
    args.length === 0 ||
    (propertie !== "attraction" &&
      propertie !== "maxspeed" &&
      propertie !== "deadzone") ||
    isNaN(Number(numberPropertie))
  ) {
    if (byPlayer) {
      room.sendAnnouncement(
        "Correct use: !camera_properties [attraction|maxspeed|deadzone] [number]",
        byPlayer.id
      );
    }
    return;
  }

  if (propertie === "attraction") {
    BALL_ATTRACTION_TO_PLAYER = Number(numberPropertie);
  } else if (propertie === "maxspeed") {
    BALL_MAX_SPEED = Number(numberPropertie);
  } else {
    DEAD_ZONE_BALL = Number(numberPropertie);
  }
  room.sendAnnouncement(
    `Camera now have the proprietie ${propertie} at ${numberPropertie})`,
    byPlayer.id
  );
}

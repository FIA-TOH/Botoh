import { sendErrorMessage, sendChatMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";

export function handleTpCommand(
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

  // Verificar se os argumentos necessários foram fornecidos
  if (args.length < 2) {
    room.sendAnnouncement("Correct use: !tp [X] [Y]", byPlayer.id, 0xff0000);
    return false;
  }

  const xPosition = args[0];
  const yPosition = args[1];
  const integerPattern = /^-?\d+$/;

  // Função para validar entradas
  const validatePosition = (pos: string, axis: string) => {
    if (!integerPattern.test(pos)) {
      const errorMessage =
        pos.includes(",") || pos.includes(".")
          ? `${axis} cannot contain comma or period.`
          : `${axis} must be an positve or negative integer, or zero.`;

      room.sendAnnouncement(`Warning: ${errorMessage}`, byPlayer.id, 0xff0000);
      return false;
    }
    return true;
  };

  // Validar X e Y
  const isXValid = validatePosition(xPosition, "xPosition");
  const isYValid = validatePosition(yPosition, "yPosition");

  if (!isXValid || !isYValid) {
    return false;
  }

  const xPos = parseInt(xPosition, 10);
  const yPos = parseInt(yPosition, 10);

  if (byPlayer.position) {
    const newX = byPlayer.position.x + xPos;
    const newY = byPlayer.position.y + yPos;

    room.sendAnnouncement(
      `Teleported to (${newX}, ${newY}).`,
      byPlayer.id,
      0xffff00
    );

    room.setPlayerDiscProperties(byPlayer.id, {
      x: newX,
      y: newY,
    });
  } else {
    room.sendAnnouncement(
      "Error: It wasn't possible to obtain the position of the player.",
      byPlayer.id,
      0xff0000
    );
  }

  return false;
}

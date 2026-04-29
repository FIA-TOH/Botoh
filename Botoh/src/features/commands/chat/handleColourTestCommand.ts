import {
  sendNonLocalizedSmallChatMessage,
} from "../../chat/chat";

export function handleColourTestCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (args.length === 0) {
    sendNonLocalizedSmallChatMessage(room, "Use: !colour_test 0xFFFF00 (hex color code)");
    return;
  }

  const colorCode = args[0];
  
  // Validate hex color format
  if (!/^0x[0-9A-Fa-f]{6}$/.test(colorCode)) {
    sendNonLocalizedSmallChatMessage(room, "Invalid format! Use: !colour_test 0xFFFF00");
    return;
  }

  // Convert hex to decimal
  const colorDecimal = parseInt(colorCode, 16);
  
  // Send test message with the specified color
  room.sendAnnouncement(
    `Testando cor ${colorCode} - This message should appear in the specified color!`,
    undefined,
    colorDecimal,
    "normal",
    undefined
  );
  
  // Also send the decimal value for reference
  sendNonLocalizedSmallChatMessage(room, `Decimal value: ${colorDecimal}`);
}

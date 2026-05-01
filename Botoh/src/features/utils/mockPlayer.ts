/**
 * Mock player object for bot-initiated commands
 * Used when a command needs a PlayerObject but was triggered by the bot itself
 */

export const BOT_PLAYER: PlayerObject = {
  id: 99999,
  name: "Botoh",
  auth: "bot-system",
  team: 0, // Usually Teams.SPECTATORS or Teams.OUTSIDE
  admin: true,
  position: { x: 0, y: 0 },
  conn: "bot-connection"
};

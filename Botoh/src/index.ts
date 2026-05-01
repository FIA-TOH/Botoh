import * as dotenv from 'dotenv';
import { LEAGUE_MODE } from "./features/hostLeague/leagueMode";
import { roomPromise } from "./room";

// Load environment variables from .env file
dotenv.config({ path: '../.env' });

process.on("beforeExit", (code) => {
  console.error("⚠️ beforeExit with code:", code);
});

process.on("SIGINT", () => {
  console.error("⛔ Received SIGINT (Ctrl+C)");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("⛔ Received SIGTERM");
  process.exit(0);
});

async function main() {
  console.log(`Mode: ${LEAGUE_MODE ? "League" : "Public"}`);

  const room = await roomPromise;
  console.log(`✅ Room created`);
}

main().catch((err) => {
  console.error("Error on start the bot:", err);
});

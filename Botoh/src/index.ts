import { LEAGUE_MODE } from "./features/hostLeague/leagueMode";
import { roomPromise } from "./room";

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
  console.log(`Modo: ${LEAGUE_MODE ? "League" : "Public"}`);

  const room = await roomPromise;
  console.log(`✅ Sala criada`);
}

main().catch((err) => {
  console.error("Erro ao iniciar o bot:", err);
});

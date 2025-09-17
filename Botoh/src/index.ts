import { roomPromise } from "./room";

async function main() {
  const isLeagueMode = process.argv.includes("--league");
  console.log(`Modo: ${isLeagueMode ? "League" : "Public"}`);

  process.env.LEAGUE_MODE = isLeagueMode ? "true" : "false";

  const room = await roomPromise;
  console.log(`✅ Sala criada`);
}

main().catch((err) => {
  console.error("Erro ao iniciar o bot:", err);
});

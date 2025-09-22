import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import { LEAGUE_MODE } from "./features/hostLeague/leagueMode";
import { roomPromise } from "./room";

async function main() {
  console.log(`Modo: ${LEAGUE_MODE ? "League" : "Public"}`);

  const room = await roomPromise;
  console.log(`✅ Sala criada`);
}

main().catch((err) => {
  console.error("Erro ao iniciar o bot:", err);
});

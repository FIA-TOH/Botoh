import * as dotenv from "dotenv";

const envPaths = [".env", "Botoh/.env", "../.env", "../../.env"];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

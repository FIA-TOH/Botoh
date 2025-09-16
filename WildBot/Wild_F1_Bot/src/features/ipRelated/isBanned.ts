import { sha256 } from "js-sha256";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { bans } from "../../../roomconfig.json";

const BAN_LIST = bans;

export function isBanned(ip: string): boolean {
  const comparableIp = LEAGUE_MODE ? sha256(ip) : ip;
  return BAN_LIST.includes(comparableIp);
}

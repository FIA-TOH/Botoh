import { leagueScuderia } from "../../scuderias/scuderias";

type UpgradeCategory =
  | "engine"
  | "chassis"
  | "batery"
  | "suspension"
  | "pitCrew";

// Normaliza string: remove acentos, símbolos e deixa lowercase
function normalizeKey(str: string) {
  return str.normalize("NFKD").replace(/[^\w]/g, "").toLowerCase();
}

// Mapeia categorias possíveis: normalizado → original
const CATEGORY_MAP: Record<string, UpgradeCategory> = {
  engine: "engine",
  chassis: "chassis",
  batery: "batery",
  suspension: "suspension",
  pitcrew: "pitCrew",
};

export function handleUpgradeCommand(
  byPlayer: PlayerObject,
  args: string[],
  room: RoomObject
) {
  if (!byPlayer.admin) {
    room.sendAnnouncement("You are not admin.", byPlayer.id, 0xff0000);
    return;
  }

  if (args.length < 4) {
    room.sendAnnouncement(
      "Use: !upgrade <Team> <Category> <Property> <Value>",
      byPlayer.id,
      0xff0000
    );
    return;
  }

  const [teamName, category, property, rawValue] = args;
  const value = Number(rawValue);

  if (isNaN(value)) {
    room.sendAnnouncement("Value must be a number.", byPlayer.id, 0xff0000);
    return;
  }

  // --------------------------------------------------
  // 🔥 NORMALIZA TEAM
  // --------------------------------------------------
  const normTeam = normalizeKey(teamName);

  const foundTeamKey = Object.keys(leagueScuderia).find(
    (k) => normalizeKey(k) === normTeam
  );

  const team = foundTeamKey ? leagueScuderia[foundTeamKey] : null;

  if (!team) {
    room.sendAnnouncement(
      `Team "${teamName}" does not exist.`,
      byPlayer.id,
      0xff0000
    );
    return;
  }

  // --------------------------------------------------
  // 🔥 NORMALIZA CATEGORY
  // --------------------------------------------------
  const normCategory = normalizeKey(category);

  if (!(normCategory in CATEGORY_MAP)) {
    room.sendAnnouncement(
      `Category "${category}" is not upgradeable.`,
      byPlayer.id,
      0xff0000
    );
    return;
  }

  const catKey = CATEGORY_MAP[normCategory];
  const target = team[catKey];

  if (!target) {
    room.sendAnnouncement(
      `Category "${category}" is missing on team ${teamName}.`,
      byPlayer.id,
      0xff0000
    );
    return;
  }

  // --------------------------------------------------
  // 🔥 NORMALIZA PROPERTY
  // --------------------------------------------------
  const normProperty = normalizeKey(property);

  const foundPropKey = Object.keys(target).find(
    (p) => normalizeKey(p) === normProperty
  );

  if (!foundPropKey) {
    room.sendAnnouncement(
      `Property "${property}" does not exist in category "${catKey}".`,
      byPlayer.id,
      0xff0000
    );
    return;
  }

  // --------------------------------------------------
  // ✔ Atribui valor
  // --------------------------------------------------
  (target as any)[foundPropKey] = value;

  room.sendAnnouncement(
    `Updated ${foundTeamKey}.${catKey}.${foundPropKey} → ${value}`,
    byPlayer.id,
    0x00ff00
  );
}
//!upgrade astonmaia chassis accelerationNerf 1000

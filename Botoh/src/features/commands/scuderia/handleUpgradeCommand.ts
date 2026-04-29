import { COLORS, sendErrorMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { leagueScuderia } from "../../scuderias/scuderias";

type UpgradeCategory =
  | "engine"
  | "chassis"
  | "batery"
  | "suspension"
  | "pitCrew";

function normalizeKey(str: string) {
  return str.normalize("NFKD").replace(/[^\w]/g, "").toLowerCase();
}

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
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  if (args.length < 4) {
    room.sendAnnouncement(
      "Use: !upgrade <Team> <Category> <Property> <Value>",
      byPlayer.id,
      COLORS.YELLOW
    );
    return;
  }

  const [teamName, category, property, rawValue] = args;
  const value = Number(rawValue);

  if (isNaN(value)) {
    room.sendAnnouncement("Value must be a number.", byPlayer.id, COLORS.RED);
    return;
  }

  const normTeam = normalizeKey(teamName);

  const foundTeamKey = Object.keys(leagueScuderia).find(
    (k) => normalizeKey(k) === normTeam
  );

  const team = foundTeamKey ? leagueScuderia[foundTeamKey] : null;

  if (!team) {
    room.sendAnnouncement(
      `Team "${teamName}" does not exist.`,
      byPlayer.id,
      COLORS.RED
    );
    return;
  }

  const normCategory = normalizeKey(category);

  if (!(normCategory in CATEGORY_MAP)) {
    room.sendAnnouncement(
      `Category "${category}" is not upgradeable.`,
      byPlayer.id,
      COLORS.RED
    );
    return;
  }

  const catKey = CATEGORY_MAP[normCategory];
  const target = team[catKey];

  if (!target) {
    room.sendAnnouncement(
      `Category "${category}" is missing on team ${teamName}.`,
      byPlayer.id,
      COLORS.RED
    );
    return;
  }

  const normProperty = normalizeKey(property);

  const foundPropKey = Object.keys(target).find(
    (p) => normalizeKey(p) === normProperty
  );

  if (!foundPropKey) {
    room.sendAnnouncement(
      `Property "${property}" does not exist in category "${catKey}".`,
      byPlayer.id,
      COLORS.RED
    );
    return;
  }

  (target as any)[foundPropKey] = value;

  room.sendAnnouncement(
    `Updated ${foundTeamKey}.${catKey}.${foundPropKey} → ${value}`,
    byPlayer.id,
    COLORS.GREEN
  );
}
//!upgrade astonmaia chassis accelerationNerf 0
//!upgrade astonmaia chassis slipstreamNerf 20
//!upgrade penshiryu engine medialAccelerationNerf 200
//!upgrade astonmaia engine initialAccelerationNerf 700
//!upgrade astonmaia engine finalAccelerationNerf 0
//!upgrade astonmaia engine topSpeedBoostNerf 10

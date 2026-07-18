import { sendDiscordPublicHostAnnouncement } from "../discord/discord";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";

const ANNOUNCEMENT_PLAYER_STEP = 5;

let publicRoomLink: string | null = null;
let lowestPlayerCountSinceLastAnnouncement = 0;

export function setPublicHostAnnouncementRoomLink(roomLink: string) {
  publicRoomLink = roomLink;
}

export function trackPublicHostPlayerCount(room: RoomObject) {
  if (LEAGUE_MODE) return;

  const playerCount = room.getPlayerList().length;

  if (playerCount < lowestPlayerCountSinceLastAnnouncement) {
    lowestPlayerCountSinceLastAnnouncement = playerCount;
    return;
  }

  if (playerCount - lowestPlayerCountSinceLastAnnouncement < ANNOUNCEMENT_PLAYER_STEP) {
    return;
  }

  if (!publicRoomLink) {
    lowestPlayerCountSinceLastAnnouncement = playerCount;
    return;
  }

  sendDiscordPublicHostAnnouncement(playerCount, publicRoomLink);
  lowestPlayerCountSinceLastAnnouncement = playerCount;
}

import HaxballJS from "haxball.js";
import { handleChangeMap } from "./features/zones/maps";
import roomConfig from "../roomconfig.json";
import {
  leagueName,
  maxPlayers,
  publicName,
  haxbulaLeagueName,
  haxbulaPublicName,
} from "../roomconfig.json";
import { LEAGUE_MODE } from "./features/hostLeague/leagueMode";
import { handleGameStateChange } from "./features/changeGameState/gameState";
import sendDiscordLink from "./features/discord/sendDiscordLink";
import { PlayerJoin } from "./features/roomFeatures/playerJoin";
import { TeamChange } from "./features/roomFeatures/teamChange";
import { GameTick } from "./features/roomFeatures/gameTick";
import { GameStart } from "./features/roomFeatures/gameStart";
import { PlayerLeave } from "./features/roomFeatures/playerLeave";
import { StadiumChange } from "./features/roomFeatures/stadiumChange";
import { PlayerChat } from "./features/roomFeatures/playerChat";
import { GameStop } from "./features/roomFeatures/gameStop";
import { PlayerActivity } from "./features/roomFeatures/playerActivitie";
import { resetAllAfkCounters } from "./features/afk/afk";
import { log } from "./features/discord/logger";
import { applyFTOHPublicConfig } from "./features/commands/adminThings/handleConfigCommand";
import { BOT_PLAYER } from "./features/utils/mockPlayer";
import { emitPitWallRoomOpened } from "./features/integrations/pitWallSync";
import { setPublicHostAnnouncementRoomLink } from "./features/public/publicHostAnnouncement";
import { getLeagueRoomPassword } from "./features/hostLeague/leagueRoomPassword";

function getOptionalEnvValue(name: string) {
  const value = process.env[name]?.trim();

  if (!value || value.startsWith("your-")) {
    return undefined;
  }

  return value;
}

const getRoomConfig = () => ({
  publicAdminPassword: process.env.PUBLIC_ADMIN_PASSWORD || roomConfig.publicAdminPassword,
  publicModPassword: process.env.PUBLIC_MOD_PASSWORD || roomConfig.publicModPassword,
  leagueAdminPassword: process.env.LEAGUE_ADMIN_PASSWORD || roomConfig.leagueAdminPassword,
  bans: process.env.BANNED_IPS ? JSON.parse(process.env.BANNED_IPS) : roomConfig.bans,
  token: getOptionalEnvValue("HAXBALL_TOKEN") || roomConfig.token
});

const roomConfigSecure = getRoomConfig();

const envName = process.env.LEAGUE_ENV || "ftoh";
const roomName = LEAGUE_MODE
  ? envName === "haxbula"
    ? haxbulaLeagueName
    : leagueName
  : envName === "haxbula"
    ? haxbulaPublicName
    : publicName;
const publicMaxPlayers = 20;
const roomMaxPlayers = LEAGUE_MODE ? maxPlayers : publicMaxPlayers;
const activeRoomPassword = LEAGUE_MODE ? getLeagueRoomPassword() : undefined;

function getGeo() {
  const geoEnv = process.env.HAXBALL_GEO;
  if (!geoEnv) {
    return {
      code: "BR",
      lat: -23.5505,
      lon: -46.6333,
    };
  }

  const [code, lat, lon] = geoEnv.split(",");
  return {
    code: code || "BR",
    lat: parseFloat(lat) || -23.5505,
    lon: parseFloat(lon) || -46.6333,
  };
}

export const roomPromise: Promise<any> = HaxballJS().then((HBInit: any) => {
  const room = HBInit({
    roomName: roomName,
    noPlayer: true,
    public: true,
    maxPlayers: roomMaxPlayers,
    password: activeRoomPassword,
    token:
      roomConfigSecure.token,
    geo: getGeo(),
  });

  room.onRoomLink = function (link: any) {
    if (!LEAGUE_MODE) {
      applyFTOHPublicConfig(room, BOT_PLAYER);
      setPublicHostAnnouncementRoomLink(link);
    }
    emitPitWallRoomOpened({
      roomName,
      roomLink: link,
      leagueMode: LEAGUE_MODE,
      envName,
      maxPlayers: roomMaxPlayers,
      public: true,
    });
    console.log("\u{1F3C1} Room link:", link);
  };

  room.setScoreLimit(0);
  room.setTimeLimit(0);
  room.setTeamsLock(true);

  GameStart(room);
  GameStop(room);
  GameTick(room);
  PlayerChat(room);
  PlayerJoin(room);
  PlayerLeave(room);
  StadiumChange(room);
  TeamChange(room);
  PlayerActivity(room);

  handleChangeMap(0, room);

  sendDiscordLink(room, 3);

  room.onGamePause = function (byPlayer: any) {
    byPlayer == null
      ? log(`Game paused`)
      : log(`Game paused by ${byPlayer.name}`);
    
    handleGameStateChange("paused", room);
  };
  room.onGameUnpause = function (byPlayer: any) {
    byPlayer == null
      ? log(`Game unpaused`)
      : log(`Game unpaused by ${byPlayer.name}`);
    resetAllAfkCounters(room);
    
    handleGameStateChange("running", room);
  };

  return room;
});

export async function getRoom() {
  return await roomPromise;
}

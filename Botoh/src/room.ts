import HaxballJS from "haxball.js";
import { handleChangeMap } from "./features/zones/maps";
import {
  leagueName,
  maxPlayers,
  publicName,
  roomPassword,
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
import { PlaerActivity } from "./features/roomFeatures/playerActivitie";
import { log } from "./features/discord/logger";

const envName = process.env.LEAGUE_ENV || "ftoh";
const roomName = LEAGUE_MODE
  ? envName === "haxbula"
    ? haxbulaLeagueName
    : leagueName
  : envName === "haxbula"
  ? haxbulaPublicName
  : publicName;

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
    public: !LEAGUE_MODE,
    maxPlayers: maxPlayers,
    password: roomPassword ?? undefined,
    token:
      process.env.HAXBALL_TOKEN ?? "thr1.AAAAAGkNGQGk412CxlUQjA.530e7siVPkY",
    geo: getGeo(),
  });

  room.setScoreLimit(0);
  room.setTimeLimit(0);
  room.setTeamsLock(true);
  handleChangeMap(0, room);

  sendDiscordLink(room, 3);

  GameStart(room);
  GameStop(room);
  GameTick(room);
  PlayerChat(room);
  PlayerJoin(room);
  PlayerLeave(room);
  StadiumChange(room);
  TeamChange(room);
  PlaerActivity(room);

  room.onRoomLink = function (link: any) {
    console.log("Link da sala:", link);
  };

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
    handleGameStateChange("running", room);
  };

  return room;
});

export async function getRoom() {
  return await roomPromise;
}

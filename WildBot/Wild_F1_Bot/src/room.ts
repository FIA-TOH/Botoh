import { handleChangeMap } from "./features/zones/maps";
import {
  leagueName,
  maxPlayers,
  publicName,
  roomPassword,
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

const roomName = LEAGUE_MODE ? leagueName : publicName;

export const room = HBInit({
  roomName: roomName,
  noPlayer: true,
  public: !LEAGUE_MODE,
  maxPlayers: maxPlayers,
  password: roomPassword ?? undefined,
  token: "thr1.AAAAAGdDS0jEIWnS04qeVA.1F4ha2154X8",
  geo: {
    code: "AR",
    lat: -34.603722,
    lon: -58.381592,
  },
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

room.onGamePause = function () {
  handleGameStateChange("paused", room);
};
room.onGameUnpause = function () {
  handleGameStateChange("running", room);
};

const regexPattern = /^\[[A-Z]{2}] \S.*$/;
// if (LEAGUE_MODE && !regexPattern.test(player.name)) {
//     kickPlayer(player.id, `Your name must be in the format "[XX] Name"`, room)
//     return
// }

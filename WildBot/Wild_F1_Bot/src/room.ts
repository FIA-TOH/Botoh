import { handleChangeMap } from "./features/maps";
import {
  leagueName,
  maxPlayers,
  publicName,
  roomPassword,
} from "../roomconfig.json";
import { LEAGUE_MODE } from "./features/leagueMode";
import { handleGameStateChange } from "./features/gameState";
import sendDiscordLink from "./features/pubHost/sendDiscordLink";
import { PlayerJoin } from "./features/roomFeatures/playerJoin";
import { TeamChange } from "./features/roomFeatures/teamChange";
import { GameTick } from "./features/roomFeatures/gameTick";
import { GameStart } from "./features/roomFeatures/gameStart";
import { PlayerLeave } from "./features/roomFeatures/playerLeave";
import { StadiumChange } from "./features/roomFeatures/stadiumChange";
import { PlayerChat } from "./features/roomFeatures/playerChat";

const roomName = LEAGUE_MODE ? leagueName : publicName;

export const room = HBInit({
  roomName: roomName,
  noPlayer: true,
  public: !LEAGUE_MODE,
  maxPlayers: maxPlayers,
  password: roomPassword ?? undefined,
  token: "thr1.AAAAAGdDS0jEIWnS04qeVA.1F4ha2154X8",
  geo: {
    code: "BR",
    lat: -23.55052,
    lon: -46.633308,
  },
});

room.setScoreLimit(0);
room.setTimeLimit(0);
room.setTeamsLock(true);
handleChangeMap(0, room);

sendDiscordLink(room, 3);

GameTick(room);
PlayerJoin(room);
GameStart(room);
TeamChange(room);
StadiumChange(room);
PlayerLeave(room);
PlayerChat(room);

room.onGamePause = function () {
  handleGameStateChange("paused");
};
room.onGameUnpause = function () {
  handleGameStateChange("running");
};

const regexPattern = /^\[[A-Z]{2}] \S.*$/;
// if (LEAGUE_MODE && !regexPattern.test(player.name)) {
//     kickPlayer(player.id, `Your name must be in the format "[XX] Name"`, room)
//     return
// }

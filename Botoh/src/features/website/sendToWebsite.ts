import {
  getEffectiveLeagueScuderiaId,
  playerList,
} from "../changePlayerState/playerList";
import { getLeagueScuderia } from "../scuderias/scuderias";
import type { LocalizedMessageFunction } from "../chat/messages";

export interface WebsiteChatMessage {
  player: string;
  message: string;
  timestamp: number;
  color: number | null;
  source: "player" | "system" | "frontend";
  channel?: "all" | "team" | "player";
  sender?: WebsiteChatParticipant;
  target?: WebsiteChatTarget;
  recipients?: WebsiteChatParticipant[];
}

export interface WebsiteLogMessage {
  message: string | LocalizedMessageFunction;
  timestamp: number;
  color: number | null;
}

export interface WebsiteChatParticipant {
  playerId?: number;
  playerName?: string | null;
  username?: string | null;
  teamId?: string | null;
  teamName?: string | null;
}

export type WebsiteChatTarget =
  | { type: "all" }
  | {
      type: "team";
      teamId?: string | null;
      teamName?: string | null;
      playerIds?: number[];
      playerNames?: string[];
      usernames?: string[];
    }
  | {
      type: "player";
      playerId?: number | null;
      playerName?: string | null;
      username?: string | null;
    };

export function sendToWebsite(
  player: PlayerObject,
  message: string,
) {
  if (message.trim().startsWith("!")) {
    return;
  }

  const playerInfo = playerList[player.id];
  const scuderia = getLeagueScuderia(getEffectiveLeagueScuderiaId(playerInfo));

  sendChatMessageToWebsite({
    player: player.name,
    message,
    timestamp: Date.now(),
    color: scuderia?.color ?? null,
    source: "player",
  });
}

export function sendChatMessageToWebsite(message: WebsiteChatMessage) {
  if ((global as any).backendSocket) {
    (global as any).backendSocket.emit('chat:message', {
      type: 'chat:message',
      data: message,
    });
  }
}

export function sendLogToWebsite(message: WebsiteLogMessage) {
  if ((global as any).backendSocket) {
    (global as any).backendSocket.emit('log:message', {
      type: 'log:message',
      data: message,
    });
  }
}

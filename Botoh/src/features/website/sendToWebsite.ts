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
}

export interface WebsiteLogMessage {
  message: string | LocalizedMessageFunction;
  timestamp: number;
  color: number | null;
}

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

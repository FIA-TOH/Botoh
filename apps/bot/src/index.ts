// Import and run the complete Botoh bot
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
dotenv.config({ path: '../../Botoh/.env' });

// Add backend communication to existing Botoh bot
import { io } from 'socket.io-client';

let backendSocket: any = null;
let room: any = null;
let roomHeartbeatInterval: NodeJS.Timeout | null = null;

const LOCAL_BACKEND_WS_URL = 'http://localhost:3001';

function isRemoteMode() {
  return process.argv.includes('--remote') || process.env.BOT_BACKEND_MODE === 'remote';
}

function getBackendWsUrl() {
  const configuredUrl = process.env.BACKEND_WS_URL || process.env.BACKEND_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  if (isRemoteMode()) {
    throw new Error('BACKEND_WS_URL is required when running the bot in remote mode.');
  }

  return LOCAL_BACKEND_WS_URL;
}

function normalizeComparableName(name?: string | null) {
  return (name ?? '').trim().toLowerCase();
}

function getPitWallSyntheticAuth(playerId: number, playerName?: string | null) {
  return `pitwall:${playerId}:${normalizeComparableName(playerName) || 'unknown'}`;
}

async function emitRoomHeartbeat() {
  if (!backendSocket?.emit || !room?.getPlayerList) return;

  try {
    const { CIRCUIT_FILE_NAMES, currentMapIndex } = await import('../../../Botoh/src/features/zones/maps');
    const hasGameStateSnapshot = Object.prototype.hasOwnProperty.call(global, 'pitWallGameState');

    backendSocket.emit('room:heartbeat', {
      playerCount: room.getPlayerList().length,
      currentMap: CIRCUIT_FILE_NAMES[currentMapIndex] ?? null,
      ...(hasGameStateSnapshot
        ? { gameState: (global as any).pitWallGameState }
        : {}),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Failed to emit room heartbeat snapshot:', error);
  }
}

async function setupBackendCommunication() {
  const backendWsUrl = getBackendWsUrl();
  const socket = io(backendWsUrl, {
    auth: {
      botToken: process.env.BOT_SOCKET_TOKEN || undefined,
    },
  });
  
  socket.on('connect', () => {
    console.log(`Botoh bot connected to backend: ${backendWsUrl}`);
    socket.emit('register:bot', {
      token: process.env.BOT_SOCKET_TOKEN || undefined,
    });
    import('../../../Botoh/src/features/integrations/pitWallSync')
      .then(({ flushPitWallRoomSnapshot }) => flushPitWallRoomSnapshot())
      .catch((error) => {
        console.error('Failed to flush Pit Wall room snapshot:', error);
      });
    emitRoomHeartbeat();
  });

  socket.on('connect_error', (error) => {
    console.error('Botoh bot failed to connect to backend:', error.message);
  });

  socket.on('chat:send', async (data: any, respond?: (response: any) => void) => {
    // Data is coming as a string, not an object
    const message = typeof data === 'string' ? data : data.message;
    const player = typeof data === 'object' && data.player
      ? data.player
      : 'Frontend';
    const target = typeof data === 'object' && data.target
      ? data.target
      : { type: 'all' };
    
    try {
      // Import the getRoom function from Botoh
      const { getRoom } = await import('../../../Botoh/src/room');
      const room = await getRoom();
      
      if (room && message && !message.trim().startsWith('!')) {
        const { playerList } = await import('../../../Botoh/src/features/changePlayerState/playerList');
        const { getLeagueScuderia } = await import('../../../Botoh/src/features/scuderias/scuderias');
        const { MESSAGES, getPlayerLanguage } = await import('../../../Botoh/src/features/chat/messages');
        const { sendRadioMessage } = await import('../../../Botoh/src/features/chat/chat');
        const { mute_mode } = await import('../../../Botoh/src/features/chat/toggleMuteMode');

        if (mute_mode) {
          respond?.({ success: false, code: 'chat_muted' });
          return;
        }

        const targetPlayerIds = new Set(
          Array.isArray(target.playerIds)
            ? target.playerIds.filter((id: unknown) => Number.isFinite(id))
            : [],
        );
        const targetPlayerNames = new Set(
          Array.isArray(target.playerNames)
            ? target.playerNames.map(normalizeComparableName).filter(Boolean)
            : [],
        );

        const recipients = room.getPlayerList().filter((roomPlayer: PlayerObject) => {
          if (target.type === 'all') {
            return true;
          }

          if (target.type === 'player') {
            return (
              (Number.isFinite(target.playerId) && roomPlayer.id === target.playerId)
              || normalizeComparableName(roomPlayer.name) === normalizeComparableName(target.playerName)
            );
          }

          if (target.type === 'team') {
            if (
              targetPlayerIds.has(roomPlayer.id)
              || targetPlayerNames.has(normalizeComparableName(roomPlayer.name))
            ) {
              return true;
            }

            const playerState = playerList[roomPlayer.id];
            if (target.teamId && playerState?.leagueScuderia === target.teamId) {
              return true;
            }

            const scuderia = getLeagueScuderia(playerState?.leagueScuderia);
            return scuderia?.name === target.teamName;
          }

          return false;
        });

        if (recipients.length === 0) {
          const code =
            target.type === 'team'
              ? 'no_team_recipients'
              : target.type === 'player'
                ? 'player_not_found'
                : 'no_recipients';
          console.warn('Pitwall chat target has no recipients:', { target, player, message });
          respond?.({ success: false, code });
          return;
        }

        recipients.forEach((recipient: PlayerObject) => {
          const language = getPlayerLanguage(recipient.id);
          const channelLabel =
            target.type === 'team'
              ? MESSAGES.CHAT_CHANNEL_TEAM()[language]
              : target.type === 'player'
                ? MESSAGES.CHAT_CHANNEL_PRIVATE()[language]
                : MESSAGES.CHAT_CHANNEL_ALL()[language];
          const formattedMessage = `[📻 ${player} - ${channelLabel}] ${message}`;
          sendRadioMessage(room, formattedMessage, recipient.id);
        });

        if (target.type === 'all') {
          const { sendChatMessageToWebsite } = await import('../../../Botoh/src/features/website/sendToWebsite');
          sendChatMessageToWebsite({
            player,
            message,
            timestamp: Date.now(),
            color: null,
            source: 'frontend',
          });
        }

        respond?.({ success: true });
      } else {
        console.log('No room or message:', { 
          room: !!room, 
          message: message
        });
        respond?.({ success: false, code: !room ? 'room_not_available' : 'empty_message' });
      }
    } catch (error) {
      console.error('Error sending message to Haxball room:', error);
      respond?.({ success: false, code: 'bot_error' });
    }
  });

  socket.on('pit:call', async (data: { playerName?: string; playerId?: number; playerAuth?: string }, respond?: (response: any) => void) => {
    if (!data?.playerName && !Number.isFinite(data?.playerId)) {
      respond?.({ success: false, code: 'player_not_found' });
      return;
    }

    try {
      const { getRoom } = await import('../../../Botoh/src/room');
      const { sendRadioMessage } = await import('../../../Botoh/src/features/chat/chat');
      const { MESSAGES } = await import('../../../Botoh/src/features/chat/messages');
      const room = await getRoom();
      const playerToCall = room?.getPlayerList().find(
        (roomPlayer: PlayerObject) =>
          (Number.isFinite(data.playerId) && roomPlayer.id === data.playerId)
          || roomPlayer.name === data.playerName,
      );

      if (!room) {
        respond?.({ success: false, code: 'room_not_available' });
        return;
      }

      if (!playerToCall) {
        respond?.({ success: false, code: 'player_not_found' });
        return;
      }

      sendRadioMessage(room, MESSAGES.BOX_BOX_BOX(), playerToCall.id);
      respond?.({ success: true });
    } catch (error) {
      console.error('Error sending pit call to Haxball room:', error);
      respond?.({ success: false, code: 'bot_error' });
    }
  });

  socket.on('pit:prepare-tyre', async (
    data: { playerName?: string; playerId?: number; playerAuth?: string; tyre?: string | null },
    respond?: (response: any) => void,
  ) => {
    if (!data?.playerName && !Number.isFinite(data?.playerId)) {
      respond?.({ success: false, code: 'player_not_found' });
      return;
    }

    try {
      const { getRoom } = await import('../../../Botoh/src/room');
      const { playerList, idToAuth, setPreparedPitTire } = await import('../../../Botoh/src/features/changePlayerState/playerList');
      const { createPlayerInfo } = await import('../../../Botoh/src/features/changePlayerState/players');
      const { Tires } = await import('../../../Botoh/src/features/tires&pits/tires');
      const { sendRadioMessage } = await import('../../../Botoh/src/features/chat/chat');
      const { MESSAGES } = await import('../../../Botoh/src/features/chat/messages');

      const room = await getRoom();
      const playerToPrepare = room?.getPlayerList().find(
        (roomPlayer: PlayerObject) =>
          (Number.isFinite(data.playerId) && roomPlayer.id === data.playerId)
          || normalizeComparableName(roomPlayer.name) === normalizeComparableName(data.playerName),
      );

      if (!room) {
        respond?.({ success: false, code: 'room_not_available' });
        return;
      }

      if (!playerToPrepare) {
        respond?.({ success: false, code: 'player_not_found' });
        return;
      }

    
        console.log('[PitWall][PreparedTyres] prepare-request', {
          payloadPlayerId: data.playerId ?? null,
          payloadPlayerName: data.playerName ?? null,
          payloadPlayerAuth: data.playerAuth ? 'present' : null,
          roomPlayerId: playerToPrepare.id,
          roomPlayerName: playerToPrepare.name,
          roomPlayerAuth: playerToPrepare.auth ? 'present' : null,
          existingMappedAuth: idToAuth[playerToPrepare.id] ?? null,
          hasPlayerStateBefore: Boolean(playerList[playerToPrepare.id]),
          tyre: data.tyre ?? null,
        });
      

      if (!playerList[playerToPrepare.id]) {
        const fallbackAuth =
          data.playerAuth
          || playerToPrepare.auth
          || idToAuth[playerToPrepare.id]
          || getPitWallSyntheticAuth(playerToPrepare.id, playerToPrepare.name);

        idToAuth[playerToPrepare.id] = fallbackAuth;
        playerList[playerToPrepare.id] = createPlayerInfo(undefined, playerToPrepare.id);
      }

      if (!playerList[playerToPrepare.id]) {
        console.warn('Pitwall tyre prepare failed: player state missing', {
          playerId: playerToPrepare.id,
          playerName: playerToPrepare.name,
          hasFrontendAuth: Boolean(data.playerAuth),
          hasRoomAuth: Boolean(playerToPrepare.auth),
          hasMappedAuth: Boolean(idToAuth[playerToPrepare.id]),
        });
        respond?.({ success: false, code: 'player_state_missing' });
        return;
      }

      const requestedTyre = typeof data.tyre === 'string'
        ? data.tyre.toUpperCase()
        : null;

      if (requestedTyre === null) {
        setPreparedPitTire(playerToPrepare.id, null, playerToPrepare.name);
        respond?.({ success: true });
        return;
      }

      const tyre = Object.values(Tires).find((candidate) => candidate === requestedTyre);
      if (!tyre || tyre === Tires.FLAT) {
        respond?.({ success: false, code: 'invalid_tyre' });
        return;
      }

      setPreparedPitTire(playerToPrepare.id, tyre, playerToPrepare.name);
      sendRadioMessage(
        room,
        MESSAGES.PIT_TYRE_PREPARED(tyre),
        playerToPrepare.id,
      );
      respond?.({ success: true });
    } catch (error) {
      console.error('Error preparing pit tyre in Haxball room:', error);
      respond?.({ success: false, code: 'bot_error' });
    }
  });

  backendSocket = socket;
  
  // Add backend communication to global scope for Botoh modules
  (global as any).backendSocket = socket;
  
  return socket;
}

setupBackendCommunication();

process.on("beforeExit", (code) => {
  console.error("beforeExit with code:", code);
});

process.on("SIGINT", () => {
  console.error("Received SIGINT (Ctrl+C)");
  if (roomHeartbeatInterval) clearInterval(roomHeartbeatInterval);
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.error("Received SIGTERM");
  if (roomHeartbeatInterval) clearInterval(roomHeartbeatInterval);
  process.exit(0);
});

// Import and run the full Botoh bot
async function main() {
  console.log(`🔧 Starting complete Botoh bot with backend integration`);
  
  // Import the original Botoh entry point
  const { roomPromise } = await import('../../../Botoh/src/room');
  room = await roomPromise;
  
  // Set room globally for player list service
  (global as any).room = room;
  emitRoomHeartbeat();

  roomHeartbeatInterval = setInterval(emitRoomHeartbeat, 30000);
  
  // Start player list broadcasting after room is ready
  if (backendSocket) {
    const { PlayerListService } = await import('../../backend/src/services/playerListService');
    
    // Create a minimal botService-like object that emits to frontend clients
    const mockBotService = {
      broadcastToClients: (event: string, data: any) => {
        // Emit to backend socket.io server, which will broadcast to frontend clients
        if (backendSocket && backendSocket.emit) {
          backendSocket.emit('broadcast:toFrontend', { event, data });
        }
      }
    };
    
    const playerListService = new PlayerListService(mockBotService as any);
    playerListService.startBroadcasting();
  }
  
  console.log(`✅ Complete Botoh bot started with backend communication`);
}

main().catch((err) => {
  console.error("Error on start the bot:", err);
});

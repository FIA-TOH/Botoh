import { WebSocketServer, WebSocket } from "ws";
import { randomBytes } from "crypto";
import { execSync } from "child_process";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthMessage {
  type: "auth";
  token?: string;
  name?: string;
}

interface KeyMessage {
  type: "keydown" | "keyup";
  key: string;
}

type ClientMessage = AuthMessage | KeyMessage;

// ─── State ────────────────────────────────────────────────────────────────────

/** playerId → currently pressed external keys */
const pressedKeys = new Map<number, Set<string>>();

/** WebSocket client → authenticated playerId */
const clientToPlayer = new Map<WebSocket, number>();

/** playerId → one-time auth token (cleared after use) */
const pendingTokens = new Map<number, string>();

/** Room reference used for name-based auth fallback */
let roomRef: RoomObject | null = null;

export function setRoom(room: RoomObject): void {
  roomRef = room;
}

// ─── Token API (used by PlayerJoin handler) ───────────────────────────────────

/** Generates and stores a token for the given player. Returns the token. */
export function generatePlayerToken(playerId: number): string {
  const token = randomBytes(4).toString("hex"); // e.g. "a3f9c21b"
  pendingTokens.set(playerId, token);
  return token;
}

/** Removes all state for a player (call on PlayerLeave). */
export function clearPlayerInput(playerId: number): void {
  pressedKeys.delete(playerId);
  pendingTokens.delete(playerId);
  for (const [ws, id] of clientToPlayer) {
    if (id === playerId) {
      clientToPlayer.delete(ws);
      break;
    }
  }
}

// ─── Callback API ───────────────────────────────────────────────────────────────

type KeyEventCallback = (playerId: number, key: string) => void;

const keyDownCallbacks: KeyEventCallback[] = [];
const keyUpCallbacks: KeyEventCallback[] = [];

/** Registers a callback fired once on each key press (keydown). */
export function onExternalKeyDown(cb: KeyEventCallback): void {
  keyDownCallbacks.push(cb);
}

/** Registers a callback fired once on each key release (keyup). */
export function onExternalKeyUp(cb: KeyEventCallback): void {
  keyUpCallbacks.push(cb);
}

// ─── Key query API (used anywhere in the bot) ─────────────────────────────────

/** Returns true if the player is currently holding the given key. */
export function isExternalKeyPressed(playerId: number, key: string): boolean {
  return pressedKeys.get(playerId)?.has(key.toLowerCase()) ?? false;
}

/** Returns all keys currently held by the player. */
export function getPressedExternalKeys(playerId: number): string[] {
  return [...(pressedKeys.get(playerId) ?? [])];
}

/** Returns true if the player has the userscript connected and authenticated. */
export function isPlayerConnected(playerId: number): boolean {
  for (const id of clientToPlayer.values()) {
    if (id === playerId) return true;
  }
  return false;
}

/** Returns the WebSocket authenticated as the given player, or null. */
function getPlayerSocket(playerId: number): WebSocket | null {
  for (const [ws, id] of clientToPlayer) {
    if (id === playerId) return ws;
  }
  return null;
}

/**
 * Sends an arbitrary JSON payload to the userscript authenticated as the given
 * player. No-op when the player has no active socket. Used by the HUD push.
 */
export function sendToPlayer(playerId: number, payload: object): boolean {
  const ws = getPlayerSocket(playerId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;
  try {
    ws.send(JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

// ─── WebSocket server ─────────────────────────────────────────────────────────

let wss: WebSocketServer | null = null;
let retryAfterKill = false;
let shutdownHooksRegistered = false;

function findPidUsingPort(port: number): number | null {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano -p tcp | findstr :${port}`, {
        encoding: "utf8",
      });
      const lines = out
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .filter((l) => l.includes("LISTENING"));

      for (const line of lines) {
        const parts = line.split(/\s+/);
        const pid = Number(parts[parts.length - 1]);
        if (Number.isInteger(pid)) return pid;
      }
      return null;
    }

    const out = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" });
    const pid = Number(out.split(/\r?\n/).find(Boolean)?.trim());
    return Number.isInteger(pid) ? pid : null;
  } catch {
    return null;
  }
}

function killProcess(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0 || pid === process.pid) return false;

  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    } else {
      process.kill(pid, "SIGTERM");
    }
    return true;
  } catch {
    return false;
  }
}

function registerShutdownHooks(): void {
  if (shutdownHooksRegistered) return;
  shutdownHooksRegistered = true;

  const closeServer = () => {
    if (!wss) return;
    try {
      wss.close();
    } catch {
      // ignore close errors during shutdown
    }
    wss = null;
  };

  process.once("SIGINT", closeServer);
  process.once("SIGTERM", closeServer);
  process.once("exit", closeServer);
}

/** Sends the current room player list to a single WS client. */
function sendPlayerList(ws: WebSocket): void {
  if (!roomRef) return;
  const players = roomRef
    .getPlayerList()
    .filter((p) => p.id !== 0)
    .map((p) => ({ id: p.id, name: p.name }));
  if (players.length === 0) return;
  try {
    ws.send(JSON.stringify({ type: "players", players }));
    console.log(`[PlayerInput] Sent player list to client: ${players.map((p) => p.name).join(", ")}`);
  } catch {}
}

/**
 * Pushes the current player list to every unauthenticated WS client.
 * Call this from PlayerJoin after generating the token.
 */
export function notifyRoomPlayers(): void {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && !clientToPlayer.has(client)) {
      sendPlayerList(client);
    }
  });
}

export function startPlayerInputServer(port = 8765): void {
  if (wss) return;
  registerShutdownHooks();
  retryAfterKill = false;

  wss = new WebSocketServer({ port, host: "127.0.0.1" });

  wss.on("listening", () => {
    console.log(`[PlayerInput] WebSocket server listening on ws://127.0.0.1:${port}`);
  });

  wss.on("error", (err: Error & { code?: string }) => {
    if (err.code === "EADDRINUSE") {
      const pid = findPidUsingPort(port);

      if (pid && !retryAfterKill && pid !== process.pid) {
        const killed = killProcess(pid);
        if (killed) {
          retryAfterKill = true;
          console.log(`[PlayerInput] Port ${port} busy (PID ${pid}). Old process killed; retrying...`);
          wss = null;
          setTimeout(() => startPlayerInputServer(port), 300);
          return;
        }
      }

      console.error(`[PlayerInput] Port ${port} already in use — PlayerInput disabled.`);
    } else {
      console.error("[PlayerInput] WebSocket server error:", err);
    }
    wss = null;
  });

  wss.on("connection", (ws: WebSocket, req) => {
    console.log(`[PlayerInput] WS client connected from ${req.socket.remoteAddress}:${req.socket.remotePort}`);

    // Immediately inform the new client of the players currently in the room
    // so the browser can authenticate without relying on localStorage.
    sendPlayerList(ws);

    ws.on("message", (raw: Buffer) => {
      const text = raw.toString();
      console.log(`[PlayerInput] WS raw message: ${text.slice(0, 200)}`);
      try {
        const msg: ClientMessage = JSON.parse(text);
        handleMessage(ws, msg);
      } catch (err) {
        console.log(`[PlayerInput] WS message parse error: ${String(err)}`);
      }
    });

    ws.on("close", (code: number, reason: Buffer) => {
      const playerId = clientToPlayer.get(ws);
      if (playerId !== undefined) {
        pressedKeys.delete(playerId);
        clientToPlayer.delete(ws);
      }
      console.log(`[PlayerInput] WS client disconnected code=${code} reason=${reason?.toString() || "-"}`);
    });

    ws.on("error", (err) => {
      console.log(`[PlayerInput] WS client error: ${String(err)}`);
    });
  });
}

function authorizeClient(ws: WebSocket, playerId: number): void {
  clientToPlayer.set(ws, playerId);
  pressedKeys.set(playerId, new Set());
  console.log(`[PlayerInput] Client authenticated for playerId=${playerId}`);
  ws.send(JSON.stringify({ type: "auth_ok" }));
}

function handleMessage(ws: WebSocket, msg: ClientMessage): void {
  if (msg.type === "auth") {
    // Primary: token-based auth
    for (const [playerId, token] of pendingTokens) {
      if (token === msg.token) {
        pendingTokens.delete(playerId);
        authorizeClient(ws, playerId);
        return;
      }
    }
    // Fallback: name-based auth (no token needed, matches player currently in room)
    if (roomRef && msg.name) {
      const normalizedName = msg.name.trim().toLowerCase();
      const player = roomRef
        .getPlayerList()
        .find((p) => p.name.trim().toLowerCase() === normalizedName);
      if (player && !clientToPlayer.has(ws)) {
        authorizeClient(ws, player.id);
        return;
      }
    }
    console.log(`[PlayerInput] Auth failed. name=${msg.name ?? "-"} token=${msg.token ?? "-"}`);
    ws.send(JSON.stringify({ type: "auth_fail" }));
    ws.close();
    return;
  }

  const playerId = clientToPlayer.get(ws);
  if (playerId === undefined) {
    if (roomRef) {
      const candidates = roomRef
        .getPlayerList()
        .filter((p) => p.id !== 0)
        .filter((p) => !isPlayerConnected(p.id));

      if (candidates.length === 1) {
        authorizeClient(ws, candidates[0].id);
        console.log(
          `[PlayerInput] Auto-auth fallback mapped WS client to playerId=${candidates[0].id} (${candidates[0].name})`
        );
      }
    }

    const fallbackPlayerId = clientToPlayer.get(ws);
    if (fallbackPlayerId === undefined) {
      console.log(`[PlayerInput] Ignored ${msg.type} from unauthenticated client: key=${msg.key}`);
      return;
    }

    const key = msg.key.toLowerCase();
    if (msg.type === "keydown") {
      pressedKeys.get(fallbackPlayerId)?.add(key);
      console.log(`[PlayerInput] keydown playerId=${fallbackPlayerId} key=${key}`);
      for (const cb of keyDownCallbacks) cb(fallbackPlayerId, key);
    } else if (msg.type === "keyup") {
      pressedKeys.get(fallbackPlayerId)?.delete(key);
      console.log(`[PlayerInput] keyup playerId=${fallbackPlayerId} key=${key}`);
      for (const cb of keyUpCallbacks) cb(fallbackPlayerId, key);
    }

    return;
  }

  const key = msg.key.toLowerCase();
  if (msg.type === "keydown") {
    pressedKeys.get(playerId)?.add(key);
    console.log(`[PlayerInput] keydown playerId=${playerId} key=${key}`);
    for (const cb of keyDownCallbacks) cb(playerId, key);
  } else if (msg.type === "keyup") {
    pressedKeys.get(playerId)?.delete(key);
    console.log(`[PlayerInput] keyup playerId=${playerId} key=${key}`);
    for (const cb of keyUpCallbacks) cb(playerId, key);
  }
}

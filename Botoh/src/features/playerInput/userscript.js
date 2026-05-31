// ==UserScript==
// @name         FTOH Key Input Bridge
// @namespace    ftoh-bot
// @version      3.0
// @description  Sends keyboard events from the browser to the FTOH HaxBall bot.
// @match        https://www.haxball.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const VERSION = "3.0";
  const WS_URL = "ws://127.0.0.1:8765";
  const TOKEN_PATTERN = /\[FTOH-KEY:([a-f0-9]{8})\]/;
  const RECONNECT_DELAY_MS = 3000;

  let ws = null;
  let authenticated = false;
  let sentCount = 0;

  console.log(
    "%c[FTOH] Script loaded v" + VERSION + " \u2014 type ftohStatus() in console to diagnose",
    "color: #0af; font-weight: bold"
  );

  // ─── safeSend: wrapper that guards against ws not being open ──────────────

  function safeSend(payload) {
    if (!ws) {
      console.warn("[FTOH] send skipped: ws is null", payload);
      return false;
    }
    if (ws.readyState !== WebSocket.OPEN) {
      console.warn("[FTOH] send skipped: ws not open (state=" + ws.readyState + ")", payload);
      return false;
    }
    try {
      ws.send(JSON.stringify(payload));
      sentCount++;
      return true;
    } catch (err) {
      console.error("[FTOH] send error:", err);
      return false;
    }
  }

  // ─── Diagnostic helper (call from F12 console) ────────────────────────────

  window.ftohStatus = function () {
    const states = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    const state = ws == null ? "null" : (states[ws.readyState] || ws.readyState);
    console.log("[FTOH] Status", {
      version: VERSION,
      wsState: state,
      authenticated: authenticated,
      sentCount: sentCount,
      playerName: localStorage.getItem("PlayerName"),
    });
  };

  // ─── Handle player list sent by server on WS connect or player join ─────

  function handlePlayerList(players) {
    if (authenticated) return;
    if (players.length === 0) {
      console.log("[FTOH] Server sent empty player list. Waiting for you to join the room...");
      return;
    }

    console.log("[FTOH] Players in room:", players.map(function(p) { return p.name; }).join(", "));

    // Scan ALL localStorage keys looking for a value that matches a player name
    var found = null;
    for (var i = 0; i < localStorage.length && !found; i++) {
      var key = localStorage.key(i);
      var val = localStorage.getItem(key);
      if (typeof val === "string" && val.length > 0 && val.length < 64) {
        var match = players.find(function(p) {
          return p.name.trim().toLowerCase() === val.trim().toLowerCase();
        });
        if (match) {
          found = match;
          console.log("[FTOH] Matched localStorage[" + key + "]=\"" + val + "\" → player \"" + match.name + "\"");
          safeSend({ type: "auth", name: val.trim() });
        }
      }
    }

    if (!found) {
      if (players.length === 1) {
        // Only 1 player in the room — must be you
        console.log("[FTOH] 1 player in room, auto-auth as \"" + players[0].name + "\"");
        safeSend({ type: "auth", name: players[0].name });
      } else {
        console.warn(
          "%c[FTOH] Could not auto-detect your name. Players: " + players.map(function(p) { return p.name; }).join(", "),
          "color: orange"
        );
        console.warn("[FTOH] Run ftohConnect(\"YourNameHere\") in the console to authenticate.");
      }
    }
  }

  // ─── HUD overlay ──────────────────────────────────────────────────────────

  const RPM_SEGMENTS = 15;
  const RPM_SEGMENT_COLORS = (function () {
    const a = [];
    for (let i = 0; i < 5; i++) a.push("#22c55e");   // green
    for (let i = 0; i < 5; i++) a.push("#ef4444");   // red
    for (let i = 0; i < 5; i++) a.push("#a855f7");   // purple
    return a;
  })();
  const TIRE_COLORS = {
    SOFT:   "#ef4444",
    MEDIUM: "#facc15",
    HARD:   "#e5e7eb",
    INTER:  "#22c55e",
    WET:    "#3b82f6",
    FLAT:   "#374151",
    TRAIN:  "#a855f7",
  };
  const HUD_HIDE_AFTER_MS = 2000;

  let hudRoot = null;
  let hudEls = null;
  let hudHideTimer = null;
  let hudLimiterBlinkOn = true;
  let hudLimiterInterval = null;

  function buildHud() {
    if (hudRoot) return;

    const css = [
      "#ftoh-hud{position:fixed;top:12px;right:12px;z-index:2147483647;",
      "background:rgba(10,12,20,0.82);color:#fff;",
      "font-family:'Consolas','Menlo','Monaco',monospace;font-size:13px;",
      "padding:8px 10px;border-radius:8px;min-width:200px;",
      "box-shadow:0 2px 10px rgba(0,0,0,0.6);",
      "border:1px solid rgba(255,255,255,0.08);",
      "user-select:none;pointer-events:none;line-height:1.35;}",
      "#ftoh-hud .ftoh-row{display:flex;align-items:center;gap:6px;margin:3px 0;}",
      "#ftoh-hud .ftoh-gear{font-size:24px;font-weight:700;color:#fff;",
      "width:28px;text-align:center;}",
      "#ftoh-hud .ftoh-rpm{display:flex;gap:2px;flex:1;}",
      "#ftoh-hud .ftoh-rpm span{width:8px;height:14px;border-radius:2px;",
      "background:#1f2937;display:inline-block;}",
      "#ftoh-hud .ftoh-bar{position:relative;flex:1;height:12px;",
      "background:#1f2937;border-radius:3px;overflow:hidden;}",
      "#ftoh-hud .ftoh-bar > i{display:block;height:100%;width:0%;",
      "transition:width 120ms linear;}",
      "#ftoh-hud .ftoh-label{font-size:11px;color:#cbd5e1;width:46px;}",
      "#ftoh-hud .ftoh-val{font-size:11px;color:#e2e8f0;width:38px;",
      "text-align:right;font-variant-numeric:tabular-nums;}",
      "#ftoh-hud .ftoh-tire-dot{width:12px;height:12px;border-radius:50%;",
      "border:1px solid rgba(255,255,255,0.25);display:inline-block;}",
    ].join("");

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    hudRoot = document.createElement("div");
    hudRoot.id = "ftoh-hud";
    hudRoot.style.display = "none";
    hudRoot.innerHTML = [
      '<div class="ftoh-row">',
        '<span class="ftoh-label">GEAR</span>',
        '<span class="ftoh-gear" data-el="gear">N</span>',
        '<div class="ftoh-rpm" data-el="rpm"></div>',
      '</div>',
      '<div class="ftoh-row">',
        '<span class="ftoh-label">ERS</span>',
        '<div class="ftoh-bar"><i data-el="ersBar" style="background:#06b6d4"></i></div>',
        '<span class="ftoh-val" data-el="ersVal">0%</span>',
      '</div>',
      '<div class="ftoh-row">',
        '<span class="ftoh-label">TIRE</span>',
        '<span class="ftoh-tire-dot" data-el="tireDot"></span>',
        '<div class="ftoh-bar"><i data-el="wearBar"></i></div>',
        '<span class="ftoh-val" data-el="tireVal">--</span>',
      '</div>',
    ].join("");

    document.body.appendChild(hudRoot);

    const rpmContainer = hudRoot.querySelector('[data-el="rpm"]');
    const rpmSegs = [];
    for (let i = 0; i < RPM_SEGMENTS; i++) {
      const s = document.createElement("span");
      rpmContainer.appendChild(s);
      rpmSegs.push(s);
    }

    hudEls = {
      gear:    hudRoot.querySelector('[data-el="gear"]'),
      rpmSegs: rpmSegs,
      ersBar:  hudRoot.querySelector('[data-el="ersBar"]'),
      ersVal:  hudRoot.querySelector('[data-el="ersVal"]'),
      tireDot: hudRoot.querySelector('[data-el="tireDot"]'),
      wearBar: hudRoot.querySelector('[data-el="wearBar"]'),
      tireVal: hudRoot.querySelector('[data-el="tireVal"]'),
    };
  }

  function ensureHudVisible() {
    if (!hudRoot) return;
    hudRoot.style.display = "block";
    if (hudHideTimer) clearTimeout(hudHideTimer);
    hudHideTimer = setTimeout(() => {
      if (hudRoot) hudRoot.style.display = "none";
      stopLimiterBlink();
    }, HUD_HIDE_AFTER_MS);
  }

  function startLimiterBlink() {
    if (hudLimiterInterval) return;
    hudLimiterInterval = setInterval(() => {
      hudLimiterBlinkOn = !hudLimiterBlinkOn;
      applyRpmBlinkState();
    }, 80);
  }

  function stopLimiterBlink() {
    if (hudLimiterInterval) {
      clearInterval(hudLimiterInterval);
      hudLimiterInterval = null;
    }
    hudLimiterBlinkOn = true;
  }

  let lastLitCount = 0;

  function applyRpmBlinkState() {
    if (!hudEls) return;
    for (let i = 0; i < RPM_SEGMENTS; i++) {
      if (i < lastLitCount) {
        hudEls.rpmSegs[i].style.background = hudLimiterBlinkOn
          ? RPM_SEGMENT_COLORS[i]
          : "#1f2937";
      } else {
        hudEls.rpmSegs[i].style.background = "#1f2937";
      }
    }
  }

  function handleHudUpdate(msg) {
    if (!hudRoot) buildHud();

    // Gear
    const gear = msg.gear | 0;
    hudEls.gear.textContent = gear <= 0 ? "N" : String(gear);

    // RPM bar
    const rpmMin = msg.rpmMin || 1000;
    const rpmMax = msg.rpmRedline || 8000;
    const rpm = Math.max(rpmMin, Math.min(rpmMax, msg.rpm || rpmMin));
    const ratio = (rpm - rpmMin) / Math.max(1, rpmMax - rpmMin);
    const lit = Math.max(0, Math.min(RPM_SEGMENTS, Math.floor(ratio * RPM_SEGMENTS)));
    lastLitCount = lit;

    if (msg.limiterActive) {
      startLimiterBlink();
    } else {
      stopLimiterBlink();
    }
    applyRpmBlinkState();

    // ERS
    const ers = Math.max(0, Math.min(100, msg.ers || 0));
    hudEls.ersBar.style.width = ers.toFixed(0) + "%";
    hudEls.ersVal.textContent = ers.toFixed(0) + "%";

    // Tires + wear
    const tire = String(msg.tire || "").toUpperCase();
    hudEls.tireDot.style.background = TIRE_COLORS[tire] || "#9ca3af";
    const wear = Math.max(0, Math.min(100, msg.wear || 0));
    const remaining = 100 - wear;
    hudEls.wearBar.style.width = remaining.toFixed(0) + "%";
    // Color: green→yellow→red as wear rises
    let wearColor = "#22c55e";
    if (wear >= 70) wearColor = "#ef4444";
    else if (wear >= 40) wearColor = "#facc15";
    hudEls.wearBar.style.background = wearColor;
    hudEls.tireVal.textContent = tire ? (tire.slice(0, 4) + " " + remaining.toFixed(0) + "%") : "--";

    ensureHudVisible();
  }

  // ─── WebSocket connection ──────────────────────────────────────────────────

  function connect() {
    console.log("[FTOH] Connecting to bot at " + WS_URL + "...");
    ws = new WebSocket(WS_URL);

    ws.addEventListener("open", () => {
      console.log("[FTOH] WS open. Attempting name-based auth...");
      const name = localStorage.getItem("PlayerName");
      if (name) {
        console.log("[FTOH] Sending name: " + name);
        safeSend({ type: "auth", name: name });
      } else {
        console.warn("[FTOH] No PlayerName in localStorage. Waiting for token via chat...");
      }
    });

    ws.addEventListener("message", (e) => {
      console.log("[FTOH] Received from bot:", e.data);
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "auth_ok") {
          authenticated = true;
          console.log("%c[FTOH] Authenticated! Keys will be forwarded.", "color: #0f0");
        } else if (msg.type === "auth_fail") {
          authenticated = false;
          console.warn("[FTOH] Auth failed. Token/name not recognized.");
        } else if (msg.type === "players") {
          handlePlayerList(msg.players || []);
        } else if (msg.type === "hud") {
          handleHudUpdate(msg);
        }
      } catch (_) {}
    });

    ws.addEventListener("close", (e) => {
      authenticated = false;
      console.warn("[FTOH] WS closed code=" + e.code + " reason=" + (e.reason || "-") + ". Reconnecting...");
      setTimeout(connect, RECONNECT_DELAY_MS);
    });

    ws.addEventListener("error", (e) => {
      console.error("[FTOH] WS error event", e);
    });
  }

  // ─── Token fallback: MutationObserver model (same style as your old script) ─

  const seenTokens = new Set();

  function tryToken(token) {
    if (!token || seenTokens.has(token)) return;
    seenTokens.add(token);
    console.log("[FTOH] Found token in chat: " + token);
    safeSend({ type: "auth", token: token });
  }

  function extractAndTryToken(text) {
    if (!text) return;
    const match = text.match(TOKEN_PATTERN);
    if (match) tryToken(match[1]);
  }

  function scanNode(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

    // Same logic style as your Macro-Master: inspect added node text directly.
    extractAndTryToken(node.textContent ? node.textContent.trim() : "");

    // Also inspect nested paragraphs/spans where chat lines usually land.
    const lines = node.querySelectorAll("p, span, div");
    for (const line of lines) {
      extractAndTryToken(line.textContent ? line.textContent.trim() : "");
    }
  }

  function startTokenObserver() {
    const start = () => {
      if (!document.body) {
        setTimeout(start, 50);
        return;
      }

      // Initial sweep for already-rendered chat lines.
      extractAndTryToken(document.body.textContent || "");

      const observer = new MutationObserver((mutations) => {
        if (authenticated) return;
        for (const mutation of mutations) {
          for (const added of mutation.addedNodes) {
            scanNode(added);
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      console.log("[FTOH] Chat observer running.");
    };

    start();
  }

  // ─── Manual connect helper (call from F12 console) ────────────────────────
  // Usage: window.ftohConnect()           — re-auth by name
  //        window.ftohConnect("abcd1234") — auth by token

  window.ftohConnect = function (token) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("[FTOH] Not connected yet.");
      return;
    }
    if (token) {
      console.log("[FTOH] Manual auth with token: " + token);
      safeSend({ type: "auth", token: token });
    } else {
      const name = localStorage.getItem("PlayerName");
      console.log("[FTOH] Manual auth with name: " + name);
      safeSend({ type: "auth", name: name });
    }
  };

  // ─── Keyboard event forwarding (capture=true to run BEFORE HaxBall) ───────

  const pressed = new Set();

  function getNormalizedKey(e) {
    // Force numpad digits to plain digits so backend numeric filters always match.
    if (/^Numpad[0-9]$/.test(e.code)) return e.code.slice(-1);
    return e.key;
  }

  window.addEventListener("keydown", (e) => {
    const key = getNormalizedKey(e);
    if (pressed.has(key)) return; // skip key-repeat
    pressed.add(key);
    const ok = safeSend({ type: "keydown", key: key });
    console.log("[FTOH] keydown", key, "sent=" + ok);
  }, true); // <-- capture phase: fires before HaxBall's own listeners

  window.addEventListener("keyup", (e) => {
    const key = getNormalizedKey(e);
    pressed.delete(key);
    const ok = safeSend({ type: "keyup", key: key });
    console.log("[FTOH] keyup", key, "sent=" + ok);
  }, true); // <-- capture phase

  // ─── Init ──────────────────────────────────────────────────────────────────

  connect();
  startTokenObserver();
})();

import { getPlayerAndDiscs } from "../playerFeatures/getPlayerAndDiscs";

interface PlayerState {
  id: number;
  x: number;
  y: number;
  xspeed: number;
  yspeed: number;
  radius: number;
  damping: number;
  bCoeff: number;
  invMass: number;
  cGroup: number;
  cMask: number;
  color: number;
  name: string;
  team: number;
  admin: boolean;
  conn: string;
  auth: string;
}

let capturedStates: PlayerState[] = [];
let restoreEnabled = false;
let hasTriggered = false;
let initialGameTime = 0;

export function enableGameStateRestore() {
  restoreEnabled = true;
  hasTriggered = false;
  // Só limpa capturedStates se não houver dados (preserva para alternância de circuitos)
  if (capturedStates.length > 0) {
    console.log(`Game state restore POC enabled - keeping ${capturedStates.length} captured states`);
  } else {
    capturedStates = [];
    console.log("Game state restore POC enabled - no states to preserve");
  }
}

export function disableGameStateRestore() {
  restoreEnabled = false;
  hasTriggered = false;
  // Não limpa capturedStates para preservar dados para alternância de circuitos
  console.log(`Game state restore disabled - preserving ${capturedStates.length} captured states`);
  console.log("Game state restore POC disabled");
}

export function resetTrigger() {
  hasTriggered = false;
  initialGameTime = 0;
  console.log("Game state restore trigger reset");
}

function capturePlayerStates(room: RoomObject) {
  capturedStates = [];
  const playersAndDiscs = getPlayerAndDiscs(room);
  
  playersAndDiscs.forEach(({ p, disc }) => {
    if (disc) {
      capturedStates.push({
        id: p.id,
        x: disc.x,
        y: disc.y,
        xspeed: disc.xspeed,
        yspeed: disc.yspeed,
        radius: disc.radius,
        damping: disc.damping,
        bCoeff: disc.bCoeff,
        invMass: disc.invMass,
        cGroup: disc.cGroup,
        cMask: disc.cMask,
        color: disc.color,
        name: p.name,
        team: p.team,
        admin: p.admin,
        conn: p.conn,
        auth: p.auth
      });
      console.log(`Captured state for player ${p.name}: pos(${disc.x}, ${disc.y}) speed(${disc.xspeed}, ${disc.yspeed})`);
    }
  });
  
  console.log(`Captured state for ${capturedStates.length} players`);
}

export function handleGameStateRestore(room: RoomObject) {
  if (!restoreEnabled || hasTriggered) return;
  
  const scores = room.getScores();
  if (!scores || scores.time === undefined) return;
  
  // Se é o início do jogo, captura o tempo inicial
  if (scores.time > 0 && initialGameTime === 0) {
    initialGameTime = scores.time;
    console.log(`Game started, initial time: ${initialGameTime}`);
    return;
  }
  
  // Verifica se chegou no segundo 5
  if (scores.time >= 5 && !hasTriggered) {
    hasTriggered = true;
    
    console.log("Triggering instant game stop/restart at 5 seconds");
    
    // CAPTURA ESTADO ANTES DE PARAR - momento mais preciso
    console.log("Capturing state BEFORE stopping game...");
    capturePlayerStates(room);
    
    // Para o jogo imediatamente
    room.stopGame();
    
    // Verifica se há alternância de circuitos em andamento antes de reiniciar
    // Importante: Não reinicia o jogo se estamos alternando circuitos
    setTimeout(() => {
      if (restoreEnabled) {
        // Só reinicia se o sistema ainda estiver ativo (não foi desabilitado para alternância)
        console.log("Restarting game for state restore...");
        room.startGame();
        
        // Restaura estados instantaneamente (no mesmo tick)
        console.log("Instant restore attempt...");
        restorePlayerStates(room);
        console.log("Game state restore completed");
      } else {
        console.log("Game restore disabled - circuit switching in progress");
      }
      
      // Resetar trigger após 500ms
      setTimeout(() => {
        resetTrigger();
      }, 500);
    }, 100); // Pequeno delay para permitir que o sistema de alternância desabilite
  }
}

export function restorePlayerStates(room: RoomObject) {
  if (capturedStates.length === 0) {
    console.log("No captured states to restore");
    return;
  }
  
  console.log(`Attempting to restore ${capturedStates.length} player states`);
  const currentPlayers = room.getPlayerList();
  
  capturedStates.forEach(capturedState => {
    const currentPlayer = currentPlayers.find(p => p.id === capturedState.id);
    if (currentPlayer) {
      try {
        // Restaurar posição e velocidade
        const restoreProps = {
          x: capturedState.x,
          y: capturedState.y,
          xspeed: capturedState.xspeed,
          yspeed: capturedState.yspeed,
          radius: capturedState.radius,
          damping: capturedState.damping,
          bCoeff: capturedState.bCoeff,
          invMass: capturedState.invMass,
          cGroup: capturedState.cGroup,
          cMask: capturedState.cMask,
          color: capturedState.color
        };
        
        console.log(`Restoring state for player ${currentPlayer.name}: pos(${capturedState.x}, ${capturedState.y}) speed(${capturedState.xspeed}, ${capturedState.yspeed})`);
        room.setPlayerDiscProperties(currentPlayer.id, restoreProps);
        console.log(`Successfully restored state for player ${currentPlayer.name}`);
      } catch (error) {
        console.error(`Failed to restore state for player ${currentPlayer.name}:`, error);
      }
    } else {
      console.log(`Player ${capturedState.name} (ID: ${capturedState.id}) not found in current room`);
    }
  });
}

export function handleGameStopForRestore(room: RoomObject) {
  // Não precisa mais capturar aqui - já capturamos antes de parar
  if (restoreEnabled && hasTriggered) {
    console.log("Game stopped by restore trigger - states already captured");
  }
}

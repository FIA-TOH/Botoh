import { sendErrorMessage, sendAlertMessage, sendGreenMessage } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { CIRCUITS, currentMapIndex } from "../../zones/maps";
import { handleAvatar, Situacions } from "../../changePlayerState/handleAvatar";
import { clearDebris } from "../../debris/clearDebris";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";
import { Teams } from "../../changeGameState/teams";

let scActive = false;
let scCountdownTimeout: NodeJS.Timeout | undefined;
let scDriverId: number | undefined;
let scDriverInterval: NodeJS.Timeout | undefined;

export function handleSCCommand(
  byPlayer?: PlayerObject,
  args?: string[],
  room?: RoomObject
) {
  if (!room) {
    return;
  }
  if (byPlayer && !byPlayer.admin) {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    return;
  }

  const arg = args?.[0]?.toLowerCase();
  
  if (arg === "on") {
    if (scActive) {
      sendErrorMessage(room, MESSAGES.SAFETY_CAR(), byPlayer?.id || 0);
      return;
    }

    // Clear any existing countdown
    if (scCountdownTimeout) {
      clearTimeout(scCountdownTimeout);
    }

    // Send initial Safety Car message
    sendAlertMessage(room, MESSAGES.SAFETY_CAR());
    
    // Send warning messages
    sendAlertMessage(room, MESSAGES.SAFETY_CAR_ENTERING_TRACK());
    sendAlertMessage(room, MESSAGES.OVERTAKING_PROHIBITED());

    // Apply safety car avatar to all players immediately for 10 seconds
    const players = room.getPlayerList();
    players.forEach(player => {
      handleAvatar(Situacions.SafetyCar, player, room);
    });

    // Set scActive immediately for speed reduction
    scActive = true;

    // Start 10-second countdown
    scCountdownTimeout = setTimeout(() => {
      // Send Safety Car message again after 10 seconds
      sendAlertMessage(room, MESSAGES.SAFETY_CAR());
      
      // Create safety car driver
      createSafetyCarDriver(room);
      
      // Check if current circuit has new_safetycar
      const currentCircuit = CIRCUITS[currentMapIndex];
      if (currentCircuit?.info?.new_safetycar) {
        // Set collision group to c2 for all players
        players.forEach(player => {
          room.setPlayerDiscProperties(player.id, { cGroup: room.CollisionFlags.c2 });
        });
      }
    }, 10000); // 10 seconds

  } else if (arg === "off") {
    if (!scActive && !scCountdownTimeout) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer?.id || 0);
      return;
    }

    // Clear countdown if active
    if (scCountdownTimeout) {
      clearTimeout(scCountdownTimeout);
      scCountdownTimeout = undefined;
    }

    scActive = false;
    
    // Clear safety car driver
    clearSafetyCarDriver(room);
    
    // Show green flag when safety car is deactivated
    const playersAndDiscs = getPlayerAndDiscs(room);
    const players = getRunningPlayers(playersAndDiscs);
    
    sendGreenMessage(room, MESSAGES.GREEN_FLAG());
    sendGreenMessage(room, MESSAGES.GREEN_FLAG_TWO());
    clearDebris(room);

    players.forEach((player) => {
      handleAvatar(Situacions.Flag, player.p, room, undefined, ["🟩"], [5000]);
      handleAvatar(Situacions.Null, player.p, room);
    });
    
    // Check if current circuit has new_safetycar
    const currentCircuit = CIRCUITS[currentMapIndex];
    if (currentCircuit?.info?.new_safetycar) {
      // Set collision group to red for all players
      players.forEach(player => {
        room.setPlayerDiscProperties(player.p.id, { cGroup: room.CollisionFlags.red });
      });
    }
  } else {
    sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer?.id || 0);
  }
}

function createSafetyCarDriver(room: RoomObject) {
  const allPlayers = room.getPlayerList();
  
  // Find admins in spec or blue team
  const eligibleAdmins = allPlayers.filter(player => 
    player.admin && (player.team === Teams.SPECTATORS || player.team === Teams.OUTSIDE)
  );
  
  if (eligibleAdmins.length === 0) {
    return; // No eligible admins found
  }
  
  // Select the first eligible admin
  const scDriver = eligibleAdmins[0];
  scDriverId = scDriver.id;
  
  // Move to blue team
  room.setPlayerTeam(scDriver.id, Teams.OUTSIDE);
  
  // Get spawn point for safety car driver
  const currentCircuit = CIRCUITS[currentMapIndex];
  // Use firstPlace if available, otherwise use lastPlace as fallback
  const spawnPoint = currentCircuit.info.firstPlace || currentCircuit.info.lastPlace;
  
  if (spawnPoint) {
    // Teleport to safety car spawn point
    room.setPlayerDiscProperties(scDriver.id, {
      x: spawnPoint.x,
      y: spawnPoint.y,
      xspeed: 0,
      yspeed: 0
    });
  }
  
  // Start constant safety car emoji cycling
  let emojiIndex = 0;
  const safetyCarEmojis = ["🚗", "🚨"];
  
  const cycleEmoji = () => {
    if (!scDriverId || !scActive) return;
    
    room.setPlayerAvatar(scDriverId, safetyCarEmojis[emojiIndex]);
    emojiIndex = (emojiIndex + 1) % safetyCarEmojis.length;
  };
  
  // Start cycling immediately
  cycleEmoji();
  scDriverInterval = setInterval(cycleEmoji, 1000); // Change every second
}

function clearSafetyCarDriver(room: RoomObject) {
  if (scDriverInterval) {
    clearInterval(scDriverInterval);
    scDriverInterval = undefined;
  }
  
  if (scDriverId) {
    // Clear avatar
    room.setPlayerAvatar(scDriverId, null);
    scDriverId = undefined;
  }
}

export function isSCActive(): boolean {
  return scActive;
}

export function checkAndClearSafetyCarDriver(playerId: number, room: RoomObject) {
  if (scDriverId === playerId) {
    clearSafetyCarDriver(room);
  }
}

export function getSafetyCarDriverId(): number | undefined {
  return scDriverId;
}

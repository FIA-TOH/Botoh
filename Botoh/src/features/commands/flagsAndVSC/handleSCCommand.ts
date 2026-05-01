import { sendErrorMessage, sendAlertMessage, sendGreenMessage, COLORS } from "../../chat/chat";
import { MESSAGES } from "../../chat/messages";
import { DEFAULT_LANGUAGE } from "../../chat/language";
import { CIRCUITS, currentMapIndex } from "../../zones/maps";
import { handleAvatar, Situacions, restoreTyreOrCar } from "../../changePlayerState/handleAvatar";
import { clearDebris } from "../../debris/clearDebris";
import { getPlayerAndDiscs } from "../../playerFeatures/getPlayerAndDiscs";
import { getRunningPlayers } from "../../utils";
import { Teams } from "../../changeGameState/teams";
import { positionList } from "../gameMode/race/positionList";

let scActive = false;
let scCountdownTimeout: NodeJS.Timeout | undefined;
let scDriverId: number | undefined;
let scDriverInterval: NodeJS.Timeout | undefined;
let lappedCars: Set<number> = new Set();
let lappedCarDeficits: { [key: number]: number } = {};

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
      if (byPlayer) {
        sendErrorMessage(room, MESSAGES.SAFETY_CAR(), byPlayer.id);
      }
      return;
    }

    if (scCountdownTimeout) {
      clearTimeout(scCountdownTimeout);
    }

    sendAlertMessage(room, MESSAGES.SAFETY_CAR());
    
    sendAlertMessage(room, MESSAGES.SAFETY_CAR_ENTERING_TRACK());
    sendAlertMessage(room, MESSAGES.OVERTAKING_PROHIBITED());

    const players = room.getPlayerList();
    players.forEach(player => {
      handleAvatar(Situacions.SafetyCar, player, room);
    });

    scActive = true;

    scCountdownTimeout = setTimeout(() => {
      sendAlertMessage(room, MESSAGES.SAFETY_CAR());
      sendAlertMessage(room, MESSAGES.SAFETY_CAR());
      
      createSafetyCarDriver(room);
      
      const currentCircuit = CIRCUITS[currentMapIndex];
      if (currentCircuit?.info?.new_safetycar) {
        players.forEach(player => {
          room.setPlayerDiscProperties(player.id, { cGroup: room.CollisionFlags.red | room.CollisionFlags.blue | room.CollisionFlags.c2 });
        });
      }
    }, 10000);

  } else if (arg === "lapped") {
    if (!scActive) {
      if (byPlayer) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      }
      return;
    }

    const playerIdArg = args?.[1];
    
    if (playerIdArg) {
   
      const playerId = parseInt(playerIdArg);
      
      if (isNaN(playerId)) {
        if (byPlayer) {
          sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
        }
        return;
      }

      const player = room.getPlayerList().find(p => p.id === playerId);
      
      if (!player) {
        if (byPlayer) {
          sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
        }
        return;
      }


      if (isPlayerLapped(playerId)) {

        clearLappedCarAvatar(playerId, room);
        room.sendAnnouncement(
          `Player ${player.name} is no longer lapped`,
          COLORS.GREEN,
          1
        );
      } else {

        setPlayerLapped(playerId, true);
        handleAvatar(Situacions.LappedCar, player, room);
        room.sendAnnouncement(
          `Player ${player.name} is now lapped`,
          COLORS.CYAN,
          1
        );
      }
    } else {
      room.sendAnnouncement(
        MESSAGES.LAPPED_CARS_OVERTAKE()[DEFAULT_LANGUAGE],
        COLORS.CYAN,
        1
      );

      const activePositions = positionList.filter(p => p.active);
      
      if (activePositions.length > 1) {
        const leader = activePositions[0];
        const leaderLap = leader.lap;
        
        const actuallyLappedPlayers = activePositions.filter(player => 
          player.lap < leaderLap 
        );
        
        const allPlayers = room.getPlayerList();
        actuallyLappedPlayers.forEach(lappedPosition => {
          const player = allPlayers.find(p => p.id === lappedPosition.id);
          if (player) {
            const lapDeficit = leaderLap - lappedPosition.lap;
            setPlayerLapped(player.id, true);
            setLapDeficit(player.id, lapDeficit);
            handleAvatar(Situacions.LappedCar, player, room);
          }
        });
        
        const notActuallyLapped = activePositions.filter(player => 
          player.lap >= leaderLap
        );
        notActuallyLapped.forEach(player => {
          if (isPlayerLapped(player.id)) {
            clearLappedCarAvatar(player.id, room);
          }
        });
      }
    }

  } else if (arg === "off") {
    if (!scActive && !scCountdownTimeout) {
      if (byPlayer) {
        sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
      }
      return;
    }

    if (scCountdownTimeout) {
      clearTimeout(scCountdownTimeout);
      scCountdownTimeout = undefined;
    }

    scActive = false;
    
    lappedCars.clear();
    const allPlayers = room.getPlayerList();
    allPlayers.forEach(player => {
      clearLappedCarAvatar(player.id, room);
    });
    
    clearSafetyCarDriver(room);
    
    const playersAndDiscs = getPlayerAndDiscs(room);
    const players = getRunningPlayers(playersAndDiscs);
    
    sendGreenMessage(room, MESSAGES.GREEN_FLAG());
    sendGreenMessage(room, MESSAGES.GREEN_FLAG_TWO());
    clearDebris(room);

    players.forEach((player) => {
      handleAvatar(Situacions.Flag, player.p, room, undefined, ["🟩"], [5000]);
      handleAvatar(Situacions.Null, player.p, room);
    });
    const currentCircuit = CIRCUITS[currentMapIndex];
    if (currentCircuit?.info?.new_safetycar) {
      players.forEach(player => {
        room.setPlayerDiscProperties(player.p.id, { cGroup: room.CollisionFlags.red });
      });
    }
  } else {
    if (byPlayer) {
      sendErrorMessage(room, MESSAGES.NON_EXISTENT_COMMAND(), byPlayer.id);
    }
  }
}

function createSafetyCarDriver(room: RoomObject) {
  const allPlayers = room.getPlayerList();
  
  const eligibleAdmins = allPlayers.filter(player => 
    player.admin && (player.team === Teams.SPECTATORS || player.team === Teams.OUTSIDE)
  );
  
  if (eligibleAdmins.length === 0) {
    return;
  }
  
  const scDriver = eligibleAdmins[0];
  scDriverId = scDriver.id;
  
  room.setPlayerTeam(scDriver.id, Teams.OUTSIDE);
  
  const currentCircuit = CIRCUITS[currentMapIndex];
  const spawnPoint = currentCircuit.info.firstPlace || currentCircuit.info.lastPlace;
  
  if (spawnPoint) {
    room.setPlayerDiscProperties(scDriver.id, {
      x: spawnPoint.x,
      y: spawnPoint.y,
      xspeed: 0,
      yspeed: 0
    });
  }
  
  let emojiIndex = 0;
  const safetyCarEmojis = ["🚗", "🚨"];
  
  const cycleEmoji = () => {
    if (!scDriverId || !scActive) return;
    
    room.setPlayerAvatar(scDriverId, safetyCarEmojis[emojiIndex]);
    emojiIndex = (emojiIndex + 1) % safetyCarEmojis.length;
  };
  
  cycleEmoji();
  scDriverInterval = setInterval(cycleEmoji, 1000);
}

function clearSafetyCarDriver(room: RoomObject) {
  if (scDriverInterval) {
    clearInterval(scDriverInterval);
    scDriverInterval = undefined;
  }
  
  if (scDriverId) {
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

export function clearLappedCarAvatar(playerId: number, room: RoomObject) {
  setPlayerLapped(playerId, false);
  
  restoreTyreOrCar(playerId, room);
}

export function isPlayerLapped(playerId: number): boolean {
  return lappedCars.has(playerId);
}

export function setPlayerLapped(playerId: number, isLapped: boolean) {
  if (isLapped) {
    lappedCars.add(playerId);
  } else {
    lappedCars.delete(playerId);
    delete lappedCarDeficits[playerId];
  }
}

export function setLapDeficit(playerId: number, deficit: number) {
  lappedCarDeficits[playerId] = deficit;
}

export function getLapDeficit(playerId: number): number {
  return lappedCarDeficits[playerId] || 0;
}

export function lappedCarReachedGrid(playerId: number, room: RoomObject) {
  if (isPlayerLapped(playerId)) {
    clearLappedCarAvatar(playerId, room);
  }
}

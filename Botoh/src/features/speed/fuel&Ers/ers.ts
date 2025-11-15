import { handleAvatar, Situacions } from "../../changePlayerState/handleAvatar";
import { vsc } from "../handleSpeed";
import { ifInBoxZone } from "../../tires&pits/pits";
import { playerList } from "../../changePlayerState/playerList";
import { getRunningPlayers } from "../../utils";
import { gasEnabled } from "../handleSlipstream";
import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../../changeGameState/changeGameModes";
import { presentationLap } from "../../commands/gameState/handlePresentationLapCommand";
import { playerBuffList } from "../../commands/adjustThings/handleNerfListCommand";

const ERS_DURATION_SECONDS = 7;
const ERS_RECHARGE_MINUTES = 2;

export let ersActivated = true;
export let ersPenalty = true;

export function enableErs(boolean: boolean) {
  ersActivated = boolean;
}

export function enableErsPenalty(boolean: boolean) {
  ersPenalty = boolean;
}

export function updateErs(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);

  players.forEach((pad) => {
    const p = pad.p;
    const properties = pad.disc;
    const playerInfo = playerList[p.id];

    const isNerfed = playerBuffList.some(
      (nerfPlayer) => nerfPlayer.name === p.name
    );

    if (ersActivated) {
      handleERS(p, properties, playerInfo, isNerfed, room);
    } else if (gasEnabled) {
      handleFuel(p, properties, playerInfo, room);
    }
  });
}

/**
 * --- ERS HANDLING ---
 */
function handleERS(
  p: PlayerObject,
  properties: DiscPropertiesObject,
  playerInfo: any,
  isNerfed: boolean,
  room: RoomObject
) {
  if (room.getScores()?.time > 0) {
    if (properties.damping === 0.986) {
      handleAvatar(Situacions.Ers, p, room);
      if (playerInfo.kers > 0) {
        playerInfo.kers -= 100 / (ERS_DURATION_SECONDS * 60);
        if (playerInfo.kers < 0) playerInfo.kers = 0;
      }
    } else {
      if (playerInfo.kers < 100) {
        const baseRecharge = 100 / (ERS_RECHARGE_MINUTES * 60 * 60);
        const rechargeRate = isNerfed ? baseRecharge * 1.25 : baseRecharge;

        playerInfo.kers += rechargeRate;
        if (playerInfo.kers > 100) playerInfo.kers = 100;
      }
    }
  }
}

/**
 * --- FUEL HANDLING ---
 */
function handleFuel(
  p: PlayerObject,
  properties: DiscPropertiesObject,
  playerInfo: any,
  room: RoomObject
) {
  const fuelDurationMinutes = 10;
  const reductionPercent = 50;
  const refuelSeconds = 10;

  const totalFrames = fuelDurationMinutes * 60 * 60;
  const baseFuelConsumption = 100 / totalFrames;
  const refuelRate = 100 / (refuelSeconds * 60);

  if (playerInfo.prevGas === undefined) {
    playerInfo.prevGas = Math.floor(playerInfo.gas || 0);
  }

  const time = room.getScores().time;
  const isInBox = ifInBoxZone(
    { p: p, disc: room.getPlayerDiscProperties(p.id) },
    room
  );
  const isPreGame = time === 0;

  const canRefuel = properties.damping === 0.99601 && (isInBox || isPreGame);

  if (playerInfo.gas > 0 || canRefuel) {
    let fuelChange = 0;

    if (canRefuel) {
      fuelChange = -refuelRate;

      if (playerInfo.gas + -fuelChange >= 100) {
        playerInfo.gas = 0;
      } else {
        playerInfo.gas -= fuelChange;
      }
    } else if (
      time > 0 &&
      generalGameMode !== GeneralGameMode.GENERAL_QUALY &&
      !presentationLap &&
      !vsc &&
      playerInfo.tires
    ) {
      fuelChange = baseFuelConsumption;

      if (properties.damping === 0.99601) {
        fuelChange *= 1 - reductionPercent / 100;
      }

      playerInfo.gas -= fuelChange;
    }

    // Limita combustível entre 0 e 100
    if (playerInfo.gas > 100) playerInfo.gas = 100;
    if (playerInfo.gas < 0) playerInfo.gas = 0;

    // Atualiza avatar se mudou
    const currentGasInt = Math.floor(playerInfo.gas);
    if (currentGasInt !== playerInfo.prevGas) {
      room.setPlayerAvatar(p.id, String(currentGasInt));
      playerInfo.prevGas = currentGasInt;
    }
  }
}

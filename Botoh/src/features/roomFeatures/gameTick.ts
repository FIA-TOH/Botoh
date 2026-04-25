import { endRaceSession } from '../changeGameState/EndRaceSession';
import { distributeSpeed } from '../speed/distributrSpeed';
import { updateErs } from '../speed/fuel&Ers/ers';
import { checkPlayerSector } from '../zones/handleSectorChange';

import { handlePitlane } from '../tires&pits/pitLane';
import { getRunningPlayers, vectorSpeed } from '../utils';
import handleTireWear from '../tires&pits/handleTireWear';
import { handleAvatar, Situacions } from '../changePlayerState/handleAvatar';
import { playerList } from '../changePlayerState/playerList';
import { getPlayerAndDiscs } from '../playerFeatures/getPlayerAndDiscs';
import { detectDirectionChangers } from '../speed/directionChanger';
import {
  handleChangeCollisionPlayerSuzuka,
  handleChangePlayerSizeSuzuka,
} from '../zones/handleSuzukaTp';
import { afkKick } from '../afk/afk';
import { setBallPosition } from '../cameraAndBall/setBallPosition';
import { detectPitPerTick } from '../tires&pits/performPitStop';
import { detectCut } from '../detectCut/detectCut';
import { GameMode, gameMode } from '../changeGameState/changeGameModes';
import { kickIfQualyTimeEnded } from '../commands/gameMode/qualy/hardQualyFunctions';
import { checkTireStatus } from '../tires&pits/tireBlowManager';
import { mainLapCommand } from '../zones/laps/mainLapCommands';
import { checkTrainingHourlyLog } from '../counters/checkTrainingHourlyLog';
import { updateDebrisTouch } from '../debris/detectCollisionDebris';
import { handleChangeCollisionPlayerCano, handleChangePlayerSizeCano } from '../zones/handleCanoTp';
import { checkWeatherUpdate } from '../weather/weatherManager';
import { updateLeagueStartAFKDetection } from '../afk/leagueStartAFKDetection';
import { checkVSCDuration } from '../safetyCar/vsc';
import { updateNewPitSystemForPlayer } from "../tires&pits/newPitSystem/pitTickHandler";

const detectCutThrottledByPlayer: Map<number, ReturnType<typeof throttlePerSecond>> = new Map();

export let gameStarted = false;
export function setGameStarted(value: boolean) {
  gameStarted = value;
}

export function GameTick(room: RoomObject) {
  room.onGameTick = function () {
    const playersAndDiscs = getPlayerAndDiscs(room);
    const players = getRunningPlayers(playersAndDiscs);

    endRaceSession(playersAndDiscs, room);
    updateErs(playersAndDiscs, room);
    setBallPosition(room);
    checkTrainingHourlyLog();
    updateDebrisTouch(room);
    // logPlayerSpeed(playersAndDiscs, room);

    if (gameMode !== GameMode.WAITING) {
      handlePitlane(playersAndDiscs, room);
      detectDirectionChangers(playersAndDiscs, room);
      distributeSpeed(playersAndDiscs, room);
      //Avatar Updated based on direction
      // playersAndDiscs.forEach(({ p, disc }) => {
      //   updatePlayerDirection(p, disc, room);
      // });
      checkPlayerSector(playersAndDiscs, room);
      mainLapCommand(playersAndDiscs, room);
    }

    const scores = room.getScores();
    const currentTime = scores?.time || 0;

    players.forEach((pad) => {
      const p = pad.p;
      handleTireWear(p, room);
      checkTireStatus(p, room);

      handleChangePlayerSizeSuzuka(pad, room);
      handleChangePlayerSizeCano(pad, room);
      handleChangeCollisionPlayerSuzuka(pad, room);
      handleChangeCollisionPlayerCano(pad, room);
      detectPitPerTick(pad, room);

      if (!detectCutThrottledByPlayer.has(pad.p.id)) {
        detectCutThrottledByPlayer.set(pad.p.id, throttlePerSecond(detectCut, 20));
      }
      detectCutThrottledByPlayer.get(pad.p.id)!(pad, room);

      if (gameMode === GameMode.HARD_QUALY) {
        kickIfQualyTimeEnded(room, p);
      }

      updateNewPitSystemForPlayer(p, pad.disc, room, currentTime);

      // updatePreviousPos(pad, p);
    });

    afkKick(room);
    checkWeatherUpdate(room);

    updateLeagueStartAFKDetection(room);

    checkVSCDuration(room);

    if (room.getScores()?.time && room.getScores().time > 0) {
      gameStarted = true;
    }
  };
}

export function throttlePerSecond<T extends any[]>(fn: (...args: T) => void, perSecond: number) {
  const tickInterval = Math.floor(60 / perSecond);
  let tickCount = 0;

  return (...args: T) => {
    tickCount++;
    if (tickCount >= tickInterval) {
      tickCount = 0;
      fn(...args);
    }
  };
}

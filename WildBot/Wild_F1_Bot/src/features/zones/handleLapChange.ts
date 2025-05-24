import {
  CHECK_IF_TROLLING,
  checkIfTrolling,
  getRunningPlayers,
  inHitbox,
} from "../utils";
import { CIRCUITS, currentMapIndex } from "./maps";
import {
  sendAlertMessage,
  sendBestTimeRace,
  sendChatMessage,
  sendErrorMessage,
  sendSuccessMessage,
  sendWorseTime,
} from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { laps } from "./laps";
import { drsOn, enableDRS } from "./handleDRSZone";
import { rainIntensity } from "../rain/rain";
import { Teams } from "../changeGameState/teams";
import {
  bestTimes,
  getAbbreviatedTrackName,
  updateBestTime,
} from "../../circuits/bestTimes";
import { LEAGUE_MODE } from "../hostLeague/leagueMode";
import { presentationLap, printAllPositions } from "../commands/handleCommands";
import { checkBlueFlag } from "./handleSectorChange";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { PitsInfo, playerList } from "../changePlayerState/playerList";
import { Tires } from "../tires&pits/tires";
import { gameMode, GameMode } from "../changeGameState/changeGameModes";
import { updatePlayerTime } from "../changeGameState/qualy/playerTime";
import { qualiTime } from "../changeGameState/qualy/qualiMode";

export const timerController: {
  positionTimer: ReturnType<typeof setTimeout> | null;
} = {
  positionTimer: null,
};

export const lapPositions: {
  id: number;
  name: string;
  currentLap: number;
  time: number;
}[][] = [];
for (let i = 0; i < laps; i++) {
  lapPositions[i] = [];
}

export const finishList: {
  name: string;
  pits: number;
  time: number;
  fullTime: number;
}[] = [];

export const positionList: {
  name: string;
  pitsInfo: PitsInfo;
  pits: number;
  time: number;
  totalTime: number;
  lap: number;
  active: boolean;
  currentSector: number;
}[] = [];

export function updatePositionList(
  players: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  // Cria um conjunto com os nomes dos jogadores atualmente ativos na sala
  const activePlayers = new Set(players.map((player) => player.p.name));

  // Atualiza ou insere os dados de cada jogador na lista de posições
  players.forEach((player) => {
    const { p } = player;
    const playerData = playerList[p.id];

    const playerPositionIndex = positionList.findIndex(
      (entry) => entry.name === p.name
    );

    // Monta o objeto com as informações atuais do jogador
    const playerInfo = {
      name: p.name,
      pitsInfo: playerData.pits,
      pits: playerData.pits.pitsNumber,
      time: playerData.bestTime,
      totalTime: playerData.totalTime,
      lap: playerData.currentLap,
      active: true,
      currentSector: playerData.currentSector,
    };

    // Atualiza ou adiciona o jogador na lista de posições
    if (playerPositionIndex !== -1) {
      positionList[playerPositionIndex] = playerInfo;
    } else {
      positionList.push(playerInfo);
    }
  });

  // Marca como inativos os jogadores que não estão mais presentes na sala
  positionList.forEach((entry) => {
    if (!activePlayers.has(entry.name)) {
      entry.active = false;
    }
  });

  // Ordena a lista de posições com base nas voltas, setor atual e tempo total
  positionList.sort((a, b) => {
    if (a.lap === b.lap) {
      if (a.currentSector === b.currentSector) {
        return a.totalTime - b.totalTime; // quem tiver menos tempo, está na frente
      }
      return b.currentSector - a.currentSector; // quem estiver mais à frente no setor
    }
    return b.lap - a.lap; // quem completou mais voltas está na frente
  });
}

function serialize(number: number) {
  return parseFloat(number.toFixed(3));
}

function someArray(array: number[]): number {
  return array.reduce((acc, value) => acc + value, 0);
}

function ifInLapChangeZone(
  player: { p: PlayerObject; disc: DiscPropertiesObject },
  room: RoomObject
) {
  return (
    room.getScores().time > 0 &&
    inHitbox(player, CIRCUITS[currentMapIndex].info.finishLine.bounds)
  );
}

export function checkPlayerLaps(
  playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
  room: RoomObject
) {
  const players = getRunningPlayers(playersAndDiscs);
  if (presentationLap) return;
  players.forEach((pad) => {
    const playerData = playerList[pad.p.id];
    const p = pad.p;
    const hasSector = CIRCUITS[currentMapIndex].info.sectorOne;

    const now = performance.now();
    const delta = (now - playerData.lastLapTimeUpdate) / 1000;
    playerData.lapTime += delta;
    playerData.sectorTimeCounter += delta;
    playerData.lastLapTimeUpdate = now;

    // EXITING CHANGE ZONE
    if (!ifInLapChangeZone(pad, room) && playerData.lapChanged) {
      playerData.lapChanged = false;
    }

    // NOT IN CHANGE ZONE
    if (!ifInLapChangeZone(pad, room)) {
      return;
    }

    // ALREADY IN CHANGE ZONE
    if (playerData.lapChanged) {
      return;
    }

    // ENTERED CHANGE ZONE

    //CHEF IF TROLLING WITH SECTORS TOO
    if (
      CHECK_IF_TROLLING &&
      checkIfTrolling(
        pad,
        CIRCUITS[currentMapIndex].info.finishLine.passingDirection
      )
    ) {
      //IF HAS SECTORS
      if (hasSector) {
        sendErrorMessage(room, MESSAGES.TROLLING_DETECTED(), p.id);
        return;
      } else {
        sendErrorMessage(room, MESSAGES.TROLLING_DETECTED(), p.id);
        room.setPlayerTeam(p.id, 0);
        return;
      }
    }

    // Verifica se o jogador completou uma volta inteira
    // Isso acontece quando ele passou pelo setor 3, ou não há controle de setor
    if (!hasSector || (hasSector && playerData.currentSector === 3)) {
      // AQUI DETECTA NOVA VOLTA

      // RESETA KERS NO INÍCIO DA VOLTA 0
      if (playerData.currentLap === 0) {
        if (gameMode === GameMode.QUALY || playerData.tires === Tires.TRAIN) {
          playerData.kers = 100;
        }
      }

      // Aumenta o número de voltas completadas (detecta nova volta!)
      const currentLap = ++playerData.currentLap;
      playerData.lapChanged = true;

      // AQUI DETECTA A PRIMEIRA VOLTA COMPLETA
      if (currentLap > 1) {
        // Ativa o DRS na segunda volta
        if (!drsOn && currentLap == 2) enableDRS(room);

        // Serializa o tempo da volta completa
        var lapTime = serialize(playerData.lapTime);
        if (hasSector) {
          lapTime = serialize(someArray(playerData.sectorTime));
        }

        let bestTimeP = serialize(playerData.bestTime);

        const playersWithEveryoneLaps = playersAndDiscs.filter((pla) => {
          const player = playerList[pla.p?.id];
          return player && player.everyoneLaps;
        });

        const correctRainIntensity = Math.round(rainIntensity);
        const roundWear = 100 - Math.round(playerData.wear);

        // Tempo de volta do circuito atual
        const circuitBestTime: number | string =
          bestTimes[ACTUAL_CIRCUIT.info.name]?.[0] || 999.999;

        const abbreviatedTrackName = getAbbreviatedTrackName(
          ACTUAL_CIRCUIT.info.name
        );

        if (abbreviatedTrackName) {
          const circuitBestTime: number | string =
            bestTimes[abbreviatedTrackName]?.[0] || 999.999;

          if (
            typeof circuitBestTime === "number" &&
            lapTime < circuitBestTime
          ) {
            updateBestTime(ACTUAL_CIRCUIT.info.name, lapTime, p.name);
            playerData.bestTime = lapTime;
            sendBestTimeRace(
              room,
              MESSAGES.TRACK_RECORD(p.name, lapTime),
              undefined
            );
            updatePlayerTime(p.name, lapTime);
          } else if (lapTime < bestTimeP || bestTimeP === undefined) {
            playerData.bestTime = lapTime;
            playersWithEveryoneLaps.forEach((pla) => {
              sendSuccessMessage(
                room,
                MESSAGES.LAP_TIME_FROM(lapTime, p.name),
                pla.p.id
              );
            });
            sendSuccessMessage(room, MESSAGES.LAP_TIME(lapTime), p.id);
            updatePlayerTime(p.name, lapTime);
          } else {
            sendWorseTime(
              room,
              MESSAGES.WORSE_TIME(lapTime, serialize(lapTime - bestTimeP)),
              p.id
            );
            playersWithEveryoneLaps.forEach((pla) => {
              sendSuccessMessage(
                room,
                MESSAGES.LAP_TIME_FROM(lapTime, p.name),
                pla.p.id
              );
            });
          }

          // Mostra os setores caso estejam habilitados
          if (hasSector) {
            room.sendAnnouncement(
              `Sector 1: ${playerData.sectorTime[0]} | Sector 2: ${playerData.sectorTime[1]} | Sector 3: ${playerData.sectorTime[2]}`,
              p.id,
              0xff8f00
            );
          }
        } else {
          console.log(
            `Circuito ${ACTUAL_CIRCUIT.info.name} não encontrado no mapeamento de nomes.`
          );
        }

        // Informações de desgaste e chuva por volta
        sendChatMessage(
          room,
          MESSAGES.RAIN_INTENSITY_LAP(correctRainIntensity),
          pad.p.id
        );
        sendChatMessage(room, MESSAGES.TYRE_WEAR_LAP(roundWear), p.id);

        // Processamento adicional para corridas (não em qualy)
        if (gameMode !== GameMode.QUALY) {
          const lapIndex = currentLap - 2;
          const position = lapPositions[lapIndex].push({
            id: p.id,
            name: p.name,
            currentLap: currentLap,
            time: lapTime,
          });

          if (gameMode !== GameMode.TRAINING) {
            // Mostra volta atual
            if (currentLap <= laps) {
              sendChatMessage(
                room,
                MESSAGES.CURRENT_LAP(currentLap, laps),
                p.id
              );

              // Mostra posição em relação ao carro da frente
              if (position > 1) {
                const prevPlayerIndex = position - 2;
                const prevPlayer = lapPositions[lapIndex][prevPlayerIndex];

                if (prevPlayer.currentLap > currentLap) {
                  const distance = prevPlayer.currentLap - currentLap;
                  sendChatMessage(
                    room,
                    MESSAGES.POSITION_AND_DISTANCE_AHEAD(
                      position,
                      distance,
                      "laps"
                    ),
                    p.id
                  );
                } else {
                  const distance = serialize(playerList[prevPlayer.id].lapTime);
                  sendChatMessage(
                    room,
                    MESSAGES.POSITION_AND_DISTANCE_AHEAD(
                      position,
                      distance,
                      "seconds"
                    ),
                    p.id
                  );
                }
              } else {
                // Atualiza todos que estão como espectadores (não corredores)
                const playersOnSpec = playersAndDiscs.filter(
                  (pla) => pla.p.team !== Teams.RUNNERS
                );
                playersOnSpec.forEach((pla) => {
                  sendChatMessage(
                    room,
                    MESSAGES.CURRENT_LAP(currentLap, laps),
                    pla.p.id
                  );
                  printAllPositions(room, pla.p.id);
                });
              }
            } else {
              // AQUI DETECTA A ÚLTIMA VOLTA CONCLUÍDA PELO LÍDER
              if (position === 1 && !LEAGUE_MODE) {
                timerController.positionTimer = setTimeout(() => {
                  players.forEach((forEachPlayer) => {
                    room.setPlayerTeam(forEachPlayer.p.id, 0);
                  });
                  timerController.positionTimer = null;
                }, 30000);
                sendAlertMessage(room, MESSAGES.SECONDS_TO_FINISH(30));
              }

              // Cálculo de tempo total (inclusive última volta)
              const fullTime =
                lapPositions.reduce((acc, curr) => {
                  const time = curr.find((c) => c.id == p.id)?.time ?? 0;
                  return acc + time;
                }, 0) + lapTime;

              finishList.push({
                name: p.name,
                pits: playerData.pits.pitsNumber,
                time: playerData.bestTime,
                fullTime: fullTime,
              });

              sendSuccessMessage(room, MESSAGES.FINISH_RACE(), p.id);
              playerList[p.id].totalTime = room.getScores().time;
              updatePositionList(players, room);
              room.setPlayerTeam(p.id, 0);
              return;
            }
          }
        } else {
          // Encerramento automático do Qualifying
          const qualiTimeLimit = qualiTime * 60;
          if (room.getScores().time >= qualiTimeLimit) {
            sendSuccessMessage(room, MESSAGES.FINISH_QUALI(), p.id);
            room.setPlayerTeam(p.id, 0);
            return;
          }
        }
      }
      if (gameMode === GameMode.QUALY || playerData.tires === Tires.TRAIN) {
        playerData.kers = 100;
      }
      // Reseta dados da volta
      playerData.lapTime = 0;
      playerData.sectorTimeCounter = 0;
      playerData.sectorTime = [];
      playerData.currentSector = 1;
      playerList[p.id].totalTime = room.getScores().time;

      // Atualiza posição e checa bandeira azul, se for modo de corrida
      if (!(gameMode == GameMode.QUALY || gameMode == GameMode.TRAINING)) {
        updatePositionList(players, room);
        checkBlueFlag(p, room);
      }
    }
  });
}

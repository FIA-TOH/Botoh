// import { gameMode, GameMode } from "../../changeGameState/changeGameModes";
// import { updatePositionList } from "../../changeGameState/race/positionList";
// import { Teams } from "../../changeGameState/teams";
// import { playerList } from "../../changePlayerState/playerList";
// import { sendErrorMessage, sendSmallChatMessage } from "../../chat/chat";
// import { MESSAGES } from "../../chat/messages";
// import { presentationLap } from "../../commands/gameState/handlePresentationLapCommand";
// import {
//   getRunningPlayers,
//   CHECK_IF_TROLLING,
//   checkIfTrolling,
// } from "../../utils";
// import { checkBlueFlag } from "../handleSectorChange";
// import { CIRCUITS, currentMapIndex } from "../maps";
// import { ifInLapChangeZone } from "./handleLapChange";
// import { processCompletedLap } from "./processCompleteLap";
// import { resetLapData } from "./resetLapData";

// const timeOfOneTick = 1 / 60;

// export function checkPlayerLaps(
//   playersAndDiscs: { p: PlayerObject; disc: DiscPropertiesObject }[],
//   room: RoomObject
// ) {
//   if (presentationLap) return;

//   const players = getRunningPlayers(playersAndDiscs);
//   const circuit = CIRCUITS[currentMapIndex].info;
//   const hasSector = !!circuit.sectorOne;

//   // Calcular linha de chegada uma vez
//   const finishLine = circuit.finishLine.bounds;
//   const startFinishLine = Math.sqrt(
//     Math.pow(finishLine.maxX - finishLine.minX, 2) +
//       Math.pow(finishLine.maxY - finishLine.minY, 2)
//   );

//   players.forEach((pad) => {
//     const p = pad.p;
//     const playerData = playerList[p.id];
//     const position = pad.disc;

//     // Armazenar posição anterior para cálculos de interpolação
//     if (
//       playerData.previousX === undefined ||
//       playerData.previousY === undefined
//     ) {
//       playerData.previousX = position.x;
//       playerData.previousY = position.y;
//     }

//     // Timing normal (como você já faz)
//     const now = performance.now();
//     const delta = (now - playerData.lastLapTimeUpdate) / 1000;
//     playerData.lapTime += delta;
//     playerData.sectorTimeCounter += delta;
//     playerData.lastLapTimeUpdate = now;

//     if (!ifInLapChangeZone(pad, room)) {
//       playerData.lapChanged = false;
//       // Atualizar posição anterior
//       playerData.previousX = position.x;
//       playerData.previousY = position.y;
//       return;
//     }

//     // DEBUG: Log para verificar se está detectando a zona
//     console.log(
//       `Jogador ${p.name} na zona de mudança de volta - Lap: ${playerData.currentLap}, Setor: ${playerData.currentSector}`
//     );

//     // Se já processou a mudança de volta neste tick, pular
//     if (playerData.lapChanged) {
//       console.log(`Jogador ${p.name} - lapChanged já é true, pulando...`);
//       playerData.previousX = position.x;
//       playerData.previousY = position.y;
//       return;
//     }

//     if (room.getScores().time === 0) {
//       sendErrorMessage(room, MESSAGES.EARLY_LAP_ERROR(), p.id);
//       playerData.previousX = position.x;
//       playerData.previousY = position.y;
//       return;
//     }

//     if (
//       CHECK_IF_TROLLING &&
//       checkIfTrolling(pad, circuit.finishLine.passingDirection)
//     ) {
//       sendErrorMessage(room, MESSAGES.TROLLING_DETECTED(), p.id);
//       if (!hasSector) room.setPlayerTeam(p.id, Teams.SPECTATORS);
//       playerData.previousX = position.x;
//       playerData.previousY = position.y;
//       return;
//     }

//     // Remover o || true temporário e usar lógica correta
//     const completedLap =
//       !hasSector ||
//       playerData.currentSector === 3 ||
//       playerData.currentLap === 0;
//     console.log(
//       `Jogador ${p.name} - hasSector: ${hasSector}, currentSector: ${playerData.currentSector}, currentLap: ${playerData.currentLap}, completedLap: ${completedLap}`
//     );

//     if (!completedLap) {
//       console.log(`Jogador ${p.name} - Volta não completa, pulando...`);
//       playerData.previousX = position.x;
//       playerData.previousY = position.y;
//       return;
//     }

//     // MARCAR QUE A VOLTA FOI PROCESSADA ANTES DE FAZER QUALQUER COISA
//     playerData.lapChanged = true;

//     // Mostrar mensagem apenas na primeira volta
//     if (playerData.currentLap === 0) {
//       if (gameMode === GameMode.RACE || gameMode === GameMode.INDY) {
//         sendSmallChatMessage(room, MESSAGES.STARTING_LAP(), p.id);
//       } else if (gameMode === GameMode.QUALY) {
//         sendSmallChatMessage(room, MESSAGES.STARTING_QUALY_LAP(), p.id);
//       }
//     }

//     // === PROCESSAR SETOR 3 SE EXISTE SETOR ===
//     if (hasSector && playerData.currentSector === 3) {
//       // Calcular tempo preciso do setor 3 (último setor)
//       let additionalTime = 0;

//       if (
//         playerData.previousX !== undefined &&
//         playerData.previousY !== undefined
//       ) {
//         try {
//           const minX = finishLine.minX;
//           const minY = finishLine.minY;
//           const maxX = finishLine.maxX;
//           const maxY = finishLine.maxY;

//           let currentPreviousSide = Math.sqrt(
//             Math.pow(position.x - playerData.previousX, 2) +
//               Math.pow(position.y - playerData.previousY, 2)
//           );

//           let bottomCornerCurrentSide = Math.sqrt(
//             Math.pow(position.x - minX, 2) + Math.pow(position.y - maxY, 2)
//           );

//           let bottomCornerPreviousSide = Math.sqrt(
//             Math.pow(playerData.previousX - minX, 2) +
//               Math.pow(playerData.previousY - maxY, 2)
//           );

//           let upperCornerCurrentSide = Math.sqrt(
//             Math.pow(position.x - maxX, 2) + Math.pow(position.y - minY, 2)
//           );

//           if (currentPreviousSide > 0 && bottomCornerCurrentSide > 0) {
//             let anglecurrentPreviousSideBottomCornerCurrentSide =
//               Math.acos(
//                 Math.min(
//                   1,
//                   Math.max(
//                     -1,
//                     (Math.pow(currentPreviousSide, 2) +
//                       Math.pow(bottomCornerCurrentSide, 2) -
//                       Math.pow(bottomCornerPreviousSide, 2)) /
//                       (2 * currentPreviousSide * bottomCornerCurrentSide)
//                   )
//                 )
//               ) *
//               (180 / Math.PI);

//             let anglestartFinishLineBottomCornerCurrentSide =
//               Math.acos(
//                 Math.min(
//                   1,
//                   Math.max(
//                     -1,
//                     (Math.pow(bottomCornerCurrentSide, 2) +
//                       Math.pow(startFinishLine, 2) -
//                       Math.pow(upperCornerCurrentSide, 2)) /
//                       (2 * bottomCornerCurrentSide * startFinishLine)
//                   )
//                 )
//               ) *
//               (180 / Math.PI);

//             let remainingAngle =
//               180 -
//               anglecurrentPreviousSideBottomCornerCurrentSide -
//               anglestartFinishLineBottomCornerCurrentSide;

//             if (Math.sin((remainingAngle * Math.PI) / 180) !== 0) {
//               let positionStartFinishLineSide =
//                 (bottomCornerCurrentSide *
//                   Math.sin(
//                     (anglestartFinishLineBottomCornerCurrentSide * Math.PI) /
//                       180
//                   )) /
//                 Math.sin((remainingAngle * Math.PI) / 180);

//               additionalTime =
//                 (timeOfOneTick / currentPreviousSide) *
//                 positionStartFinishLineSide;
//             }
//           }
//         } catch (error) {
//           console.error("Erro no cálculo de timing preciso do setor 3:", error);
//         }
//       }

//       // Calcular e salvar tempo preciso do setor 3
//       const preciseSector3Time = playerData.sectorTimeCounter - additionalTime;
//       playerData.sectorTime[2] = parseFloat(preciseSector3Time.toFixed(3));

//       room.sendAnnouncement(
//         `Sector 3: ${playerData.sectorTime[2]}s`,
//         p.id,
//         0xff8f00
//       );
//     }

//     const currentLap = ++playerData.currentLap;

//     if (currentLap > 1) {
//       // === CÁLCULO DE TIMING PRECISO DA VOLTA (Método do Pijus) ===
//       let additionalTime = 0;

//       if (
//         playerData.previousX !== undefined &&
//         playerData.previousY !== undefined
//       ) {
//         try {
//           const minX = finishLine.minX;
//           const minY = finishLine.minY;
//           const maxX = finishLine.maxX;
//           const maxY = finishLine.maxY;

//           let currentPreviousSide = Math.sqrt(
//             Math.pow(position.x - playerData.previousX, 2) +
//               Math.pow(position.y - playerData.previousY, 2)
//           );

//           let bottomCornerCurrentSide = Math.sqrt(
//             Math.pow(position.x - minX, 2) + Math.pow(position.y - maxY, 2)
//           );

//           let bottomCornerPreviousSide = Math.sqrt(
//             Math.pow(playerData.previousX - minX, 2) +
//               Math.pow(playerData.previousY - maxY, 2)
//           );

//           let upperCornerCurrentSide = Math.sqrt(
//             Math.pow(position.x - maxX, 2) + Math.pow(position.y - minY, 2)
//           );

//           if (currentPreviousSide > 0 && bottomCornerCurrentSide > 0) {
//             let anglecurrentPreviousSideBottomCornerCurrentSide =
//               Math.acos(
//                 Math.min(
//                   1,
//                   Math.max(
//                     -1,
//                     (Math.pow(currentPreviousSide, 2) +
//                       Math.pow(bottomCornerCurrentSide, 2) -
//                       Math.pow(bottomCornerPreviousSide, 2)) /
//                       (2 * currentPreviousSide * bottomCornerCurrentSide)
//                   )
//                 )
//               ) *
//               (180 / Math.PI);

//             let anglestartFinishLineBottomCornerCurrentSide =
//               Math.acos(
//                 Math.min(
//                   1,
//                   Math.max(
//                     -1,
//                     (Math.pow(bottomCornerCurrentSide, 2) +
//                       Math.pow(startFinishLine, 2) -
//                       Math.pow(upperCornerCurrentSide, 2)) /
//                       (2 * bottomCornerCurrentSide * startFinishLine)
//                   )
//                 )
//               ) *
//               (180 / Math.PI);

//             let remainingAngle =
//               180 -
//               anglecurrentPreviousSideBottomCornerCurrentSide -
//               anglestartFinishLineBottomCornerCurrentSide;

//             if (Math.sin((remainingAngle * Math.PI) / 180) !== 0) {
//               let positionStartFinishLineSide =
//                 (bottomCornerCurrentSide *
//                   Math.sin(
//                     (anglestartFinishLineBottomCornerCurrentSide * Math.PI) /
//                       180
//                   )) /
//                 Math.sin((remainingAngle * Math.PI) / 180);

//               additionalTime =
//                 (timeOfOneTick / currentPreviousSide) *
//                 positionStartFinishLineSide;
//             }
//           }
//         } catch (error) {
//           console.error("Erro no cálculo de timing preciso da volta:", error);
//           additionalTime = 0;
//         }
//       }

//       // Aplicar o tempo mais preciso
//       const scores = room.getScores();
//       const accurateTotalTime =
//         scores.time - additionalTime - playerData.startLapTime;

//       // Usar o tempo preciso para processCompletedLap
//       processCompletedLap(pad, room, hasSector, accurateTotalTime);
//     }

//     resetLapData(playerData, p.id, room);

//     if (gameMode !== GameMode.QUALY && gameMode !== GameMode.TRAINING) {
//       updatePositionList(players, room);
//       checkBlueFlag(p, room);
//     }

//     // Atualizar posição anterior
//     playerData.previousX = position.x;
//     playerData.previousY = position.y;
//   });
// }

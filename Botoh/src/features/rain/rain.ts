// import { roomPromise } from "../../room";
// import { handleAvatar, Situacions } from "../changePlayerState/handleAvatar";
// import { sendAlertMessage } from "../chat/chat";
// import { laps } from "../zones/laps";
// import { MESSAGES } from "../chat/messages";
// import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
// import { log } from "../discord/logger";

// // Variáveis globais para armazenar o estado da chuva, os intervalos e o estado do jogo
// export let rainEnabled = false;
// export let rainChance = 0;
// export let rainIntensity = 0;
// export let rainStartTime: number = 0;
// export let rainStopTime: number = 0;
// export let isRaining = false;
// let rainStartAnnounced = false;
// let rainStopAnnounced = false;
// let announcementTime = 0;
// let stopAnnouncementTime = 0;

// let rainStartTimeout: number | null;
// let announcementTimeout: number | null;

// let rainStopTimeout: number | null;
// let stopAnnouncementTimeout: number | null;

// let rainIntensityInterval: NodeJS.Timeout | null = null;

// let peakIntensity = 0;

// // Função para definir as chances de chuva e iniciar o processo de decisão
// export function setRainChances(chances: number) {
//   log(`Chances de chuva definidas: ${chances}%`);
//   rainChance = chances;

//   decideRainEvents(chances);

//   rainEnabled = true;
// }

// export function setRainItensity(intensity: number) {
//   log(`Rain intensity defined to: ${intensity}%`);
//   resetAllRainEvents();
//   rainIntensity = intensity;
//   if (intensity != 0) {
//     rainEnabled = true;
//     isRaining = true;
//   } else {
//     rainEnabled = false;
//     isRaining = false;
//   }
// }

// // Função para decidir se vai chover, quando a chuva vai parar e se vai voltar
// function decideRainEvents(chances: number) {
//   // Decide se vai chover
//   let willRain = Math.random() * 100 < chances;
//   if (!willRain) {
//     log("Não vai chover.");
//     return;
//   }

//   const rainPeak = Math.random() * (rainChance + 20) + 10;
//   peakIntensity = Math.min(100, rainPeak);

//   log("picos ", rainPeak, peakIntensity);

//   // Define em qual volta a chuva vai começar (após a volta 2 e na primeira metade das voltas)
//   let rainLap = Math.floor(Math.random() * (laps / 2 - 1)) + 2;
//   log(`Vai chover na volta ${rainLap}`);

//   const defaultBestTime = 999.999;
//   const bestTime =
//     (ACTUAL_CIRCUIT.info &&
//       ACTUAL_CIRCUIT.info.BestTime &&
//       ACTUAL_CIRCUIT.info.BestTime[0]) ??
//     defaultBestTime;
//   const lapTime =
//     typeof bestTime === "number" && bestTime !== defaultBestTime
//       ? bestTime + 1.0
//       : 40.0;

//   // Calcular o tempo para iniciar a chuva (em milissegundos)
//   rainStartTime = lapTime * rainLap * 1000;

//   announcementTime = rainStartTime - 60000; // A chuva começa 60 segundos após o anúncio

//   log(
//     `A chuva vai começar em ${rainStartTime / 1000} segundos (${
//       rainStartTime / 60000
//     } minutos)`
//   );
//   log(
//     `Tempo de anúncio configurado para ${announcementTime / 1000} segundos (${
//       announcementTime / 60000
//     } minutos)`
//   );

//   // Iniciar o temporizador para o anúncio
//   startAnnouncementTimer();

//   // Decide se a chuva vai parar
//   let rainStopChance = 100 - chances;
//   let willRainStop = Math.random() * 100 < rainStopChance;

//   if (!willRainStop) {
//     log("Não vai parar de chover.");
//     return;
//   }

//   // Define em qual volta a chuva vai parar (pelo menos 3 voltas após o início da chuva)
//   let stopLap =
//     Math.floor(Math.random() * (laps - Math.min(rainLap + 3, laps) + 1)) +
//     Math.min(rainLap + 3, laps);

//   rainStopTime = lapTime * stopLap * 1000;
//   stopAnnouncementTime = rainStopTime - 60000;

//   log(`A chuva vai parar na volta ${stopLap}`);
//   log(
//     `Tempo de anúncio pararChuva configurado para ${
//       stopAnnouncementTime / 1000
//     } segundos (${stopAnnouncementTime / 60000} minutos)`
//   );
//   log(
//     `A chuva vai parar em ${rainStopTime / 1000} segundos (${
//       rainStopTime / 60000
//     } minutos)`
//   );

//   // Iniciar o temporizador para o anúncio
//   stopAnnouncementTimer();
// }

// // Função para iniciar o temporizador para o anúncio da chuva
// function startAnnouncementTimer() {
//   if (announcementTime === undefined) {
//     log("announcementTime não está definido.");
//     return;
//   }

//   let rainStartTimeAnnounce = room.getScores().time ?? 0;

//   const checkAnnouncement = () => {
//     const currentTime = room.getScores().time ?? 0;
//     if (currentTime - rainStartTimeAnnounce >= announcementTime / 1000) {
//       announceRainStart();
//       startRainStartTimer();
//     } else {
//       setTimeout(checkAnnouncement, 1000); // Verifica novamente em 1 segundo
//     }
//   };
//   checkAnnouncement();
// }

// function startRainStartTimer() {
//   const rainStartTimeAnnounce = room.getScores().time ?? 0;
//   const checkRainStart = () => {
//     const currentTime = room.getScores().time ?? 0;
//     if (currentTime - rainStartTimeAnnounce >= 60) {
//       startRain();
//     } else {
//       setTimeout(checkRainStart, 1000); // Verifica novamente em 1 segundo
//     }
//   };
//   checkRainStart();
// }

// // Funções fictícias para exemplificar o funcionamento
// function announceRainStart() {
//   let players = room.getPlayerList();

//   if (!rainStartAnnounced) {
//     log("🌧️ A chuva vai começar em 1 minuto! 🌧️");
//     isRaining = true;
//     rainIntensity = 10;
//     sendAlertMessage(room, MESSAGES.RAIN_ONE_MINUTE());
//     rainStartAnnounced = true;

//     players.forEach((player) => {
//       const rainEmojis = ["☁️", "🌧️", "⛔"];
//       const rainDurations = [2000, 2000, 2000];
//       handleAvatar(
//         Situacions.Rain,
//         player,
//         room,
//         undefined,
//         rainEmojis,
//         rainDurations
//       );
//     });
//   }
// }

// function startRain() {
//   let players = room.getPlayerList();

//   rainStartAnnounced = false;
//   log("🌧️ A chuva começou! 🌧️");

//   players.forEach((player) => {
//     const rainEmojis = ["🌧️", "🌩️", "⛔"];
//     const rainDurations = [2000, 2000, 2000];
//     handleAvatar(
//       Situacions.Rain,
//       player,
//       room,
//       undefined,
//       rainEmojis,
//       rainDurations
//     );
//   });

//   // Anúncios com atraso
//   setTimeout(() => {
//     sendAlertMessage(room, MESSAGES.RAIN_STARTING_IN(3));
//   }, 0);

//   setTimeout(() => {
//     sendAlertMessage(room, MESSAGES.RAIN_STARTING_IN(2));
//   }, 1000); // Anúncio após 1 segundo

//   setTimeout(() => {
//     sendAlertMessage(room, MESSAGES.RAIN_STARTING_IN(1));
//   }, 2000); // Anúncio após 2 segundos

//   setTimeout(() => {
//     rainStartAnnounced = true;
//     sendAlertMessage(room, MESSAGES.RAIN_STARTED());
//     startRainIntensityMonitor(rainChance, rainStartTime, rainStopTime, room);

//     log("🌧️ A chuva começou! 🌧️");
//   }, 3000); // Anúncio final após 3 segundos
// }

// function stopAnnouncementTimer() {
//   if (stopAnnouncementTime === undefined) {
//     log("stopAnnouncementTime não está definido.");
//     return;
//   }

//   let rainStopTimeAnnouce = room.getScores().time ?? 0;
//   const checkStopAnnouncement = () => {
//     const currentTime = room.getScores().time ?? 0;
//     if (currentTime - rainStopTimeAnnouce >= stopAnnouncementTime / 1000) {
//       announceRainStop();
//       stopRainStopTimer();
//     } else {
//       setTimeout(checkStopAnnouncement, 1000); // Verifica novamente em 1 segundo
//     }
//   };
//   checkStopAnnouncement();
// }

// function stopRainStopTimer() {
//   const rainStopTime = room.getScores().time ?? 0;
//   const checkRainStop = () => {
//     const currentTime = room.getScores().time ?? 0;
//     if (currentTime - rainStopTime >= 60) {
//       stopRain();
//     } else {
//       setTimeout(checkRainStop, 1000); // Verifica novamente em 1 segundo
//     }
//   };
//   checkRainStop();
// }

// function announceRainStop() {
//   let players = room.getPlayerList();

//   if (!rainStopAnnounced) {
//     log("🌦️ A chuva vai parar em 1 minuto! 🌦️");
//     rainIntensity = 10;
//     sendAlertMessage(room, MESSAGES.RAIN_STOP_ONE_MINUTE());
//     players.forEach((player) => {
//       const rainEmojis = ["🌧️", "🌤️", "⛔"];
//       const rainDurations = [2000, 2000, 2000];
//       handleAvatar(
//         Situacions.Rain,
//         player,
//         room,
//         undefined,
//         rainEmojis,
//         rainDurations
//       );
//     });

//     rainStopAnnounced = true;
//   }
// }

// function stopRain() {
//   let players = room.getPlayerList();
//   rainStopAnnounced = false;

//   players.forEach((player) => {
//     const rainEmojis = ["🌤️", "☀️", "⛔"];
//     const rainDurations = [2000, 2000, 20000];
//     handleAvatar(
//       Situacions.Rain,
//       player,
//       room,
//       undefined,
//       rainEmojis,
//       rainDurations
//     );
//   });

//   // Anúncios com atraso
//   setTimeout(() => {
//     sendAlertMessage(room, MESSAGES.RAIN_STOPING_IN(3));
//   }, 0); // Anúncio inicial imediatamente

//   setTimeout(() => {
//     sendAlertMessage(room, MESSAGES.RAIN_STOPING_IN(2));
//   }, 1000); // Anúncio após 1 segundo

//   setTimeout(() => {
//     sendAlertMessage(room, MESSAGES.RAIN_STOPING_IN(1));
//   }, 2000); // Anúncio após 2 segundos

//   setTimeout(() => {
//     isRaining = false;
//     rainEnabled = false;
//     rainStopAnnounced = true;
//     sendAlertMessage(room, MESSAGES.RAIN_STOPPED());
//     stopRainIntensityMonitor();
//     log("☀️ A chuva parou! ☀️");
//   }, 3000); // Anúncio final após 3 segundos
// }

// export function calculateRainIntensity(
//   rainChance: number,
//   rainStartTime: number,
//   rainStopTime: number | null,
//   roomObject: RoomObject
// ) {
//   const currentTime = roomObject.getScores().time * 1000;

//   // Calcula a duração da chuva, considerando infinito se rainStopTime for null ou 0
//   const rainDuration = rainStopTime ? rainStopTime - rainStartTime : 60000 * 5;

//   const progressiveTime = rainStopTime ? rainDuration / 4 : 60000 * 2;
//   const peakTime = rainStopTime ? rainDuration / 2 : Infinity;

//   const relativeTime = currentTime - rainStartTime;

//   // log(currentTime, rainDuration, progressiveTime, peakTime, relativeTime, peakIntensity);

//   if (relativeTime <= progressiveTime) {
//     const progressFraction = relativeTime / progressiveTime;

//     rainIntensity = 10 + progressFraction * (peakIntensity - 10);
//   } else if (relativeTime <= progressiveTime + peakTime || !rainStopTime) {
//     rainIntensity = peakIntensity;
//   } else if (relativeTime <= rainDuration) {
//     const decreassiveTime = rainDuration / 4;
//     const decreassiveFraction =
//       (relativeTime - progressiveTime - peakTime) / decreassiveTime;
//     rainIntensity = peakIntensity - decreassiveFraction * (peakIntensity - 10);
//   }

//   return Math.max(10, Math.min(100, rainIntensity));
// }

// // Função para iniciar o monitoramento da intensidade da chuva
// function startRainIntensityMonitor(
//   rainChance: number,
//   rainStartTime: number,
//   rainStopTime: number | null,
//   roomObject: RoomObject
// ) {
//   if (rainIntensityInterval) {
//     clearInterval(rainIntensityInterval);
//   }

//   rainIntensityInterval = setInterval(() => {
//     const currentTime = roomObject.getScores().time * 1000;

//     if (
//       currentTime >= rainStartTime &&
//       (!rainStopTime || currentTime <= rainStopTime)
//     ) {
//       const intensity = calculateRainIntensity(
//         rainChance,
//         rainStartTime,
//         rainStopTime,
//         roomObject
//       );
//       rainIntensity = intensity;

//       // Mensagens específicas para intensidades-chave
//       if ([30, 50, 70, 90].includes(Math.round(intensity))) {
//         sendAlertMessage(
//           room,
//           MESSAGES.RAIN_INTENSITY_LAP(Math.round(intensity))
//         );
//       }
//     } else if (rainStopTime && currentTime > rainStopTime) {
//       // Parar o monitoramento se a chuva acabar
//       stopRainIntensityMonitor();
//     }
//   }, 1000); // Atualiza a cada 1 segundo
// }

// function stopRainIntensityMonitor() {
//   if (rainIntensityInterval) {
//     clearInterval(rainIntensityInterval);
//     rainIntensityInterval = null;
//     log("Rain intensity monitor stopped.");
//   }
// }

// export function resetAllRainEvents() {
//   // Se a chuva não começou, não reinicie o ciclo de avisos
//   // Resetar variáveis de intensidade e chances de chuva
//   rainIntensity = 0;
//   peakIntensity = 0;
//   rainStartTime = 0;
//   rainStopTime = 0;
//   rainEnabled = false;
//   rainChance = 0;
//   // Resetar variáveis relacionadas à chuva
//   isRaining = false;
//   rainStartAnnounced = false;
//   rainStopAnnounced = false;

//   if (!isRaining) {
//     // Parar os temporizadores de anúncio de início e de início da chuva
//     if (announcementTimeout) {
//       clearTimeout(announcementTimeout);
//       announcementTimeout = null;
//     }

//     if (rainStartTimeout) {
//       clearTimeout(rainStartTimeout);
//       rainStartTimeout = null;
//     }

//     // Não altere o estado do anúncio de início da chuva
//     rainStartAnnounced = false;
//     rainStopAnnounced = false;
//   } else {
//     // Se a chuva começou, pare os temporizadores de parada e de intensidade
//     if (stopAnnouncementTimeout) {
//       clearTimeout(stopAnnouncementTimeout);
//       stopAnnouncementTimeout = null;
//     }

//     if (rainStopTimeout) {
//       clearTimeout(rainStopTimeout);
//       rainStopTimeout = null;
//     }
//   }

//   // Parar o monitoramento de intensidade
//   stopRainIntensityMonitor();
// }

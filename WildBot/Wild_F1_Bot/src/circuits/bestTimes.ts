import { log } from "../features/discord/logger";

// Mapeamento dos nomes abreviados para os nomes completos
const trackNameMapping: { [key: string]: string } = {
  melbourne: "Albert-Park Melbourne Circuit - By Ximb",
  imola: "Autodromo Imola - By Ximb",
  sepang: "Sepang F1 International Circuit - By Ximb",
  bahrein: "Sakhir Bahrain International Circuit - By Ximb",
  sochi: "Sochi Autodrom - By Ximb",
  monaco: "Circuit de Monaco - By Ximb",
  valencia: "Valencia Street Circuit - By Ximb",
  paulRicard: "Paul Ricard Circuit - By Ximb",
  silverstone: "Silverstone Circuit - By Ximb",
  spa: "Spa-Francorchamps - By Ximb",
  istanbul: "İstanbul Park - By Ximb",
  nurburgring: "Aramco Grosser Preis der Eifel - By Ximb",
  monza: "Autodromo Nazionale di Monza - By Ximb",
  canada: "Circuit Gilles Villeneuve - By Ximb",
  austin: "United States Grand Prix - By Ximb",
  shanghai: "Shanghai International Circuit - By Ximb",
  suzuka: "Suzuka International Circuit - By Ximb",
  interlagos: "Autodromo Interlagos - By Ximb",
  baku: "Baku City Circuit - By Ximb",
  argentina: "Autódromo Oscar Alfredo Gálvez - By Ximb",
  marinaBay: "Marina Bay Street Circuit - By Ximb",
  jeddah: "Jeddah Street Circuit - By Ximb",
  yasMarina: "Yas Marina Circuit - By Ximb",
  hockenheimring: "Hockenheimring - By Ximb",
  fuji: "Fuji International - By Ximb",
  hungaroing: "Hungaroring - By Ximb",
  mexico: "Mexico City - Autodromo Hermanos Rodriquez By Ximb",
  austria: "Redbull Ring MGP by Rodri",
  laguna_seca: "Laguna Seca by Rodri",
  balaton: "Balaton Park by Rodri",
  nurburgringNano: "Nurburgring GP By Nanoseb",
  hungaroingNano: "hungaroring By Nanoseb",
  indianapolis: "Indianapolis Motor Speedway - By Ximb",
  miami: "Miami by Rodri",
};

// Atualizando o objeto bestTimes com os nomes completos
export const bestTimes: { [key: string]: [number, string, string] } = {
  melbourne: [27.6, "Lando Canorris", trackNameMapping["melbourne"]],
  imola: [31.867, "Lib Wallard", trackNameMapping["imola"]],
  sepang: [49.65, "Lib Wallard ", trackNameMapping["sepang"]],
  bahrein: [32.884, "Alberto Ulasscari", trackNameMapping["bahrein"]],
  sochi: [40.15, "Alberto Ulasscari", trackNameMapping["sochi"]],
  monaco: [34.467, "Alberto Ulasscari", trackNameMapping["monaco"]],
  valencia: [44.433, "Alberto Ulasscari", trackNameMapping["valencia"]],
  paulRicard: [42.567, "Ximbastian Vettel", trackNameMapping["paulRicard"]],
  silverstone: [41.483, "Alberto Ulasscari", trackNameMapping["silverstone"]],
  spa: [51.1, "Alberto Ulasscari", trackNameMapping["spa"]],
  istanbul: [34.483, "Artistic", trackNameMapping["istanbul"]],
  nurburgring: [39.433, "HiroShiryu Fushida", trackNameMapping["nurburgring"]],
  monza: [45.933, "Alberto Ulasscari", trackNameMapping["monza"]],
  canada: [37.716, "Alberto Ulasscari", trackNameMapping["canada"]],
  austin: [49.783, "Franco ColaSplinter", trackNameMapping["austin"]],
  shanghai: [999.999, "Jean Dany Vergne", trackNameMapping["shanghai"]],
  suzuka: [999.999, "Ximbastian Vettel", trackNameMapping["suzuka"]],
  interlagos: [33.3, "Lando Canorris", trackNameMapping["interlagos"]],
  baku: [46.749, "Alberto Ulasscari", trackNameMapping["baku"]],
  argentina: [42.467, "HiroShiryu Fushida", trackNameMapping["argentina"]],
  marinaBay: [48.717, "Ximbastian Vettel", trackNameMapping["marinaBay"]],
  jeddah: [43.433, "HiroShiryu Fushida", trackNameMapping["jeddah"]],
  yasMarina: [39.733, "HiroShiryu Fushida", trackNameMapping["yasMarina"]],
  hockenheimring: [
    39.233,
    "Jean Dany-Vegne",
    trackNameMapping["hockenheimring"],
  ],
  fuji: [37.183, "Ximbastian Vettel", trackNameMapping["fuji"]],
  hungaroing: [37.617, "Jean Dany-Vegne", trackNameMapping["hungaroing"]],
  mexico: [38.383, "Samuel Bortoleto", trackNameMapping["mexico"]],
  austria: [30.916, "Jean Dany Vegne", trackNameMapping["austria"]],
  laguna_seca: [34.816, "Jean Dany Vergne", trackNameMapping["laguna_seca"]],
  balaton: [999.999, "undefined", trackNameMapping["balaton"]],
  nurburgringNano: [999.999, "undefined", trackNameMapping["nurburgringNano"]],
  hungaroingNano: [999.999, "undefined", trackNameMapping["hungaroingNano"]],
  indianapolis: [30.5, "Gabriel Schumacchio", trackNameMapping["indianapolis"]],
  miami: [999.999, "undefined", trackNameMapping["miami"]],
};
// Função para converter nome completo para abreviado
export const getAbbreviatedTrackName = (
  fullTrackName: string
): string | undefined => {
  return Object.keys(trackNameMapping).find(
    (key) => trackNameMapping[key] === fullTrackName
  );
};

export const getBestTime = (
  trackName: string,
  room: RoomObject,
  byPlayer: PlayerObject
) => {
  const abbreviatedTrackName = getAbbreviatedTrackName(trackName) || trackName;

  if (trackNameMapping.hasOwnProperty(abbreviatedTrackName)) {
    const bestTime = bestTimes[abbreviatedTrackName][0];
    const driver = bestTimes[abbreviatedTrackName][1];

    if (bestTime && driver) {
      room.sendAnnouncement(`Record: ${bestTime} - ${driver}`, byPlayer.id);
      return;
    }
    return;
  }
};

// Atualizando a função para usar o nome completo
export const updateBestTime = (
  trackName: string,
  newTime: number,
  driverName: string
) => {
  // Se o nome completo for passado, tenta obter o nome abreviado
  const abbreviatedTrackName = getAbbreviatedTrackName(trackName) || trackName;

  if (trackNameMapping.hasOwnProperty(abbreviatedTrackName)) {
    const currentBestTime = bestTimes[abbreviatedTrackName][0];

    // Só atualiza se o tempo atual for maior que o novo tempo ou se for indefinido (999.999)
    if (currentBestTime === 999.999 || newTime < currentBestTime) {
      const circuitName = trackNameMapping[abbreviatedTrackName]; // Usa o nome completo da pista
      bestTimes[abbreviatedTrackName] = [newTime, driverName, circuitName];
    } else {
    }
  } else {
    log(`A pista ${abbreviatedTrackName} não foi encontrada no mapeamento.`);
  }
};

export const clearBestTime = (
  trackName: string,
  newTime: number,
  driverName: string
) => {
  // Se o nome completo for passado, tenta obter o nome abreviado
  const abbreviatedTrackName = getAbbreviatedTrackName(trackName) || trackName;

  if (trackNameMapping.hasOwnProperty(abbreviatedTrackName)) {
    const circuitName = trackNameMapping[abbreviatedTrackName]; // Usa o nome completo da pista
    bestTimes[abbreviatedTrackName] = [newTime, driverName, circuitName];
  } else {
    log(`A pista ${abbreviatedTrackName} não foi encontrada no mapeamento.`);
  }
};

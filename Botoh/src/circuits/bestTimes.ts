import { log } from "../features/discord/logger";

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
  argentina: "Autodromo Oscar Alfredo Galvez - By Ximb",
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
  las_vegas: "Las Vegas Strip Circuit - By Ximb",
  zandvoort: "Zandvoort by Rodri",
  barcelona: "Circuit de Barcelona-Catalunya by Rodri",
};

export const bestTimes: { [key: string]: [number, string, string] } = {
  melbourne: [27.6, "Lando Canorris", trackNameMapping["melbourne"]],
  imola: [31.867, "Lib Wallard", trackNameMapping["imola"]],
  sepang: [49.65, "Lib Wallard ", trackNameMapping["sepang"]],
  bahrein: [32.884, "Alberto Ulasscari", trackNameMapping["bahrein"]],
  sochi: [40.15, "Alberto Ulasscari", trackNameMapping["sochi"]],
  monaco: [34.442, "Liberty", trackNameMapping["monaco"]],
  valencia: [44.433, "Alberto Ulasscari", trackNameMapping["valencia"]],
  paulRicard: [42.567, "Ximbastian Vettel", trackNameMapping["paulRicard"]],
  silverstone: [41.483, "Alberto Ulasscari", trackNameMapping["silverstone"]],
  spa: [51.1, "Alberto Ulasscari", trackNameMapping["spa"]],
  istanbul: [34.483, "Artistic", trackNameMapping["istanbul"]],
  nurburgring: [39.433, "HiroShiryu Fushida", trackNameMapping["nurburgring"]],
  monza: [45.933, "Alberto Ulasscari", trackNameMapping["monza"]],
  canada: [37.716, "Alberto Ulasscari", trackNameMapping["canada"]],
  austin: [49.783, "Franco ColaSplinter", trackNameMapping["austin"]],
  shanghai: [44.101, "Franco ColaSplinter", trackNameMapping["shanghai"]],
  suzuka: [39.35, "Franco ColaSplinter", trackNameMapping["suzuka"]],
  interlagos: [36.3, "Franco ColaSplinter", trackNameMapping["interlagos"]],
  baku: [46.749, "Alberto Ulasscari", trackNameMapping["baku"]],
  argentina: [43.025, "Franco ColaSplinter", trackNameMapping["argentina"]],
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
  mexico: [37.603, "Ximbastian Vettel", trackNameMapping["mexico"]],
  austria: [30.916, "Jean Dany Vegne", trackNameMapping["austria"]],
  laguna_seca: [34.331, "Cano", trackNameMapping["laguna_seca"]],
  balaton: [39.081, "Rodri", trackNameMapping["nurburgringNano"]],
  hungaroingNano: [999.999, "undefined", trackNameMapping["hungaroingNano"]],
  indianapolis: [30.5, "Gabriel Schumacchio", trackNameMapping["indianapolis"]],
  miami: [43.05, "Ximbastian Vettel", trackNameMapping["miami"]],
  las_vegas: [43.569, "Ximbastian Vettel", "Las Vegas Strip Circuit - By Ximb"],
  zandvoort: [37.358, "Ximbastian Vettel", "Zandvoort by Rodri"],
  barcelona: [
    37.7,
    "Ximbastian Vettel",
    "Circuit de Barcelona-Catalunya by Rodri",
  ],
};
export const getAbbreviatedTrackName = (
  fullTrackName: string
): string | undefined => {
  return Object.keys(trackNameMapping).find(
    (key) => trackNameMapping[key] === fullTrackName
  );
};

export const getBestTime = (
  trackName: string
): [number, string, string] | null => {
  const abbreviatedTrackName = getAbbreviatedTrackName(trackName) || trackName;

  if (trackNameMapping.hasOwnProperty(abbreviatedTrackName)) {
    return bestTimes[abbreviatedTrackName];
  }

  return null;
};

export const updateBestTime = (
  trackName: string,
  newTime: number,
  driverName: string
) => {
  const abbreviatedTrackName = getAbbreviatedTrackName(trackName) || trackName;

  if (trackNameMapping.hasOwnProperty(abbreviatedTrackName)) {
    const currentBestTime = bestTimes[abbreviatedTrackName][0];

    if (currentBestTime === 999.999 || newTime < currentBestTime) {
      const circuitName = trackNameMapping[abbreviatedTrackName];
      bestTimes[abbreviatedTrackName] = [newTime, driverName, circuitName];
    } else {
    }
  } else {
    log(
      `The track ${abbreviatedTrackName} wasn't found on the mapping to update the best time.`
    );
  }
};

export const clearBestTime = (
  trackName: string,
  newTime: number,
  driverName: string
) => {
  const abbreviatedTrackName = getAbbreviatedTrackName(trackName) || trackName;

  if (trackNameMapping.hasOwnProperty(abbreviatedTrackName)) {
    const circuitName = trackNameMapping[abbreviatedTrackName];
    bestTimes[abbreviatedTrackName] = [newTime, driverName, circuitName];
  } else {
    log(
      `The track ${abbreviatedTrackName} wasn't found on the mapping to clear the best time.`
    );
  }
};

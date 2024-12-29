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
  indianapolis: "Indianapolis Motor Speedway"
};

// Atualizando o objeto bestTimes com os nomes completos
export const bestTimes: { [key: string]: [number, string, string] } = {
  melbourne: [28.283, "Ximbastian Vettel", trackNameMapping["melbourne"]],
  imola: [32.750, "Schumacchio", trackNameMapping["imola"]],
  sepang: [50.7, "Ximbastian Vettel", trackNameMapping["sepang"]],
  bahrein: [32.5, "Ximbastian Vettel", trackNameMapping["bahrein"]],
  sochi: [41.05, "Ximbastian Vettel", trackNameMapping["sochi"]],
  monaco: [35.7, "Ximbastian Vettel", trackNameMapping["monaco"]],
  valencia: [38.7, "Ximbastian Vettel", trackNameMapping["valencia"]],
  paulRicard: [43.45, "Ximbastian Vettel", trackNameMapping["paulRicard"]],
  silverstone: [34.45, "Gabriel Schumacchio", trackNameMapping["silverstone"]],
  spa: [52.033, "Ximbastian Vettel", trackNameMapping["spa"]],
  istanbul: [35.35, "Ximbastian Vettel", trackNameMapping["istanbul"]],
  nurburgring: [41.000, "Adil", trackNameMapping["nurburgring"]],
  monza: [28.850, "Schumacchio", trackNameMapping["monza"]],
  canada: [31.6, "Ximbastian Vettel", trackNameMapping["canada"]],
  austin: [51.050, "Schumacchio", trackNameMapping["austin"]],
  shanghai: [41.4, "Ximbastian Vettel", trackNameMapping["shanghai"]],
  suzuka: [999.999, "undefined", trackNameMapping["suzuka"]],
  interlagos: [33.800, "Schumacchio", trackNameMapping["interlagos"]],
  baku: [48.100, "Ximbastian Vettel", trackNameMapping["baku"]],
  argentina: [43.250, "Ximbastian Vettel", trackNameMapping["argentina"]],
  marinaBay: [49.900, "Ximbastian Vettel", trackNameMapping["marinaBay"]],
  jeddah: [999.999, "undefined", trackNameMapping["jeddah"]],
  yasMarina: [999.999, "undefined", trackNameMapping["yasMarina"]],
  hockenheimring: [999.999, "undefined", trackNameMapping["hockenheimring"]],
  fuji: [999.999, "undefined", trackNameMapping["fuji"]],
  hungaroing: [999.999, "undefined", trackNameMapping["hungaroing"]],
  indianapolis: [999.999, "undefined", trackNameMapping["indianapolis"]]
};
// Função para converter nome completo para abreviado
export const getAbbreviatedTrackName = (fullTrackName: string): string | undefined => {
  return Object.keys(trackNameMapping).find(key => trackNameMapping[key] === fullTrackName);
};

// Atualizando a função para usar o nome completo
export const updateBestTime = (trackName: string, newTime: number, driverName: string) => {
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
    console.log(`A pista ${abbreviatedTrackName} não foi encontrada no mapeamento.`);
  }
};

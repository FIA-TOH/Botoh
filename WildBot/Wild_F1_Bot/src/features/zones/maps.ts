import { sendErrorMessage, sendSuccessMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { Circuit } from "../../circuits/Circuit";

import { PODIUM } from "../../circuits/podium/podium";

import { MELBOURNE } from "../../circuits/melbourne/melbourne";
import { BAKU } from "../../circuits/baku/baku";
import { SPA } from "../../circuits/spa/spa";
import { IMOLA } from "../../circuits/imola/imola";
import { NURBURGRING } from "../../circuits/nurburgring/nurburgring";
import { SHANGHAI } from "../../circuits/shanghai/shanghai";
import { AUSTIN } from "../../circuits/austin/austin";
import { MONZA } from "../../circuits/monza/monza";
import { CANADA } from "../../circuits/canada/canada";
import { SEPANG } from "../../circuits/sepang/sepang";
import { BAHRAIN } from "../../circuits/bahrain/bahrain";
import { VALENCIA } from "../../circuits/valencia/valencia";
import { SILVERSTONE } from "../../circuits/silverstone/silverstone";
import { MONACO } from "../../circuits/monaco/monaco";
import { SOCHI } from "../../circuits/sochi/sochi";
import { PAUL_RICARD } from "../../circuits/paul_ricard/paul_ricard";
import { ISTANBUL } from "../../circuits/istanbul/istanbul";
import { SUZUKA } from "../../circuits/suzuka/suzuka";
import { INTERLAGOS } from "../../circuits/interlagos/interlagos";
import { ARGENTINA } from "../../circuits/argentina/argentina";

import { MARINA_BAY } from "../../circuits/marina_bay/marina_bay";
import { JEDDAH } from "../../circuits/jeddah/jeddah";
import { ABU_DHABI } from "../../circuits/abu_dhabi/abu_dhabi";
import { HOCKEN } from "../../circuits/hocken/hocken";
import { FUJI } from "../../circuits/fuji/fuji";
import { HUNGARY } from "../../circuits/hungary/hungary";
import { MEXICO } from "../../circuits/mexico/mexico";

import { AUSTRIA } from "../../circuits/austria/austria";
import { LAGUNA_SECA } from "../../circuits/laguna_seca/laguna_seca";
import { BALATON } from "../../circuits/balaton/balaton";
import { MIAMI } from "../../circuits/miami/miami";

import { NURBURGRINGNANO } from "../../circuits/nurburgring/nurburgringNano";
import { HUNGARYNANO } from "../../circuits/hungary/hungaryNano";

import { INDIANAPOLIS } from "../../circuits/indianapolis/indianapolis";
import { INDIANAPOLISLEAGUE } from "../../circuits/indianapolis/indianapolisLeague";

import { LEAGUE_MODE } from "../hostLeague/leagueMode";

import { ISTANBULLEAGUE } from "../../circuits/istanbulLeague/istanbulLeague";
import { FUJILEAGUE } from "../../circuits/fuji/fujiLeague";
import { SOCHILEAGUE } from "../../circuits/sochi/sochiLeague";
import { BAKULEAGUE } from "../../circuits/baku/bakuLeague";
import { MONACOLEAGUE } from "../../circuits/monaco/monacoLeague";
import { VALENCIALEAGUE } from "../../circuits/valencia/valenciaLeague";
import { SILVERSTONELEAGUE } from "../../circuits/silverstone/silverstoneLeague";
import { SPALEAGUE } from "../../circuits/spa/spaLeague";
import { NURBURGRINGLEAGUE } from "../../circuits/nurburgring/nurburgringLeague";
import { MONZALEAGUE } from "../../circuits/monza/monzaLeague";
import { CANADALEAGUE } from "../../circuits/canada/canadaLeague";
import { AUSTINLEAGUE } from "../../circuits/austin/austinLeague";
import { SHANGHAILEAGUE } from "../../circuits/shanghai/shanghaiLeague";
import { SUZUKALEAGUE } from "../../circuits/suzuka/suzukaLeague";
import { SUZUKAPUBLIC } from "../../circuits/suzuka/suzukaPublic";
import { MELBOURNEPUBLIC } from "../../circuits/melbourne/melbournePublic";
import { BAKUPUBLIC } from "../../circuits/baku/bakuPublic";
import { SPAPUBLIC } from "../../circuits/spa/spaPublic";
import { IMOLAPUBLIC } from "../../circuits/imola/imolaPublic";
import { NURBURGRINGPUBLIC } from "../../circuits/nurburgring/nurburgringPublic";
import { SHANGHAIPUBLIC } from "../../circuits/shanghai/shanghaiPublic";
import { AUSTINPUBLIC } from "../../circuits/austin/austinPublic";
import { MONZAPUBLIC } from "../../circuits/monza/monzaPublic";
import { CANADAPUBLIC } from "../../circuits/canada/canadaPublic";
import { SEPANGPUBLIC } from "../../circuits/sepang/sepangPublic";
import { BAHRAINPUBLIC } from "../../circuits/bahrain/bahrainPublic";
import { VALENCIAPUBLIC } from "../../circuits/valencia/valenciaPublic";
import { SILVERSTONEPUBLIC } from "../../circuits/silverstone/silverstonePublic";

// import {DAYTONA} from "../circuits/daytona/daytona";
// import {BARCELONA} from "../circuits/barcelona/barcelona";
// import {MACAU} from "../circuits/macau/macau";
// import {WALES} from "../circuits/wales/wales";
// import {NETHERLANDS} from "../circuits/netherlands/netherlands";
// import {ALGARVE} from "../circuits/algarve/algarve";
// import {TARNOW} from "../circuits/tarnow/tarnow";

export const CIRCUITS: Circuit[] = LEAGUE_MODE
  ? [
      SUZUKA,
      MELBOURNE,
      BAKU,
      SPA,
      IMOLA,
      NURBURGRING,
      SHANGHAI,
      AUSTIN,
      MONZA,
      CANADA,
      SEPANG,
      BAHRAIN,
      VALENCIA,
      SILVERSTONE,
      MONACO,
      SOCHI,
      PAUL_RICARD,
      ISTANBUL,
      INTERLAGOS,
      ARGENTINA,
      MARINA_BAY,
      JEDDAH,
      ABU_DHABI,
      HOCKEN,
      FUJI,
      HUNGARY,
      AUSTRIA,
      LAGUNA_SECA,
      BALATON,
      MEXICO,
      MIAMI,
      NURBURGRINGNANO,
      HUNGARYNANO,
      SUZUKALEAGUE,
      INDIANAPOLIS,
      PODIUM,
    ]
  : [
      SUZUKAPUBLIC,
      MELBOURNEPUBLIC,
      BAKUPUBLIC,
      SPAPUBLIC,
      IMOLAPUBLIC,
      NURBURGRINGPUBLIC,
      SHANGHAIPUBLIC,
      AUSTINPUBLIC,
      MONZAPUBLIC,
      CANADAPUBLIC,
      SEPANGPUBLIC,
      BAHRAINPUBLIC,
      VALENCIAPUBLIC,
      SILVERSTONEPUBLIC,
      MONACO,
      SOCHI,
      PAUL_RICARD,
      ISTANBUL,
      INTERLAGOS,
      ARGENTINA,
      MARINA_BAY,
      JEDDAH,
      ABU_DHABI,
      HOCKEN,
      FUJI,
      HUNGARY,
      // AUSTRIA,
      // LAGUNA_SECA,
      MEXICO,
      MIAMI,
    ];

export let currentMapIndex = 0;

function handleMapError(room: RoomObject) {
  const admins = room.getPlayerList().filter((p) => p.admin);
  if (admins.length >= 1) {
    admins.forEach((p) =>
      sendErrorMessage(room, MESSAGES.CHANGE_MAP_FAILURE(), p.id)
    );
    return;
  }
  sendErrorMessage(room, MESSAGES.CHANGE_MAP_FAILURE());
}

export function handleChangeMap(index: number, room: RoomObject) {
  if (index < 0 || index >= CIRCUITS.length) {
    handleMapError(room);
    return;
  }

  try {
    currentMapIndex = index;
    room.setCustomStadium(CIRCUITS[currentMapIndex].map);
    sendSuccessMessage(
      room,
      MESSAGES.CHANGE_MAP_SUCCESS(CIRCUITS[currentMapIndex].info.name)
    );
  } catch {
    handleMapError(room);
  }
}

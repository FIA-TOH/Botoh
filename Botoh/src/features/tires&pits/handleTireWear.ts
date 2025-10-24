import {
  gameMode,
  GameMode,
  generalGameMode,
  GeneralGameMode,
} from "../changeGameState/changeGameModes";
import { playerList } from "../changePlayerState/playerList";
import { sendAlertMessage, sendChatMessage } from "../chat/chat";
import { MESSAGES } from "../chat/messages";
import { playerBuffList } from "../commands/adjustThings/handleNerfListCommand";
import { presentationLap } from "../commands/gameState/handlePresentationLapCommand";
import { tyresActivated } from "../commands/tyres/handleEnableTyresCommand";
import { ACTUAL_CIRCUIT } from "../roomFeatures/stadiumChange";
import { vsc } from "../speed/handleSpeed";
import { laps } from "../zones/laps";
import { changeTires } from "./changeTires";
import { getBlowoutChance } from "./tireBlowFunctions";
import { applyTrackTireDegradation } from "./tireDegradationFunction";
import { TYRE_DURABILITY, Tires } from "./tires";

export default function HandleTireWear(player: PlayerObject, room: RoomObject) {
  const p = playerList[player.id];
  const currentTime = room.getScores().time;
  if (!p.lastCheckTime) p.lastCheckTime = currentTime;

  if (presentationLap || vsc || p.inPitlane) {
    p.lastCheckTime = currentTime;
    return;
  }
  if (
    !tyresActivated ||
    generalGameMode === GeneralGameMode.GENERAL_QUALY ||
    gameMode === GameMode.WAITING
  ) {
    p.wear = 20;
    return;
  }

  //Tyre durability calculation
  let totalDurability = TYRE_DURABILITY(laps);
  const trackDegradation = ACTUAL_CIRCUIT?.info?.TireDegradationPercentage ?? 0;
  totalDurability = applyTrackTireDegradation(
    totalDurability,
    trackDegradation
  );
  const currentTireDurability = totalDurability[p.tires as Tires];

  const timeElapsed = currentTime - p.lastCheckTime;
  p.lastCheckTime = currentTime;

  const isBuffed = playerBuffList.some(
    (buffPlayer) => buffPlayer.name === player.name
  );
  const wearReductionFactor = vsc ? 0.25 : 1;
  const wearIncrementPerSecond =
    (100 / currentTireDurability) * wearReductionFactor;

  if (isBuffed && 100 - p.wear <= 50) {
    return;
  } else {
    p.wear = Math.min(100, p.wear + wearIncrementPerSecond * timeElapsed);
  }

  const remainingPercentage = 100 - p.wear;

  const alerts = [
    { threshold: 90, message: MESSAGES.WEAR_ON_CURRENT_TIRE(90), key: 90 },
    { threshold: 75, message: MESSAGES.WEAR_ON_CURRENT_TIRE(75), key: 75 },
    { threshold: 60, message: MESSAGES.WEAR_ON_CURRENT_TIRE(60), key: 60 },
    { threshold: 40, message: MESSAGES.WEAR_ON_CURRENT_TIRE(40), key: 40 },
    { threshold: 25, message: MESSAGES.WEAR_ON_CURRENT_TIRE(25), key: 25 },
    { threshold: 10, message: MESSAGES.WEAR_ON_CURRENT_TIRE(10), key: 10 },
    { threshold: 5, message: MESSAGES.WEAR_ON_CURRENT_TIRE(5), key: 5 },
    { threshold: 0, message: MESSAGES.WEAR_ON_CURRENT_TIRE(0), key: 0 },
  ];

  if (!p.alertSent) p.alertSent = {};

  if (remainingPercentage === 0 && p.tires != Tires.FLAT) {
    changeTires(
      { p: player, disc: room.getPlayerDiscProperties(player.id) },
      Tires.FLAT,
      room
    );
  }

  if (remainingPercentage === 100) {
    p.alertSent = {};
  }

  if (remainingPercentage === 0 && !p.alertSent[0] && tyresActivated) {
    sendAlertMessage(room, MESSAGES.WEAR_ON_CURRENT_TIRE(0), player.id);
    p.alertSent[0] = true;
    return;
  }

  for (let alert of alerts) {
    if (remainingPercentage <= alert.threshold && !p.alertSent[alert.key]) {
      sendAlertMessage(room, alert.message, player.id);
      p.alertSent[alert.key] = true;
      break;
    }
  }

  const blowoutChance = getBlowoutChance(remainingPercentage);
  if (Math.random() < blowoutChance) {
    changeTires(
      { p: player, disc: room.getPlayerDiscProperties(player.id) },
      Tires.FLAT,
      room
    );
    sendAlertMessage(room, MESSAGES.BLOWN_OUT_UNLUCKY_TIRES(), player.id);
    sendChatMessage(room, MESSAGES.TYRE_BLOW(player.name));
  }
}

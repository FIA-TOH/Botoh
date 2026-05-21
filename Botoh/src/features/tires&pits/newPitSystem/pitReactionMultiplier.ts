import { playerList } from "../../changePlayerState/playerList";
import { getLeagueScuderia } from "../../scuderias/scuderias";

const DEFAULT_REACTION_TIME_MULTIPLIER = 5;
const BASE_LIGHT_ERROR_TIME = 3;
const BASE_HEAVY_ERROR_TIME = 6.1;

export const PIT_REACTION_TIME_MULTIPLIER_BY_LEVEL = {
  0: 9,
  1: 7.5,
  2: 7,
  3: 6.5,
  4: 6,
  5: 5,
} as const;

type PitLevel = keyof typeof PIT_REACTION_TIME_MULTIPLIER_BY_LEVEL;

function isPitLevel(level: number): level is PitLevel {
  return Number.isInteger(level) && level >= 0 && level <= 5;
}

export function getPitReactionTimeMultiplier(playerId: number): number {
  const pitLevel = getPlayerPitCrewLevel(playerId);

  if (typeof pitLevel !== "number" || !isPitLevel(pitLevel)) {
    return DEFAULT_REACTION_TIME_MULTIPLIER;
  }

  return PIT_REACTION_TIME_MULTIPLIER_BY_LEVEL[pitLevel];
}

export function getPitErrorTimeThresholds(playerId: number): {
  light: number;
  heavy: number;
} {
  const reactionTimeMultiplier = getPitReactionTimeMultiplier(playerId);
  const levelScale = reactionTimeMultiplier / DEFAULT_REACTION_TIME_MULTIPLIER;

  return {
    light: BASE_LIGHT_ERROR_TIME * levelScale,
    heavy: BASE_HEAVY_ERROR_TIME * levelScale,
  };
}

export function getPlayerPitCrewLevel(playerId: number): number | null {
  const playerInfo = playerList[playerId];
  if (!playerInfo?.leagueScuderia) return null;

  const scuderia = getLeagueScuderia(playerInfo.leagueScuderia);
  return typeof scuderia?.pitLevel === "number" ? scuderia.pitLevel : null;
}

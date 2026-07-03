export type PublicRankName =
  | "Kart"
  | "Formula 4"
  | "Formula 3"
  | "Formula 2"
  | "Formula 1";

export type PublicDisplayedRankName = "Rookie" | PublicRankName;

export type PublicRankTier = {
  name: PublicRankName;
  minXp: number;
  speedRequirement: number;
};

export const PUBLIC_ROOKIE_RACES = 5;

export const PUBLIC_RANK_TIERS: PublicRankTier[] = [
  { name: "Kart", minXp: 0, speedRequirement: 1.18 },
  { name: "Formula 4", minXp: 350, speedRequirement: 1.1 },
  { name: "Formula 3", minXp: 900, speedRequirement: 1.06 },
  { name: "Formula 2", minXp: 1600, speedRequirement: 1.035 },
  { name: "Formula 1", minXp: 2600, speedRequirement: 1.018 },
];

export const PUBLIC_RANK_EMOJIS: Record<PublicDisplayedRankName, string> = {
  Rookie: "⚪",
  Kart: "🟥",
  "Formula 4": "🟢",
  "Formula 3": "🔷",
  "Formula 2": "⭐",
  "Formula 1": "👑",
};

export function getRankTierByXp(xp: number) {
  return PUBLIC_RANK_TIERS.reduce((current, tier) =>
    xp >= tier.minXp ? tier : current,
  );
}

export function getPublicRankName(
  xp: number,
  placementRacesRemaining: number,
): PublicDisplayedRankName {
  if (placementRacesRemaining > 0) return "Rookie";
  return getRankTierByXp(xp).name;
}

export function getNextPublicRank(xp: number) {
  return PUBLIC_RANK_TIERS.find((tier) => tier.minXp > xp) ?? null;
}

export function getPublicRankEmoji(rank: PublicDisplayedRankName) {
  return PUBLIC_RANK_EMOJIS[rank];
}

export function getPublicRankLabel(rank: PublicDisplayedRankName) {
  return `${getPublicRankEmoji(rank)}${rank}`;
}

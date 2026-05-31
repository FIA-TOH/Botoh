export type GarageFacility = 'climate' | 'pitCrew';
export type FacilityLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type UpgradeTargetLevel = 1 | 2 | 3 | 4 | 5;
export type SellableFacilityLevel = 1 | 2 | 3 | 4 | 5;

type FacilityEconomyDefinition = {
  buildCost: number;
  upgradeCostByTargetLevel: Record<UpgradeTargetLevel, number>;
  sellValueByCurrentLevel: Record<SellableFacilityLevel, number>;
  costPerRaceByLevel: Record<FacilityLevel, number>;
};

export const GARAGE_FACILITY_ECONOMY: {
  maxLevel: FacilityLevel;
  sponsorTerminationPenaltyMultiplier: number;
  facilities: Record<GarageFacility, FacilityEconomyDefinition>;
} = {
  maxLevel: 5,
  sponsorTerminationPenaltyMultiplier: 1.5,
  facilities: {
    climate: {
      buildCost: 250000,
      upgradeCostByTargetLevel: {
        1: 500000,
        2: 850000,
        3: 1350000,
        4: 2100000,
        5: 3300000,
      },
      sellValueByCurrentLevel: {
        1: 350000,
        2: 595000,
        3: 945000,
        4: 1470000,
        5: 2310000,
      },
      costPerRaceByLevel: {
        0: 0,
        1: 60000,
        2: 100000,
        3: 160000,
        4: 230000,
        5: 360000,
      },
    },
    pitCrew: {
      buildCost: 300000,
      upgradeCostByTargetLevel: {
        1: 700000,
        2: 1100000,
        3: 1700000,
        4: 2600000,
        5: 4000000,
      },
      sellValueByCurrentLevel: {
        1: 490000,
        2: 770000,
        3: 1190000,
        4: 1820000,
        5: 2800000,
      },
      costPerRaceByLevel: {
        0: 0,
        1: 80000,
        2: 120000,
        3: 190000,
        4: 250000,
        5: 400000,
      },
    },
  },
};

export function getFacilityUpgradeCost(facility: GarageFacility, currentLevel: number): number {
  const targetLevel = currentLevel + 1;
  if (targetLevel === 1) return GARAGE_FACILITY_ECONOMY.facilities[facility].buildCost;

  return GARAGE_FACILITY_ECONOMY.facilities[facility].upgradeCostByTargetLevel[
    targetLevel as UpgradeTargetLevel
  ];
}

export function getFacilitySellValue(facility: GarageFacility, currentLevel: number): number {
  return GARAGE_FACILITY_ECONOMY.facilities[facility].sellValueByCurrentLevel[
    currentLevel as SellableFacilityLevel
  ];
}

export function getFacilityCostPerRace(facility: GarageFacility, level: number): number {
  return GARAGE_FACILITY_ECONOMY.facilities[facility].costPerRaceByLevel[
    level as FacilityLevel
  ];
}

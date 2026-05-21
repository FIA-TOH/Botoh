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
      buildCost: 500,
      upgradeCostByTargetLevel: {
        1: 500,
        2: 500,
        3: 500,
        4: 500,
        5: 500,
      },
      sellValueByCurrentLevel: {
        1: 350,
        2: 350,
        3: 350,
        4: 350,
        5: 350,
      },
      costPerRaceByLevel: {
        0: 0,
        1: 50,
        2: 100,
        3: 150,
        4: 200,
        5: 250,
      },
    },
    pitCrew: {
      buildCost: 500,
      upgradeCostByTargetLevel: {
        1: 500,
        2: 500,
        3: 500,
        4: 500,
        5: 500,
      },
      sellValueByCurrentLevel: {
        1: 350,
        2: 350,
        3: 350,
        4: 350,
        5: 350,
      },
      costPerRaceByLevel: {
        0: 0,
        1: 50,
        2: 100,
        3: 150,
        4: 200,
        5: 250,
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

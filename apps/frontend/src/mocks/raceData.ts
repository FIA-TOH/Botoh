// Mock data for race simulation

export type TireType = 'SOFT' | 'MEDIUM' | 'HARD' | 'WET' | 'INTERMEDIATE';

export type SessionType = 'RACE' | 'QUALY' | 'TRAINING';

export type FlagType = 'GREEN' | 'YELLOW' | 'RED' | 'SAFETY' | 'VIRTUAL_SAFETY';

export interface Driver {
  position: number;
  name: string;
  shortName: string;
  tire: TireType;
  tireWear: number; // 0-100%
  pitCount: number;
  managingTires: boolean;
  gapToLeader: string; // "+1.234" or "LAP"
  inPit: boolean;
  isOut: boolean;
  qualyTime: string; // "1:23.456"
  bestLapTime: string; // Best lap time for qualy/training
  gapToLeaderMs: number; // Gap in milliseconds for precise calculations
  teamColor: string; // Team color hex code (e.g., "#1E41FF" for Red Bull)
}

export interface RaceSession {
  sessionType: SessionType;
  currentLap: number;
  totalLaps: number;
  flag: FlagType;
  drivers: Driver[];
}

export const mockRaceData: RaceSession = {
  sessionType: 'RACE',
  currentLap: 23,
  totalLaps: 52,
  flag: 'GREEN',
  drivers: [
    {
      position: 1,
      name: "Max Verstappen",
      shortName: "VER",
      tire: "MEDIUM",
      tireWear: 45.2,
      pitCount: 1,
      managingTires: false,
      gapToLeader: "Out Lap",
      gapToLeaderMs: 0,
      inPit: false,
      isOut: false,
      qualyTime: "1:23.456",
      bestLapTime: "1:22.345",
      teamColor: "#1E41FF"
    },
    {
      position: 2,
      name: "Sergio Perez",
      shortName: "PER",
      tire: "MEDIUM",
      tireWear: 48.7,
      pitCount: 1,
      managingTires: true,
      gapToLeader: "+2.345",
      gapToLeaderMs: 2345,
      inPit: false,
      isOut: false,
      qualyTime: "1:23.789",
      bestLapTime: "1:23.987",
      teamColor: "#1E41FF"
    },
    {
      position: 3,
      name: "Lewis Hamilton",
      shortName: "HAM",
      tire: "SOFT",
      tireWear: 67.3,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+5.678",
      gapToLeaderMs: 5678,
      inPit: false,
      isOut: false,
      qualyTime: "1:24.123",
      bestLapTime: "1:24.567",
      teamColor: "#00D2BE"
    },
    {
      position: 4,
      name: "George Russell",
      shortName: "RUS",
      tire: "SOFT",
      tireWear: 71.8,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+8.901",
      gapToLeaderMs: 8901,
      inPit: false,
      isOut: false,
      qualyTime: "1:24.234",
      bestLapTime: "1:24.890",
      teamColor: "#00D2BE"
    },
    {
      position: 5,
      name: "Charles Leclerc",
      shortName: "LEC",
      tire: "HARD",
      tireWear: 32.1,
      pitCount: 1,
      managingTires: false,
      gapToLeader: "+12.345",
      gapToLeaderMs: 12345,
      inPit: false,
      isOut: false,
      qualyTime: "1:23.890",
      bestLapTime: "1:23.456",
      teamColor: "#FF232B"
    },
    {
      position: 6,
      name: "Carlos Sainz",
      shortName: "SAI",
      tire: "HARD",
      tireWear: 35.6,
      pitCount: 1,
      managingTires: false,
      gapToLeader: "+15.678",
      gapToLeaderMs: 15678,
      inPit: false,
      isOut: false,
      qualyTime: "1:25.234",
      bestLapTime: "1:24.890",
      teamColor: "#FF232B"
    },
    {
      position: 7,
      name: "Lando Norris",
      shortName: "NOR",
      tire: "MEDIUM",
      tireWear: 52.3,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+18.901",
      gapToLeaderMs: 18901,
      inPit: false,
      isOut: false,
      qualyTime: "1:24.678",
      bestLapTime: "1:24.567",
      teamColor: "#FF8000"
    },
    {
      position: 8,
      name: "Oscar Piastri",
      shortName: "PIA",
      tire: "MEDIUM",
      tireWear: 54.7,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+21.234",
      gapToLeaderMs: 21234,
      inPit: false,
      isOut: false,
      qualyTime: "1:24.789",
      bestLapTime: "1:24.789",
      teamColor: "#FF8000"
    },
    {
      position: 9,
      name: "Fernando Alonso",
      shortName: "ALO",
      tire: "HARD",
      tireWear: 41.2,
      pitCount: 1,
      managingTires: false,
      gapToLeader: "+24.567",
      gapToLeaderMs: 24567,
      inPit: false,
      isOut: false,
      qualyTime: "1:25.123",
      bestLapTime: "1:25.123",
      teamColor: "#006F62"
    },
    {
      position: 10,
      name: "Lance Stroll",
      shortName: "STR",
      tire: "HARD",
      tireWear: 43.8,
      pitCount: 1,
      managingTires: false,
      gapToLeader: "+27.890",
      gapToLeaderMs: 27890,
      inPit: false,
      isOut: false,
      qualyTime: "1:25.234",
      bestLapTime: "1:25.234",
      teamColor: "#006F62"
    },
    {
      position: 11,
      name: "Pierre Gasly",
      shortName: "GAS",
      tire: "SOFT",
      tireWear: 78.4,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+31.123",
      gapToLeaderMs: 31123,
      inPit: false,
      isOut: false,
      qualyTime: "1:25.345",
      bestLapTime: "1:25.678",
      teamColor: "#0090FF"
    },
    {
      position: 12,
      name: "Esteban Ocon",
      shortName: "OCO",
      tire: "SOFT",
      tireWear: 82.1,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+34.567",
      gapToLeaderMs: 34567,
      inPit: false,
      isOut: false,
      qualyTime: "1:25.456",
      bestLapTime: "1:25.987",
      teamColor: "#0090FF"
    },
    {
      position: 13,
      name: "Valtteri Bottas",
      shortName: "BOT",
      tire: "MEDIUM",
      tireWear: 61.3,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+37.890",
      gapToLeaderMs: 37890,
      inPit: false,
      isOut: false,
      qualyTime: "1:25.567",
      bestLapTime: "1:25.789",
      teamColor: "#900000"
    },
    {
      position: 14,
      name: "Zhou Guanyu",
      shortName: "ZHO",
      tire: "MEDIUM",
      tireWear: 64.7,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+41.234",
      gapToLeaderMs: 41234,
      inPit: false,
      isOut: false,
      qualyTime: "1:25.678",
      bestLapTime: "1:25.890",
      teamColor: "#900000"
    },
    {
      position: 15,
      name: "Kevin Magnussen",
      shortName: "MAG",
      tire: "HARD",
      tireWear: 47.2,
      pitCount: 1,
      managingTires: false,
      gapToLeader: "+44.567",
      gapToLeaderMs: 44567,
      inPit: false,
      isOut: false,
      qualyTime: "1:26.123",
      bestLapTime: "1:26.234",
      teamColor: "#B6BABD"
    },
    {
      position: 16,
      name: "Nico Hulkenberg",
      shortName: "HUL",
      tire: "HARD",
      tireWear: 49.8,
      pitCount: 1,
      managingTires: false,
      gapToLeader: "+47.890",
      gapToLeaderMs: 47890,
      inPit: false,
      isOut: false,
      qualyTime: "1:26.234",
      bestLapTime: "1:26.456",
      teamColor: "#B6BABD"
    },
    {
      position: 17,
      name: "Yuki Tsunoda",
      shortName: "TSU",
      tire: "SOFT",
      tireWear: 85.3,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+51.123",
      gapToLeaderMs: 51123,
      inPit: false,
      isOut: false,
      qualyTime: "1:26.345",
      bestLapTime: "1:26.567",
      teamColor: "#2B4562"
    },
    {
      position: 18,
      name: "Daniel Ricciardo",
      shortName: "RIC",
      tire: "SOFT",
      tireWear: 88.7,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+54.567",
      gapToLeaderMs: 54567,
      inPit: false,
      isOut: false,
      qualyTime: "1:26.456",
      bestLapTime: "1:26.789",
      teamColor: "#2B4562"
    },
    {
      position: 19,
      name: "Logan Sargeant",
      shortName: "SAR",
      tire: "MEDIUM",
      tireWear: 72.1,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+57.890",
      gapToLeaderMs: 57890,
      inPit: false,
      isOut: false,
      qualyTime: "1:26.567",
      bestLapTime: "1:26.890",
      teamColor: "#005AFF"
    },
    {
      position: 20,
      name: "Alexander Albon",
      shortName: "ALB",
      tire: "MEDIUM",
      tireWear: 75.4,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+61.234",
      gapToLeaderMs: 61234,
      inPit: false,
      isOut: false,
      qualyTime: "1:26.678",
      bestLapTime: "1:26.901",
      teamColor: "#005AFF"
    },
    {
      position: 21,
      name: "Nyck de Vries",
      shortName: "DEV",
      tire: "MEDIUM",
      tireWear: 78.9,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+65.678",
      gapToLeaderMs: 65678,
      inPit: false,
      isOut: false,
      qualyTime: "1:26.789",
      bestLapTime: "1:27.012",
      teamColor: "#2B4562"
    },
    {
      position: 22,
      name: "Alex Albon",
      shortName: "ALB",
      tire: "MEDIUM",
      tireWear: 82.1,
      pitCount: 2,
      managingTires: true,
      gapToLeader: "+70.123",
      gapToLeaderMs: 70123,
      inPit: false,
      isOut: false,
      qualyTime: "1:26.890",
      bestLapTime: "1:27.123",
      teamColor: "#005AFF"
    }
  ]
};

// Additional mock scenarios for different session types
export const mockQualyData: RaceSession = {
  ...mockRaceData,
  sessionType: 'QUALY',
  currentLap: 15,
  totalLaps: 18,
  flag: 'YELLOW',
  drivers: mockRaceData.drivers.map((driver, index) => ({
    ...driver,
    position: index + 1,
    gapToLeader: index === 0 ? "0.000" : `+${(index * 0.234).toFixed(3)}`,
    inPit: false,
    isOut: index > 15, // Last 5 drivers eliminated
    tireWear: Math.random() * 30, // Less wear in qualy
    pitCount: 0
  }))
};

export const mockTrainingData: RaceSession = {
  ...mockRaceData,
  sessionType: 'TRAINING',
  currentLap: 45,
  totalLaps: 60,
  flag: 'GREEN',
  drivers: mockRaceData.drivers.map((driver, index) => ({
    ...driver,
    position: index + 1,
    gapToLeader: index === 0 ? "0.000" : `+${(index * 0.567).toFixed(3)}`,
    inPit: index % 5 === 0, // Some drivers in pit during training
    isOut: false,
    tireWear: Math.random() * 40, // Variable wear in training
    pitCount: Math.floor(Math.random() * 3)
  }))
};

export const mockSafetyCarData: RaceSession = {
  ...mockRaceData,
  flag: 'SAFETY',
  drivers: mockRaceData.drivers.map(driver => ({
    ...driver,
    gapToLeader: driver.position === 1 ? "0.000" : "+0.500", // All bunched up
    managingTires: driver.position <= 5 // Leaders managing tires
  }))
};

export const mockVirtualSafetyCarData: RaceSession = {
  ...mockRaceData,
  flag: 'VIRTUAL_SAFETY',
  drivers: mockRaceData.drivers.map(driver => ({
    ...driver,
    gapToLeader: driver.position === 1 ? "0.000" : `+${(driver.position * 0.8).toFixed(3)}`, // Gaps controlled
    managingTires: driver.position <= 8 // More drivers managing tires
  }))
};

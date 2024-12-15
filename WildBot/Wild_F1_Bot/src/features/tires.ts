

export enum Tires {
    SOFT = "SOFT",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
    INTER = "INTER",
    WET = "WET",
    FLAT = "FLAT"
}

export const TIRE_STARTING_SPEED = {
    [Tires.SOFT]: 5.4,
    [Tires.MEDIUM]: 5.15,
    [Tires.HARD]: 4.9,
    [Tires.INTER]: 4.4,
    [Tires.WET]: 3.9,
    [Tires.FLAT]:3.0
}

export type TireDurability = Record<Tires, number | typeof Infinity>;

export const TYRE_DURABILITY = (limit: number | null ): TireDurability => {
  if (limit === null) {
      return {
        [Tires.SOFT]: Infinity,
        [Tires.MEDIUM]: Infinity,
        [Tires.HARD]: Infinity,
        [Tires.WET]: Infinity,
        [Tires.INTER]: Infinity,
        [Tires.FLAT]: Infinity,
      };
    }
  
    if (limit >= 0 && limit <= 7) {
      return {
        [Tires.SOFT]: 150, // 2.5
        [Tires.MEDIUM]: 218.75, // 3.65
        [Tires.HARD]: 300,  // 5
        [Tires.WET]: 200,  // 3.33
        [Tires.INTER]: 200,  // 3.33
        [Tires.FLAT]: Infinity,
      };
    } else if (limit >= 8 && limit <= 13) {
      return {
        [Tires.SOFT]: 300, // 5
        [Tires.MEDIUM]: 437.5, // 7.29
        [Tires.HARD]: 600,  // 10
        [Tires.WET]: 400,  // 6.67
        [Tires.INTER]: 400,  // 6.67
        [Tires.FLAT]: Infinity,
      };
    } else if (limit >= 14 && limit <= 23) {
      return {
        [Tires.SOFT]: 450, // 7.5
        [Tires.MEDIUM]: 656.25, // 10.94
        [Tires.HARD]: 900,  // 15
        [Tires.WET]: 600,  // 10
        [Tires.INTER]: 600,  // 10
        [Tires.FLAT]: Infinity,
      };
    } else if (limit >= 24 && limit <= 33) {
      return {
        [Tires.SOFT]: 750, // 12.5
        [Tires.MEDIUM]: 1093.75, // 18.23
        [Tires.HARD]: 1500,  // 25
        [Tires.WET]: 1000,  // 16.67
        [Tires.INTER]: 1000,  // 16.67
        [Tires.FLAT]: Infinity,
      };
    } else if (limit >= 34 && limit <= 43) {
      return {
        [Tires.SOFT]: 1050, // 17.5
        [Tires.MEDIUM]: 1531.25, // 25.52
        [Tires.HARD]: 2100,  // 35
        [Tires.WET]: 1400,  // 23.33
        [Tires.INTER]: 1400,  // 23.33
        [Tires.FLAT]: Infinity,
      };
    } else if (limit >= 44 && limit <= 53) {
      return {
        [Tires.SOFT]: 1500,  // 25
        [Tires.MEDIUM]: 2187.5, // 36.46
        [Tires.HARD]: 3000,  // 50
        [Tires.WET]: 2000,  // 33.33
        [Tires.INTER]: 2000,  // 33.33
        [Tires.FLAT]: Infinity,
      };
    } else if (limit >= 54 && limit <= 100) {
      return {
        [Tires.SOFT]: 2750,  // 45.83
        [Tires.MEDIUM]: 3750, // 62.5
        [Tires.HARD]: 5250,  // 87.5
        [Tires.WET]: 3500,  // 58.33
        [Tires.INTER]: 3500,  // 58.33
        [Tires.FLAT]: Infinity,
      };
    } else {
      return {
        [Tires.SOFT]: 3000,  // 50
        [Tires.MEDIUM]: 4375, // 72.92
        [Tires.HARD]: 6000,  // 100
        [Tires.WET]: 4000,  // 66.67
        [Tires.INTER]: 4000,  // 66.67
        [Tires.FLAT]: Infinity,
      };
    }    
}

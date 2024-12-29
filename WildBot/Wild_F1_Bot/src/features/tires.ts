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
      [Tires.MEDIUM]: 185.94, // 3.1 (15% a menos)
      [Tires.HARD]: 255,  // 4.25 (15% a menos)
      [Tires.WET]: 200,  // 3.33
      [Tires.INTER]: 200,  // 3.33
      [Tires.FLAT]: Infinity,
    };
  } else if (limit >= 8 && limit <= 13) {
    return {
      [Tires.SOFT]: 300, // 5
      [Tires.MEDIUM]: 371.87, // 6.2 (15% a menos)
      [Tires.HARD]: 510,  // 8.5 (15% a menos)
      [Tires.WET]: 400,  // 6.67
      [Tires.INTER]: 400,  // 6.67
      [Tires.FLAT]: Infinity,
    };
  } else if (limit >= 14 && limit <= 23) {
    return {
      [Tires.SOFT]: 450, // 7.5
      [Tires.MEDIUM]: 558.06, // 9.3 (15% a menos)
      [Tires.HARD]: 765,  // 12.75 (15% a menos)
      [Tires.WET]: 600,  // 10
      [Tires.INTER]: 600,  // 10
      [Tires.FLAT]: Infinity,
    };
  } else if (limit >= 24 && limit <= 33) {
    return {
      [Tires.SOFT]: 750, // 12.5
      [Tires.MEDIUM]: 928.69, // 15.5 (15% a menos)
      [Tires.HARD]: 1275,  // 21.25 (15% a menos)
      [Tires.WET]: 1000,  // 16.67
      [Tires.INTER]: 1000,  // 16.67
      [Tires.FLAT]: Infinity,
    };
  } else if (limit >= 34 && limit <= 43) {
    return {
      [Tires.SOFT]: 1050, // 17.5
      [Tires.MEDIUM]: 1301.06, // 21.7 (15% a menos)
      [Tires.HARD]: 1785,  // 29.75 (15% a menos)
      [Tires.WET]: 1400,  // 23.33
      [Tires.INTER]: 1400,  // 23.33
      [Tires.FLAT]: Infinity,
    };
  } else if (limit >= 44 && limit <= 53) {
    return {
      [Tires.SOFT]: 1500,  // 25
      [Tires.MEDIUM]: 1859.37, // 31.05 (15% a menos)
      [Tires.HARD]: 2550,  // 42.5 (15% a menos)
      [Tires.WET]: 2000,  // 33.33
      [Tires.INTER]: 2000,  // 33.33
      [Tires.FLAT]: Infinity,
    };
  } else if (limit >= 54 && limit <= 100) {
    return {
      [Tires.SOFT]: 2750,  // 45.83
      [Tires.MEDIUM]: 3187.5, // 53.125 (15% a menos)
      [Tires.HARD]: 4462.5,  // 73.75 (15% a menos)
      [Tires.WET]: 3500,  // 58.33
      [Tires.INTER]: 3500,  // 58.33
      [Tires.FLAT]: Infinity,
    };
  } else {
    return {
      [Tires.SOFT]: 3000,  // 50
      [Tires.MEDIUM]: 3718.75, // 61.98 (15% a menos)
      [Tires.HARD]: 5100,  // 85 (15% a menos)
      [Tires.WET]: 4000,  // 66.67
      [Tires.INTER]: 4000,  // 66.67
      [Tires.FLAT]: Infinity,
    };
  }    
}

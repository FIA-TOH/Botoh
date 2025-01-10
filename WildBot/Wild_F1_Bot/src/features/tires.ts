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
  } else {
    return {
      [Tires.SOFT]: 900,
      [Tires.MEDIUM]: 1200,
      [Tires.HARD]: 1600, 
      [Tires.WET]: 2000, 
      [Tires.INTER]: 2000, 
      [Tires.FLAT]: Infinity,
    };
  }
}

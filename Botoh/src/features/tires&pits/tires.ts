import { LEAGUE_MODE } from "../hostLeague/leagueMode";

export enum Tires {
  SOFT = "SOFT",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  INTER = "INTER",
  WET = "WET",
  FLAT = "FLAT",
  TRAIN = "TRAIN",
}

export const TIRE_STARTING_SPEED = {
  [Tires.SOFT]: 5.4,
  [Tires.MEDIUM]: 5.15,
  [Tires.HARD]: 4.9,
  [Tires.INTER]: 4.4,
  [Tires.WET]: 3.9,
  [Tires.FLAT]: 2.9,
  [Tires.TRAIN]: 5.4,
};

export type TireDurability = Record<Tires, number | typeof Infinity>;

export const TYRE_DURABILITY = (limit: number | null): TireDurability => {
  if (limit === null) {
    return {
      [Tires.SOFT]: Infinity,
      [Tires.MEDIUM]: Infinity,
      [Tires.HARD]: Infinity,
      [Tires.WET]: Infinity,
      [Tires.INTER]: Infinity,
      [Tires.FLAT]: Infinity,
      [Tires.TRAIN]: Infinity,
    };
  }

  if (!LEAGUE_MODE && limit >= 0 && limit <= 7) {
    return {
      [Tires.SOFT]: 150, // 2.5
      [Tires.MEDIUM]: 185.94, // 3.1 (15% a menos)
      [Tires.HARD]: 255, // 4.25 (15% a menos)
      [Tires.WET]: 200, // 3.33
      [Tires.INTER]: 200, // 3.33
      [Tires.FLAT]: Infinity,
      [Tires.TRAIN]: Infinity,
    };
  } else if (!LEAGUE_MODE && limit >= 14 && limit <= 23) {
    return {
      [Tires.SOFT]: 450, // 7.5
      [Tires.MEDIUM]: 558.06, // 9.3 (15% a menos)
      [Tires.HARD]: 765, // 12.75 (15% a menos)
      [Tires.WET]: 600, // 10
      [Tires.INTER]: 600, // 10
      [Tires.FLAT]: Infinity,
      [Tires.TRAIN]: Infinity,
    };
  } else if (!LEAGUE_MODE && limit >= 24 && limit <= 33) {
    return {
      [Tires.SOFT]: 750, // 12.5
      [Tires.MEDIUM]: 928.69, // 15.5 (15% a menos)
      [Tires.HARD]: 1275, // 21.25 (15% a menos)
      [Tires.WET]: 1000, // 16.67
      [Tires.INTER]: 1000, // 16.67
      [Tires.FLAT]: Infinity,
      [Tires.TRAIN]: Infinity,
    };
  } else {
    // HAXBULA 25 MIN TIRES
    return {
      [Tires.SOFT]: 900 * 0.7, // ≈ 630
      [Tires.MEDIUM]: 1200 * 0.7, // ≈ 840
      [Tires.HARD]: 1600 * 0.7, // ≈ 1120
      [Tires.WET]: 1200 * 0.7, // ≈ 840
      [Tires.INTER]: 1200 * 0.7, // ≈ 840
      [Tires.FLAT]: Infinity,
      [Tires.TRAIN]: Infinity,
    };
    //FTOH 30 MIN TIRES
    // return {
    //   [Tires.SOFT]: 900 * 0.8571, // ≈ 771.4
    //   [Tires.MEDIUM]: 1200 * 0.8571, // ≈ 1028.6
    //   [Tires.HARD]: 1600 * 0.8571, // ≈ 1371.4
    //   [Tires.WET]: 1200 * 0.8571, // ≈ 1028.6
    //   [Tires.INTER]: 1200 * 0.8571, // ≈ 1028.6
    //   [Tires.FLAT]: Infinity,
    //   [Tires.TRAIN]: Infinity,
    // };
  }
};

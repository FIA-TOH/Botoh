export interface CurrentWeather {
  rainGlobal: number;
  rainS1: number;
  rainS2: number;
  rainS3: number;
  wetS1: number;
  wetS2: number;
  wetS3: number;
  wetAvg: number;
}

export let currentWeather: CurrentWeather = {
  rainGlobal: 0,
  rainS1: 0,
  rainS2: 0,
  rainS3: 0,
  wetS1: 0,
  wetS2: 0,
  wetS3: 0,
  wetAvg: 0,
};
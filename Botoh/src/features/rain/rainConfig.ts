export interface RainConfig {
  probability: number;
  duration: number;
  instabilityFactor: number;
}

let rainConfig: RainConfig = {
  probability: 0,
  duration: 0,
  instabilityFactor: 0,
};

export function setRainConfig(config: RainConfig) {
  rainConfig = config;
}

export function getRainConfig(): RainConfig {
  return rainConfig;
}

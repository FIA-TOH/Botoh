export interface DriverMarketScoresInput {
  velocidade: number;
  consistencia: number;
  tecnica: number;
  experiencia: number;
  chuva: number;
  estrategia: number;
  potencial: number;
  popularidade: number;
  hasPersonalSponsor: boolean;
}

export function calculateDriverOverall(input: Pick<
  DriverMarketScoresInput,
  'velocidade' | 'consistencia' | 'tecnica' | 'experiencia' | 'chuva' | 'estrategia'
>) {
  return (
    (
      input.velocidade
      + input.consistencia
      + input.tecnica
      + input.experiencia
      + input.chuva
      + input.estrategia
    ) / 30
  ) * 100;
}

export function calculateDriverCommercialScore(input: Pick<
  DriverMarketScoresInput,
  'potencial' | 'popularidade' | 'hasPersonalSponsor'
>) {
  const popularityScore = input.popularidade * 20;
  const sponsorScore = input.hasPersonalSponsor ? 100 : 0;

  return (input.potencial * 0.45) + (popularityScore * 0.35) + (sponsorScore * 0.20);
}

export function calculateDriverMarketScore(input: DriverMarketScoresInput) {
  const overall = calculateDriverOverall(input);
  const commercialScore = calculateDriverCommercialScore(input);

  return Number(((overall * 0.75) + (commercialScore * 0.25)).toFixed(2));
}

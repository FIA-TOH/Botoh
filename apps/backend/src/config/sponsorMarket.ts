export const SPONSOR_CONTRACT_CATEGORIES = [
  'title_sponsor',
  'main_partner',
  'official_partner',
  'minor_sponsor',
  'personal_sponsor',
] as const;

export type SponsorContractCategory = typeof SPONSOR_CONTRACT_CATEGORIES[number];

export interface MarketSponsorProfile {
  id: string;
  name: string;
  logoUrl: string | null;
  nacionalidade: string | null;
  tipo: string | null;
  setor: string | null;
  felicidade: number;
  prestigio: number;
  agressividade: number;
  focoEmMidia: number;
  focoTecnico: number;
  nacionalismo: number;
  orcamento: number;
  ambicao: number;
  fidelidade: number;
  publicoAlvo1: string | null;
  publicoAlvo2: string | null;
  scuderiasRelacionadas: string[] | null;
}

export interface MarketTeamProfile {
  id: string;
  name: string;
  prestigio: number;
  agressividade: number;
  popularidade: number;
  tecnica: number;
  momentoComercial: number;
  nacionalidades: string[] | null;
}

export interface CompatibilityScores {
  prestigio: number;
  agressividade: number;
  midia: number;
  tecnica: number;
  nacionalidade: number;
  ambicao: number;
  aleatoriedade: number;
}

export interface ContractValueBreakdown {
  base: number;
  multiplicadorOrcamento: number;
  multiplicadorPrestigio: number;
  multiplicadorMC: number;
  teto: number;
  valorAntesDoTeto: number;
  valorFinal: number;
}

export type SponsorRequirement = 'team_name' | 'livery' | 'team_name_and_livery' | 'none';
export type MarketSponsorOrigin = 'unassigned' | 'unhappy_0_10' | 'unhappy_10_20' | 'unhappy_20_30';

const CONTRACT_BASES: Record<SponsorContractCategory, number> = {
  title_sponsor: 2600000,
  main_partner: 1300000,
  official_partner: 550000,
  minor_sponsor: 200000,
  personal_sponsor: 120000,
};

const CONTRACT_CAPS: Record<SponsorContractCategory, number> = {
  title_sponsor: 8500000,
  main_partner: 4000000,
  official_partner: 1600000,
  minor_sponsor: 650000,
  personal_sponsor: 450000,
};

const BUDGET_MULTIPLIERS = [0.75, 1, 1.35, 1.75];
const PRESTIGE_MULTIPLIERS = [0, 0.8, 0.95, 1.1, 1.25, 1.4];

function getProposalChances(momentum: number) {
  if (momentum >= 90) return [0.95, 0.5, 0.2, 0.1];
  if (momentum >= 80) return [0.85, 0.4, 0.15, 0.05];
  if (momentum >= 70) return [0.7, 0.3, 0.1, 0];
  if (momentum >= 60) return [0.55, 0.2, 0.05, 0];
  if (momentum >= 50) return [0.4, 0.15, 0, 0];
  if (momentum >= 40) return [0.25, 0.1, 0, 0];
  if (momentum >= 30) return [0.1, 0, 0, 0];
  return [0, 0, 0, 0];
}

export function drawMarketProposalCount(
  commercialMomentum: number,
  randomScores = [Math.random(), Math.random(), Math.random(), Math.random()],
) {
  const chances = getProposalChances(commercialMomentum);
  if (randomScores[0] >= chances[0]) return 0;
  return 1 + chances.slice(1).reduce(
    (count, chance, index) => count + (randomScores[index + 1] < chance ? 1 : 0),
    0,
  );
}

export function drawMarketProposalCategory(randomScore = Math.random()): SponsorContractCategory {
  if (randomScore < 0.05) return 'title_sponsor';
  if (randomScore < 0.2) return 'main_partner';
  if (randomScore < 0.5) return 'official_partner';
  return 'minor_sponsor';
}

export function drawMarketSponsorOrigin(randomScore = Math.random()): MarketSponsorOrigin {
  if (randomScore < 0.9) return 'unassigned';
  if (randomScore < 0.96) return 'unhappy_0_10';
  if (randomScore < 0.99) return 'unhappy_10_20';
  return 'unhappy_20_30';
}

export function normalizeSponsorCategory(tipo: string | null | undefined): SponsorContractCategory | null {
  const normalized = tipo?.trim().toLowerCase().replace(/[\s-]+/g, '_');
  const aliases: Record<string, SponsorContractCategory> = {
    title: 'title_sponsor',
    title_sponsor: 'title_sponsor',
    main: 'main_partner',
    main_partner: 'main_partner',
    official: 'official_partner',
    official_partner: 'official_partner',
    minor: 'minor_sponsor',
    minor_sponsor: 'minor_sponsor',
    personal: 'personal_sponsor',
    personal_sponsor: 'personal_sponsor',
  };
  return normalized ? aliases[normalized] ?? null : null;
}

export function calculateCompatibility(
  sponsor: MarketSponsorProfile,
  team: MarketTeamProfile,
  randomScore = Math.random(),
) {
  const normalizedSponsorNationality = sponsor.nacionalidade?.trim().toLocaleLowerCase();
  const nationalityCompatible = Boolean(
    sponsor.scuderiasRelacionadas?.includes(team.id)
    || (normalizedSponsorNationality && team.nacionalidades?.some(
      (country) => country.trim().toLocaleLowerCase() === normalizedSponsorNationality,
    )),
  );
  const nonMatchingNationalityScores = [1, 0.7, 0.35, 0.05];
  const scores: CompatibilityScores = {
    prestigio: 1 - Math.abs(sponsor.prestigio - team.prestigio) / 4,
    agressividade: 1 - Math.abs(sponsor.agressividade - team.agressividade) / 3,
    midia: 1 - Math.abs(sponsor.focoEmMidia - team.popularidade) / 3,
    tecnica: 1 - Math.abs(sponsor.focoTecnico - team.tecnica) / 3,
    nacionalidade: nationalityCompatible ? 1 : nonMatchingNationalityScores[sponsor.nacionalismo] ?? 0.05,
    ambicao: 1 - Math.abs(sponsor.ambicao - team.prestigio) / 4,
    aleatoriedade: Math.min(1, Math.max(0, randomScore)),
  };
  const compatibilidade = (
    scores.prestigio * 25
    + scores.agressividade * 12
    + scores.midia * 16
    + scores.tecnica * 16
    + scores.nacionalidade * 16
    + scores.ambicao * 10
    + scores.aleatoriedade * 5
  );

  return {
    scores,
    nationalityCompatible,
    compatibilidade: Number(compatibilidade.toFixed(2)),
    pesoFinal: Number(Math.max(5, Math.sqrt(compatibilidade) * 10).toFixed(2)),
  };
}

function getCommercialMomentumMultiplier(momentum: number) {
  if (momentum >= 90) return 1.5;
  if (momentum >= 80) return 1.35;
  if (momentum >= 70) return 1.22;
  if (momentum >= 60) return 1.1;
  if (momentum >= 50) return 1;
  if (momentum >= 40) return 0.9;
  if (momentum >= 30) return 0.75;
  return 0.6;
}

export function calculateContractValue(
  category: SponsorContractCategory,
  sponsor: Pick<MarketSponsorProfile, 'orcamento' | 'prestigio'>,
  team: Pick<MarketTeamProfile, 'momentoComercial'>,
): ContractValueBreakdown {
  const base = CONTRACT_BASES[category];
  const teto = CONTRACT_CAPS[category];
  const multiplicadorOrcamento = BUDGET_MULTIPLIERS[sponsor.orcamento] ?? BUDGET_MULTIPLIERS[1];
  const multiplicadorPrestigio = PRESTIGE_MULTIPLIERS[sponsor.prestigio] ?? PRESTIGE_MULTIPLIERS[1];
  const multiplicadorMC = getCommercialMomentumMultiplier(team.momentoComercial);
  const valorAntesDoTeto = Math.round(base * multiplicadorOrcamento * multiplicadorPrestigio * multiplicadorMC);
  return {
    base,
    multiplicadorOrcamento,
    multiplicadorPrestigio,
    multiplicadorMC,
    teto,
    valorAntesDoTeto,
    valorFinal: Math.min(teto, valorAntesDoTeto),
  };
}

export function drawSponsorRequirement(
  category: SponsorContractCategory,
  randomScore = Math.random(),
): SponsorRequirement {
  if (category !== 'title_sponsor') return 'none';
  if (randomScore < 0.4) return 'team_name';
  if (randomScore < 0.6) return 'livery';
  if (randomScore < 0.7) return 'team_name_and_livery';
  return 'none';
}

export function selectWeightedProposal<T extends { pesoFinal: number }>(
  proposals: T[],
  randomScore = Math.random(),
): T | null {
  if (proposals.length === 0) return null;
  const totalWeight = proposals.reduce((total, proposal) => total + proposal.pesoFinal, 0);
  let draw = Math.min(0.999999999, Math.max(0, randomScore)) * totalWeight;
  for (const proposal of proposals) {
    draw -= proposal.pesoFinal;
    if (draw <= 0) return proposal;
  }
  return proposals[proposals.length - 1];
}

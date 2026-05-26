export const SPONSOR_SECTORS = [
  'Tecnologia',
  'Energia',
  'Petróleo',
  'Banco',
  'Fintech',
  'Bebida',
  'Alimentação',
  'Luxo',
  'Moda',
  'Games',
  'Streaming',
  'Mídia',
  'Automotivo',
  'Aviação',
  'Turismo',
  'Academia/Esporte',
  'Nacional/Regional',
  'Segurança',
  'Cassino/Apostas',
  'Telecom',
  'Saúde',
  'Educação',
  'Logística',
  'Varejo',
  'Cripto',
  'Sustentabilidade',
  'Cigarro',
] as const;

export type SponsorSector = typeof SPONSOR_SECTORS[number];

export type SponsorAttribute =
  | 'prestigio'
  | 'agressividade'
  | 'focoEmMidia'
  | 'focoTecnico'
  | 'nacionalismo'
  | 'fidelidade'
  | 'orcamento'
  | 'ambicao';

export const SPONSOR_TARGET_AUDIENCE_MODIFIERS = {
  tech: {
    focoTecnico: 2, orcamento: 1, ambicao: 1, fidelidade: -1, agressividade: -1,
  },
  luxo: {
    prestigio: 2, orcamento: 2, focoEmMidia: 1, ambicao: 1, agressividade: -1, nacionalismo: -1, fidelidade: -1,
  },
  povao: {
    focoEmMidia: 2, fidelidade: 2, nacionalismo: 1, prestigio: -1, orcamento: -1, ambicao: -1,
  },
  jovens: {
    focoEmMidia: 2, agressividade: 2, focoTecnico: -1, orcamento: -1, fidelidade: -1,
  },
  banco_financeiro: {
    orcamento: 2, ambicao: 1, prestigio: 1, agressividade: -2, fidelidade: -1,
  },
  petrolifera_energia: {
    orcamento: 2, focoTecnico: 2, prestigio: 1, ambicao: 1, agressividade: -1, fidelidade: -1, nacionalismo: -1,
  },
  esportes_performance: {
    agressividade: 1, focoEmMidia: 1, ambicao: 1, fidelidade: 1, focoTecnico: -1,
  },
  nacionalista: {
    nacionalismo: 2, fidelidade: 1, focoEmMidia: 1, orcamento: -1, prestigio: -1,
  },
  militar_seguranca: {
    focoTecnico: 2, prestigio: 1, orcamento: 1, focoEmMidia: -2, agressividade: -1,
  },
  entretenimento: {
    focoEmMidia: 2, agressividade: 1, focoTecnico: -1, fidelidade: -1,
  },
  cassino: {
    orcamento: 2, agressividade: 2, focoEmMidia: 1, fidelidade: -2, prestigio: -1,
  },
  sustentavel: {
    focoEmMidia: 2, prestigio: 1, fidelidade: 1, agressividade: -1, orcamento: -1,
  },
} as const satisfies Record<string, Partial<Record<SponsorAttribute, number>>>;

export type SponsorTargetAudience = keyof typeof SPONSOR_TARGET_AUDIENCE_MODIFIERS;
export const SPONSOR_TARGET_AUDIENCES = Object.keys(
  SPONSOR_TARGET_AUDIENCE_MODIFIERS,
) as SponsorTargetAudience[];

'use client';

import React, { useEffect, useState } from 'react';
import { PaginationControls, usePagination } from './PaginationControls';

export const SPONSOR_SECTORS = [
  'Tecnologia', 'Energia', 'Petróleo', 'Banco', 'Fintech', 'Bebida', 'Alimentação',
  'Luxo', 'Moda', 'Games', 'Streaming', 'Mídia', 'Automotivo', 'Aviação', 'Turismo',
  'Academia/Esporte', 'Nacional/Regional', 'Segurança', 'Cassino/Apostas', 'Telecom',
  'Saúde', 'Educação', 'Logística', 'Varejo', 'Cripto', 'Sustentabilidade', 'Cigarro',
] as const;

export const SPONSOR_TARGET_AUDIENCES = [
  'tech', 'luxo', 'povao', 'jovens', 'banco_financeiro', 'petrolifera_energia',
  'esportes_performance', 'nacionalista', 'militar_seguranca', 'entretenimento',
  'cassino', 'sustentavel',
] as const;
export type SponsorTargetAudience = typeof SPONSOR_TARGET_AUDIENCES[number];

const SPONSOR_ATTRIBUTE_LIMITS = {
  prestigio: { min: 1, max: 5 },
  agressividade: { min: 0, max: 3 },
  focoEmMidia: { min: 0, max: 3 },
  focoTecnico: { min: 0, max: 3 },
  nacionalismo: { min: 0, max: 3 },
  fidelidade: { min: 0, max: 3 },
  orcamento: { min: 0, max: 3 },
  ambicao: { min: 1, max: 5 },
} as const;
type SponsorModifiedAttribute = keyof typeof SPONSOR_ATTRIBUTE_LIMITS;

export const SPONSOR_TARGET_AUDIENCE_MODIFIERS: Record<
  SponsorTargetAudience,
  Partial<Record<SponsorModifiedAttribute, number>>
> = {
  tech: { focoTecnico: 2, orcamento: 1, ambicao: 1, fidelidade: -1, agressividade: -1 },
  luxo: { prestigio: 2, orcamento: 2, focoEmMidia: 1, ambicao: 1, agressividade: -1, nacionalismo: -1, fidelidade: -1 },
  povao: { focoEmMidia: 2, fidelidade: 2, nacionalismo: 1, prestigio: -1, orcamento: -1, ambicao: -1 },
  jovens: { focoEmMidia: 2, agressividade: 2, focoTecnico: -1, orcamento: -1, fidelidade: -1 },
  banco_financeiro: { orcamento: 2, ambicao: 1, prestigio: 1, agressividade: -2, fidelidade: -1 },
  petrolifera_energia: { orcamento: 2, focoTecnico: 2, prestigio: 1, ambicao: 1, agressividade: -1, fidelidade: -1, nacionalismo: -1 },
  esportes_performance: { agressividade: 1, focoEmMidia: 1, ambicao: 1, fidelidade: 1, focoTecnico: -1 },
  nacionalista: { nacionalismo: 2, fidelidade: 1, focoEmMidia: 1, orcamento: -1, prestigio: -1 },
  militar_seguranca: { focoTecnico: 2, prestigio: 1, orcamento: 1, focoEmMidia: -2, agressividade: -1 },
  entretenimento: { focoEmMidia: 2, agressividade: 1, focoTecnico: -1, fidelidade: -1 },
  cassino: { orcamento: 2, agressividade: 2, focoEmMidia: 1, fidelidade: -2, prestigio: -1 },
  sustentavel: { focoEmMidia: 2, prestigio: 1, fidelidade: 1, agressividade: -1, orcamento: -1 },
};

export const SPONSOR_CONTRACT_CATEGORIES = [
  'title_sponsor', 'main_partner', 'official_partner', 'minor_sponsor', 'personal_sponsor',
] as const;
export type SponsorContractCategory = typeof SPONSOR_CONTRACT_CATEGORIES[number];

export interface SponsorCatalogItem {
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
  pilotUserId?: string | null;
  pilotUsername?: string | null;
  scuderiasRelacionadas: { id: string; name: string }[];
}

type SponsorAudienceForm = Pick<
  SponsorCatalogItem,
  SponsorModifiedAttribute | 'publicoAlvo1' | 'publicoAlvo2'
>;

export function applyTargetAudienceChange<T extends SponsorAudienceForm>(
  sponsor: T,
  field: 'publicoAlvo1' | 'publicoAlvo2',
  audience: SponsorTargetAudience | null,
): T {
  const previousAudience = sponsor[field] as SponsorTargetAudience | null;
  const previousModifiers = previousAudience ? SPONSOR_TARGET_AUDIENCE_MODIFIERS[previousAudience] : {};
  const nextModifiers = audience ? SPONSOR_TARGET_AUDIENCE_MODIFIERS[audience] : {};
  const changed = { ...sponsor, [field]: audience };

  (Object.keys(SPONSOR_ATTRIBUTE_LIMITS) as SponsorModifiedAttribute[]).forEach((attribute) => {
    const delta = (nextModifiers[attribute] ?? 0) - (previousModifiers[attribute] ?? 0);
    const limits = SPONSOR_ATTRIBUTE_LIMITS[attribute];
    changed[attribute] = Math.min(limits.max, Math.max(limits.min, sponsor[attribute] + delta));
  });

  return changed as T;
}

export interface EconomicScuderia {
  id: string;
  name: string;
  tag: string;
  emoji: string;
  color: string;
  logoUrl: string | null;
  momentoComercial: number;
  prestigio: number;
  agressividade: number;
  popularidade: number;
  tecnica: number;
  nacionalidades: string[] | null;
  manualNacionalidades?: string[] | null;
  driverNacionalidades?: string[] | null;
  setores: string[] | null;
  sponsors: { name: string; category: SponsorContractCategory; slotNumber: number }[];
}

export interface SponsorMarketProposal {
  sponsor: Omit<SponsorCatalogItem, 'scuderiasRelacionadas'> & { scuderiasRelacionadas?: string[] };
  category: SponsorContractCategory;
  origem: 'unassigned' | 'unhappy_0_10' | 'unhappy_10_20' | 'unhappy_20_30';
  origemEquipes: string[];
  compatibilidade: number;
  pesoFinal: number;
  scores: {
    prestigio: number;
    agressividade: number;
    midia: number;
    tecnica: number;
    nacionalidade: number;
    ambicao: number;
    aleatoriedade: number;
  };
  nationalityCompatible: boolean;
  valorContrato: {
    base: number;
    multiplicadorOrcamento: number;
    multiplicadorPrestigio: number;
    multiplicadorMC: number;
    teto: number;
    valorAntesDoTeto: number;
    valorFinal: number;
  };
  exigencia:
    | 'title_sponsor_name_media'
    | 'title_sponsor_full_livery_media'
    | 'title_sponsor_40_livery_media'
    | 'title_sponsor_25_livery_media'
    | 'none';
  candidateCount: number;
  ressalvas?: ('setor_repetido' | 'tipo_repetido')[];
}

export interface SponsorMarketResult {
  team: { id: string; name: string; momentoComercial: number };
  requestedProposalCount: number;
  proposals: SponsorMarketProposal[];
}

export type RaceMissionDifficulty = 'easy' | 'medium' | 'hard' | 'insane';

export interface RaceMissionGenerationResult {
  team: { id: string; name: string };
  missions: {
    sponsorId: string;
    sponsorName: string;
    category: SponsorContractCategory;
    difficulty: RaceMissionDifficulty;
    reward: number;
    missionId: string;
  }[];
  skipped: {
    sponsorId: string;
    sponsorName: string;
    category: SponsorContractCategory;
  }[];
}

interface Labels {
  sponsorMarket: string;
  sponsorTable: string;
  teamsTable: string;
  marketSimulator: string;
  createSponsor: string;
  logo: string;
  name: string;
  relatedScuderias: string;
  nationality: string;
  type: string;
  sector: string;
  happiness: string;
  prestige: string;
  aggressiveness: string;
  media: string;
  technique: string;
  nationalism: string;
  budget: string;
  ambition: string;
  loyalty: string;
  commercialMomentum: string;
  popularity: string;
  nationalities: string;
  sectors: string;
  targetAudience1: string;
  targetAudience2: string;
  targetAudiences: Record<string, string>;
  sponsor: string;
  scuderia: string;
  compatibility: string;
  nationalityMatch: string;
  sectorMatch: string;
  noMatch: string;
  match: string;
  selectOption: string;
  saveHint: string;
  noSponsors: string;
  noScuderias: string;
  generateMarket: string;
  generatingMarket: string;
  generateRaceMissions: string;
  generatingRaceMissions: string;
  selectAllScuderias: string;
  clearSelection: string;
  selectedScuderias: string;
  noProposalsReceived: string;
  proposalsReceived: string;
  raceMissionsGenerated: string;
  noRaceMissionsGenerated: string;
  raceMissionSkipped: string;
  difficulty: string;
  raceMissionDifficulties: Record<RaceMissionDifficulty, string>;
  proposalOrigin: string;
  proposalOrigins: Record<SponsorMarketProposal['origem'], string>;
  contractType: string;
  contractTypes: Record<SponsorContractCategory, string>;
  contractValue: string;
  requirement: string;
  requirements: Record<string, string>;
  proposalReason: string;
  reasons: {
    nationality: string;
    prestige: string;
    media: string;
    technique: string;
    chance: string;
  };
  multipliers: string;
  scores: string;
  scoreLabels: Record<string, string>;
  finalWeight: string;
  caveats: string;
  noCaveats: string;
  caveatLabels: Record<'setor_repetido' | 'tipo_repetido', string>;
  baseValue: string;
  uncappedValue: string;
  budgetMultiplier: string;
  prestigeMultiplier: string;
  commercialMomentumMultiplier: string;
  cap: string;
  candidates: string;
  titleSlot: string;
  mainSlot: string;
  officialSlot: string;
  minorSlot: string;
  personalSlot: string;
  rowsPerPage: string;
  page: string;
  pageOf: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
}

interface Props {
  labels: Labels;
  sponsors: SponsorCatalogItem[];
  scuderias: EconomicScuderia[];
  isOpen: boolean;
  onToggle: () => void;
  onCreateSponsor: () => void;
  onSponsorDraftChange: (sponsor: SponsorCatalogItem) => void;
  onSponsorSave: (sponsor: SponsorCatalogItem) => Promise<void>;
  onScuderiaDraftChange: (scuderia: EconomicScuderia) => void;
  onScuderiaSave: (scuderia: EconomicScuderia) => Promise<void>;
  onGenerateMarket: (teamId: string) => Promise<SponsorMarketResult | null>;
  onGenerateRaceMissions: (teamIds: string[]) => Promise<RaceMissionGenerationResult[]>;
}

function clampInput(value: string, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min;
}

function logoPath(teamName: string) {
  return `/img/scuderia/logos/${encodeURIComponent(teamName.trim().toLowerCase())}.png`;
}

export function SponsorMarketSection({
  labels,
  sponsors,
  scuderias,
  isOpen,
  onToggle,
  onCreateSponsor,
  onSponsorDraftChange,
  onSponsorSave,
  onScuderiaDraftChange,
  onScuderiaSave,
  onGenerateMarket,
  onGenerateRaceMissions,
}: Props) {
  const [selectedScuderiaIds, setSelectedScuderiaIds] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatingRaceMissions, setGeneratingRaceMissions] = useState(false);
  const [marketResults, setMarketResults] = useState<SponsorMarketResult[]>([]);
  const [raceMissionResults, setRaceMissionResults] = useState<RaceMissionGenerationResult[]>([]);
  const sponsorPagination = usePagination(sponsors);
  const scuderiaPagination = usePagination(scuderias);
  const sponsorSlots = [
    { category: 'title_sponsor', slotNumber: 1, label: labels.titleSlot },
    ...[1, 2].map((slotNumber) => ({ category: 'main_partner', slotNumber, label: `${labels.mainSlot} ${slotNumber}` })),
    ...[1, 2, 3, 4].map((slotNumber) => ({ category: 'official_partner', slotNumber, label: `${labels.officialSlot} ${slotNumber}` })),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((slotNumber) => ({ category: 'minor_sponsor', slotNumber, label: `${labels.minorSlot} ${slotNumber}` })),
    ...[1, 2, 3, 4].map((slotNumber) => ({ category: 'personal_sponsor', slotNumber, label: `${labels.personalSlot} ${slotNumber}` })),
  ] as { category: SponsorContractCategory; slotNumber: number; label: string }[];

  useEffect(() => {
    const availableIds = new Set(scuderias.map((scuderia) => scuderia.id));
    setSelectedScuderiaIds((current) => current.filter((id) => availableIds.has(id)));
  }, [scuderias]);

  function updateSponsor<K extends keyof SponsorCatalogItem>(
    sponsor: SponsorCatalogItem,
    key: K,
    value: SponsorCatalogItem[K],
  ) {
    onSponsorDraftChange({ ...sponsor, [key]: value });
  }

  function updateScuderia<K extends keyof EconomicScuderia>(
    scuderia: EconomicScuderia,
    key: K,
    value: EconomicScuderia[K],
  ) {
    onScuderiaDraftChange({ ...scuderia, [key]: value });
  }

  async function generateProposal() {
    if (selectedScuderiaIds.length === 0) return;
    setGenerating(true);
    try {
      const proposals = await Promise.all(
        selectedScuderiaIds.map((teamId) => onGenerateMarket(teamId)),
      );
      setMarketResults(proposals.filter((result): result is SponsorMarketResult => result !== null));
    } finally {
      setGenerating(false);
    }
  }

  async function generateRaceMissions() {
    if (selectedScuderiaIds.length === 0) return;
    setGeneratingRaceMissions(true);
    try {
      setRaceMissionResults(await onGenerateRaceMissions(selectedScuderiaIds));
    } finally {
      setGeneratingRaceMissions(false);
    }
  }

  function toggleSelectedScuderia(scuderiaId: string) {
    setSelectedScuderiaIds((current) => (
      current.includes(scuderiaId)
        ? current.filter((id) => id !== scuderiaId)
        : [...current, scuderiaId]
    ));
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  }

  function proposalReason(proposal: SponsorMarketProposal) {
    if (proposal.nationalityCompatible) return labels.reasons.nationality;
    if (proposal.scores.prestigio >= 0.75) return labels.reasons.prestige;
    if (proposal.scores.midia >= 0.67 && proposal.scores.midia >= proposal.scores.tecnica) return labels.reasons.media;
    if (proposal.scores.tecnica >= 0.67 && proposal.scores.tecnica > proposal.scores.midia) return labels.reasons.technique;
    return labels.reasons.chance;
  }

  function proposalCaveats(proposal: SponsorMarketProposal) {
    if (!proposal.ressalvas?.length) return labels.noCaveats;
    return proposal.ressalvas.map((caveat) => labels.caveatLabels[caveat]).join(', ');
  }

  return (
    <section className="mt-6 rounded-lg bg-gray-800 p-6">
      <div className="flex items-center justify-between gap-4">
        <button type="button" className="flex items-center gap-3 text-left" onClick={onToggle}>
          <span className={`text-xl transition-transform ${isOpen ? 'rotate-90' : ''}`}>&rsaquo;</span>
          <h2 className="text-2xl font-semibold">{labels.sponsorMarket}</h2>
        </button>
        {isOpen && (
          <button type="button" className="rounded-lg bg-purple-600 px-4 py-2" onClick={onCreateSponsor}>
            {labels.createSponsor}
          </button>
        )}
      </div>
      {isOpen && (
        <div className="mt-5 space-y-8">
          <section>
            <h3 className="mb-2 text-lg font-semibold">{labels.sponsorTable}</h3>
            <p className="mb-3 text-sm text-gray-400">{labels.saveHint}</p>
            <div className="overflow-x-auto">
              <table className="min-w-[1980px] text-left text-sm">
                <thead className="text-gray-300">
                  <tr>
                    {[labels.logo, labels.name, labels.relatedScuderias, labels.nationality, labels.type,
                      labels.sector, labels.happiness, labels.prestige, labels.aggressiveness, labels.media,
                      labels.technique, labels.nationalism, labels.budget, labels.ambition, labels.loyalty,
                      labels.targetAudience1, labels.targetAudience2].map((label) => (
                      <th key={label} className="px-2 py-2">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sponsorPagination.rows.map((sponsor) => (
                    <tr key={sponsor.id} className="border-t border-gray-700 align-top">
                      <td className="px-2 py-2">
                        {sponsor.logoUrl ? <img src={sponsor.logoUrl} alt="" className="h-10 w-10 object-contain" /> : '---'}
                      </td>
                      <td className="px-2 py-2"><input className="w-36 rounded bg-gray-700 p-2" value={sponsor.name} onChange={(e) => updateSponsor(sponsor, 'name', e.target.value)} onBlur={() => onSponsorSave(sponsor)} /></td>
                      <td className="px-2 py-2">
                        <div
                          className="max-w-48 overflow-x-auto whitespace-nowrap rounded bg-gray-700 p-2"
                          title={sponsor.scuderiasRelacionadas.map((scuderia) => scuderia.name).join(', ')}
                        >
                          {sponsor.scuderiasRelacionadas.length
                            ? sponsor.scuderiasRelacionadas.map((scuderia) => scuderia.name).join(', ')
                            : '---'}
                        </div>
                      </td>
                      <td className="px-2 py-2"><input className="w-32 rounded bg-gray-700 p-2" value={sponsor.nacionalidade ?? ''} onChange={(e) => updateSponsor(sponsor, 'nacionalidade', e.target.value)} onBlur={() => onSponsorSave(sponsor)} /></td>
                      <td className="px-2 py-2">
                        <select className="w-40 rounded bg-gray-700 p-2" value={sponsor.tipo ?? ''} onChange={(e) => {
                          const changed = { ...sponsor, tipo: e.target.value || null };
                          onSponsorDraftChange(changed);
                          void onSponsorSave(changed);
                        }}>
                          <option value="">---</option>
                          {SPONSOR_CONTRACT_CATEGORIES.map((category) => <option key={category} value={category}>{labels.contractTypes[category]}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select className="w-40 rounded bg-gray-700 p-2" value={sponsor.setor ?? ''} onChange={(e) => {
                          const changed = { ...sponsor, setor: e.target.value || null };
                          onSponsorDraftChange(changed);
                          void onSponsorSave(changed);
                        }}>
                          <option value="">---</option>
                          {SPONSOR_SECTORS.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
                        </select>
                      </td>
                      {([
                        ['felicidade', 0, 100], ['prestigio', 1, 5], ['agressividade', 0, 3],
                        ['focoEmMidia', 0, 3], ['focoTecnico', 0, 3], ['nacionalismo', 0, 3],
                        ['orcamento', 0, 3], ['ambicao', 1, 5], ['fidelidade', 0, 3],
                      ] as const).map(([key, min, max]) => (
                        <td key={key} className="px-2 py-2">
                          <input type="number" min={min} max={max} className="w-16 rounded bg-gray-700 p-2" value={sponsor[key]} onChange={(e) => updateSponsor(sponsor, key, clampInput(e.target.value, min, max))} onBlur={() => onSponsorSave(sponsor)} />
                        </td>
                      ))}
                      {(['publicoAlvo1', 'publicoAlvo2'] as const).map((key) => (
                        <td key={key} className="px-2 py-2">
                          <select className="w-44 rounded bg-gray-700 p-2" value={sponsor[key] ?? ''} onChange={(event) => {
                            const changed = applyTargetAudienceChange(
                              sponsor,
                              key,
                              (event.target.value || null) as SponsorTargetAudience | null,
                            );
                            onSponsorDraftChange(changed);
                            void onSponsorSave(changed);
                          }}>
                            <option value="">---</option>
                            {SPONSOR_TARGET_AUDIENCES.map((audience) => <option key={audience} value={audience}>{labels.targetAudiences[audience]}</option>)}
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                  {sponsors.length === 0 && <tr><td colSpan={17} className="px-2 py-4 text-gray-400">{labels.noSponsors}</td></tr>}
                </tbody>
              </table>
            </div>
            <PaginationControls labels={labels} {...sponsorPagination} />
          </section>

          <section>
            <h3 className="mb-2 text-lg font-semibold">{labels.teamsTable}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-[2850px] text-left text-sm">
                <thead className="text-gray-300">
                  <tr>
                    {[labels.logo, labels.name, labels.commercialMomentum, labels.prestige, labels.aggressiveness,
                      labels.popularity, labels.technique, labels.nationalities, ...sponsorSlots.map((slot) => slot.label)].map((label) => (
                      <th key={label} className="px-2 py-2">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scuderiaPagination.rows.map((scuderia) => (
                    <tr key={scuderia.id} className="border-t border-gray-700">
                      <td className="px-2 py-2">
                        <img src={scuderia.logoUrl || logoPath(scuderia.name)} alt="" className="h-10 w-10 object-contain" />
                      </td>
                      <td className="px-2 py-2"><input className="w-40 rounded bg-gray-700 p-2" value={scuderia.name} onChange={(e) => updateScuderia(scuderia, 'name', e.target.value)} onBlur={() => onScuderiaSave(scuderia)} /></td>
                      {([
                        ['momentoComercial', 0, 100], ['prestigio', 1, 5], ['agressividade', 0, 3],
                        ['popularidade', 0, 3], ['tecnica', 0, 3],
                      ] as const).map(([key, min, max]) => (
                        <td key={key} className="px-2 py-2">
                          <input type="number" min={min} max={max} className="w-16 rounded bg-gray-700 p-2" value={scuderia[key]} onChange={(e) => updateScuderia(scuderia, key, clampInput(e.target.value, min, max))} onBlur={() => onScuderiaSave(scuderia)} />
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <div className="max-w-48 overflow-x-auto whitespace-nowrap" title={(scuderia.nacionalidades ?? []).join(', ')}>
                          <input className="w-48 rounded bg-gray-700 p-2" value={(scuderia.nacionalidades ?? []).join(', ')} onChange={(e) => updateScuderia(scuderia, 'nacionalidades', e.target.value.split(',').map((value) => value.trim()).filter(Boolean))} onBlur={() => onScuderiaSave(scuderia)} />
                        </div>
                      </td>
                      {sponsorSlots.map((slot) => (
                        <td key={`${slot.category}-${slot.slotNumber}`} className="px-2 py-2">
                          {scuderia.sponsors?.find((sponsor) => sponsor.category === slot.category && sponsor.slotNumber === slot.slotNumber)?.name ?? '---'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {scuderias.length === 0 && <tr><td colSpan={27} className="px-2 py-4 text-gray-400">{labels.noScuderias}</td></tr>}
                </tbody>
              </table>
            </div>
            <PaginationControls labels={labels} {...scuderiaPagination} />
          </section>

          <section className="rounded-lg bg-gray-900/50 p-4">
            <h3 className="mb-4 text-lg font-semibold">{labels.marketSimulator}</h3>
            <div className="grid items-end gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>{labels.scuderia}</span>
                  <div className="flex gap-2">
                    <button type="button" className="rounded bg-gray-700 px-2 py-1" onClick={() => setSelectedScuderiaIds(scuderias.map((scuderia) => scuderia.id))}>
                      {labels.selectAllScuderias}
                    </button>
                    <button type="button" className="rounded bg-gray-700 px-2 py-1" onClick={() => setSelectedScuderiaIds([])}>
                      {labels.clearSelection}
                    </button>
                  </div>
                </div>
                <div className="max-h-36 overflow-y-auto rounded bg-gray-700 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {scuderias.map((scuderia) => (
                      <label key={scuderia.id} className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedScuderiaIds.includes(scuderia.id)} onChange={() => toggleSelectedScuderia(scuderia.id)} />
                        <span className="truncate">{scuderia.name}</span>
                      </label>
                    ))}
                  </div>
                  {scuderias.length === 0 && <span className="text-gray-400">{labels.noScuderias}</span>}
                </div>
                <p className="mt-2 text-xs text-gray-400">{labels.selectedScuderias}: {selectedScuderiaIds.length}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={selectedScuderiaIds.length === 0 || generating} onClick={generateProposal} className="rounded bg-purple-600 px-4 py-2 disabled:bg-gray-600">
                  {generating ? labels.generatingMarket : labels.generateMarket}
                </button>
                <button type="button" disabled={selectedScuderiaIds.length === 0 || generatingRaceMissions} onClick={generateRaceMissions} className="rounded bg-red-600 px-4 py-2 disabled:bg-gray-600">
                  {generatingRaceMissions ? labels.generatingRaceMissions : labels.generateRaceMissions}
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {marketResults.map((result) => (
                <article key={result.team.id} className="rounded-lg border border-gray-600 bg-gray-700 p-4">
                  <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-bold">{result.team.name}</h4>
                      <p className="text-sm text-gray-300">{labels.commercialMomentum}: {result.team.momentoComercial}</p>
                    </div>
                    <p className="text-sm font-semibold">{labels.proposalsReceived}: {result.proposals.length}</p>
                  </header>
                  {result.proposals.length === 0 ? (
                    <p className="rounded bg-gray-800 p-4 text-gray-300">{labels.noProposalsReceived}</p>
                  ) : result.proposals.map((proposal, index) => (
                    <section key={`${proposal.sponsor.id}-${index}`} className="mb-3 rounded bg-gray-800 p-3 last:mb-0">
                      <header className="mb-3 flex items-center gap-3">
                        {proposal.sponsor.logoUrl && <img src={proposal.sponsor.logoUrl} alt="" className="h-12 w-12 object-contain" />}
                        <div className="min-w-0">
                          <h5 className="truncate font-bold">{proposal.sponsor.name}</h5>
                          <p className="text-sm">{labels.contractTypes[proposal.category]} · {proposal.sponsor.setor ?? '---'}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="font-bold text-emerald-300">{proposal.compatibilidade}%</p>
                          <p className="text-xs text-gray-300">{labels.compatibility}</p>
                        </div>
                      </header>
                      <div className="mb-3 grid gap-2 text-sm sm:grid-cols-2">
                        <p><strong>{labels.contractValue}:</strong> {formatMoney(proposal.valorContrato.valorFinal)}</p>
                        <p><strong>{labels.happiness}:</strong> {proposal.sponsor.felicidade}</p>
                        <p><strong>{labels.proposalOrigin}:</strong> {labels.proposalOrigins[proposal.origem]}{proposal.origemEquipes.length ? ` (${proposal.origemEquipes.join(', ')})` : ''}</p>
                        <p><strong>{labels.requirement}:</strong> {labels.requirements[proposal.exigencia]}</p>
                        <p><strong>{labels.finalWeight}:</strong> {proposal.pesoFinal}</p>
                        <p><strong>{labels.caveats}:</strong> {proposalCaveats(proposal)}</p>
                        <p><strong>{labels.proposalReason}:</strong> {proposalReason(proposal)}</p>
                      </div>
                      <details className="text-sm">
                        <summary className="cursor-pointer font-semibold">{labels.scores} / {labels.multipliers}</summary>
                        <div className="mt-3 grid gap-1 sm:grid-cols-2">
                          {Object.entries(proposal.scores).map(([score, value]) => (
                            <p key={score}>{labels.scoreLabels[score]}: {(value * 100).toFixed(1)}%</p>
                          ))}
                          <p>{labels.candidates}: {proposal.candidateCount}</p>
                          <p>{labels.baseValue}: {formatMoney(proposal.valorContrato.base)}</p>
                          <p>{labels.uncappedValue}: {formatMoney(proposal.valorContrato.valorAntesDoTeto)}</p>
                          <p>{labels.budgetMultiplier}: {proposal.valorContrato.multiplicadorOrcamento.toFixed(2)}x</p>
                          <p>{labels.prestigeMultiplier}: {proposal.valorContrato.multiplicadorPrestigio.toFixed(2)}x</p>
                          <p>{labels.commercialMomentumMultiplier}: {proposal.valorContrato.multiplicadorMC.toFixed(2)}x</p>
                          <p>{labels.cap}: {formatMoney(proposal.valorContrato.teto)}</p>
                        </div>
                      </details>
                    </section>
                  ))}
                </article>
              ))}
            </div>
            {marketResults.length === 0 && (
              <div className="mt-4 text-sm text-gray-400">
                {labels.selectOption}
              </div>
            )}
            {raceMissionResults.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-lg font-semibold">{labels.raceMissionsGenerated}</h4>
                <div className="grid gap-4 xl:grid-cols-2">
                  {raceMissionResults.map((result) => (
                    <article key={`race-missions-${result.team.id}`} className="rounded-lg border border-gray-600 bg-gray-700 p-4">
                      <h5 className="mb-3 font-bold">{result.team.name}</h5>
                      {result.missions.length === 0 ? (
                        <p className="rounded bg-gray-800 p-3 text-sm text-gray-300">{labels.noRaceMissionsGenerated}</p>
                      ) : (
                        <div className="space-y-2">
                          {result.missions.map((mission) => (
                            <div key={mission.missionId} className="rounded bg-gray-800 p-3 text-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold">{mission.sponsorName}</span>
                                <span className="text-emerald-300">{formatMoney(mission.reward)}</span>
                              </div>
                              <p className="mt-1 text-gray-300">
                                {labels.contractTypes[mission.category]} · {labels.difficulty}: {labels.raceMissionDifficulties[mission.difficulty]}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      {result.skipped.length > 0 && (
                        <p className="mt-3 text-xs text-gray-400">
                          {labels.raceMissionSkipped}: {result.skipped.map((sponsor) => sponsor.sponsorName).join(', ')}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

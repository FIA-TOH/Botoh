'use client';

import React from 'react';
import {
  applyTargetAudienceChange,
  SPONSOR_CONTRACT_CATEGORIES,
  SPONSOR_SECTORS,
  SPONSOR_TARGET_AUDIENCES,
  SponsorCatalogItem,
  SponsorTargetAudience,
} from './SponsorMarketSection';

export type SponsorFormData = Omit<SponsorCatalogItem, 'id' | 'scuderiasRelacionadas'>;

export const EMPTY_SPONSOR_FORM: SponsorFormData = {
  name: '',
  logoUrl: '',
  nacionalidade: '',
  tipo: '',
  setor: null,
  felicidade: 50,
  prestigio: 1,
  agressividade: 1,
  focoEmMidia: 1,
  focoTecnico: 1,
  nacionalismo: 1,
  orcamento: 1,
  ambicao: 1,
  fidelidade: 1,
  publicoAlvo1: null,
  publicoAlvo2: null,
};

interface Labels {
  createSponsor: string;
  editSponsor: string;
  logoUrl: string;
  name: string;
  nationality: string;
  type: string;
  sector: string;
  happiness: string;
  prestige: string;
  aggressiveness: string;
  mediaFocus: string;
  technicalFocus: string;
  nationalism: string;
  budget: string;
  ambition: string;
  loyalty: string;
  targetAudience1: string;
  targetAudience2: string;
  targetAudiences: Record<string, string>;
  contractTypes: Record<string, string>;
  save: string;
  cancel: string;
}

interface Props {
  labels: Labels;
  isEditing: boolean;
  form: SponsorFormData;
  onChange: (form: SponsorFormData) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function SponsorFormModal({
  labels,
  isEditing,
  form,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  function setField<K extends keyof SponsorFormData>(key: K, value: SponsorFormData[K]) {
    onChange({ ...form, [key]: value });
  }

  function setTargetAudience(
    key: 'publicoAlvo1' | 'publicoAlvo2',
    value: SponsorTargetAudience | null,
  ) {
    onChange(applyTargetAudienceChange(form, key, value));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <form onSubmit={onSubmit} className="max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-lg bg-gray-800 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{isEditing ? labels.editSponsor : labels.createSponsor}</h2>
          <button type="button" onClick={onClose}>×</button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm">{labels.logoUrl}</span>
            <input required type="url" className="w-full rounded bg-gray-700 p-2" value={form.logoUrl ?? ''} onChange={(e) => setField('logoUrl', e.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm">{labels.name}</span>
            <input required className="w-full rounded bg-gray-700 p-2" value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm">{labels.nationality}</span>
            <input className="w-full rounded bg-gray-700 p-2" value={form.nacionalidade ?? ''} onChange={(e) => setField('nacionalidade', e.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm">{labels.type}</span>
            <select required className="w-full rounded bg-gray-700 p-2" value={form.tipo ?? ''} onChange={(e) => setField('tipo', e.target.value)}>
              <option value="">---</option>
              {SPONSOR_CONTRACT_CATEGORIES.map((category) => <option key={category} value={category}>{labels.contractTypes[category]}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm">{labels.sector}</span>
            <select className="w-full rounded bg-gray-700 p-2" value={form.setor ?? ''} onChange={(e) => setField('setor', e.target.value || null)}>
              <option value="">---</option>
              {SPONSOR_SECTORS.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
            </select>
          </label>
          {([
            ['felicidade', labels.happiness, 0, 100],
            ['prestigio', labels.prestige, 1, 5],
            ['agressividade', labels.aggressiveness, 0, 3],
            ['focoEmMidia', labels.mediaFocus, 0, 3],
            ['focoTecnico', labels.technicalFocus, 0, 3],
            ['nacionalismo', labels.nationalism, 0, 3],
            ['orcamento', labels.budget, 0, 3],
            ['ambicao', labels.ambition, 1, 5],
            ['fidelidade', labels.loyalty, 0, 3],
          ] as const).map(([key, label, min, max]) => (
            <label key={key}>
              <span className="mb-2 block text-sm">{label}</span>
              <input required type="number" min={min} max={max} className="w-full rounded bg-gray-700 p-2" value={form[key]} onChange={(e) => setField(key, Number(e.target.value))} />
            </label>
          ))}
          <label>
            <span className="mb-2 block text-sm">{labels.targetAudience1}</span>
            <select className="w-full rounded bg-gray-700 p-2" value={form.publicoAlvo1 ?? ''} onChange={(e) => setTargetAudience('publicoAlvo1', (e.target.value || null) as SponsorTargetAudience | null)}>
              <option value="">---</option>
              {SPONSOR_TARGET_AUDIENCES.map((audience) => <option key={audience} value={audience}>{labels.targetAudiences[audience]}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm">{labels.targetAudience2}</span>
            <select className="w-full rounded bg-gray-700 p-2" value={form.publicoAlvo2 ?? ''} onChange={(e) => setTargetAudience('publicoAlvo2', (e.target.value || null) as SponsorTargetAudience | null)}>
              <option value="">---</option>
              {SPONSOR_TARGET_AUDIENCES.map((audience) => <option key={audience} value={audience}>{labels.targetAudiences[audience]}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="rounded bg-gray-600 px-5 py-2" onClick={onClose}>{labels.cancel}</button>
          <button className="rounded bg-purple-600 px-5 py-2">{labels.save}</button>
        </div>
      </form>
    </div>
  );
}

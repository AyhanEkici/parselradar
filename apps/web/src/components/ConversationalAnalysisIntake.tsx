import React, { useMemo, useState } from 'react';

export type ConversationalReadinessLevel =
  | 'STARTED'
  | 'NEEDS_LOCATION'
  | 'NEEDS_PARCEL'
  | 'NEEDS_PRICE_CONTEXT'
  | 'READY_TO_CREATE_PROPERTY_DRAFT'
  | 'READY_TO_REVIEW_EVIDENCE'
  | 'READY_TO_VIEW_GUIDANCE_REPORT';

export interface ConversationalAnalysisContract {
  freeTextQuestion: string;
  il: string;
  ilce: string;
  belediye: string;
  mahalle: string;
  ada: string;
  parsel: string;
  areaM2: string;
  pricePerM2: string;
  totalPrice: string;
  listingUrl: string;
  notes: string;
  evidenceUploadIntent: boolean;
}

export interface ConversationalDerivedState {
  missingFields: string[];
  readinessLevel: ConversationalReadinessLevel;
  nextSuggestedAction: 'Yeni MÃ¼lk olarak kaydet' | 'KanÄ±t/screenshot yÃ¼kleme adÄ±mÄ±na geÃ§' | 'Guidance reportâ€™u gÃ¶rÃ¼ntÃ¼le';
  canCreatePropertyDraft: boolean;
  guidanceOnlyAcknowledged: boolean;
}

interface ConversationalAnalysisIntakeProps {
  onCreatePropertyDraft?: (payload: ConversationalAnalysisContract) => void;
}

const initialState: ConversationalAnalysisContract = {
  freeTextQuestion: '',
  il: '',
  ilce: '',
  belediye: '',
  mahalle: '',
  ada: '',
  parsel: '',
  areaM2: '',
  pricePerM2: '',
  totalPrice: '',
  listingUrl: '',
  notes: '',
  evidenceUploadIntent: false,
};

function toMissingLabels(contract: ConversationalAnalysisContract): string[] {
  const missing: string[] = [];

  if (!contract.il.trim()) missing.push('Ä°l');
  if (!contract.ilce.trim()) missing.push('Ä°lÃ§e');
  if (!contract.mahalle.trim()) missing.push('Mahalle');
  if (!contract.ada.trim()) missing.push('Ada');
  if (!contract.parsel.trim()) missing.push('Parsel');
  if (!contract.areaM2.trim()) missing.push('mÂ²');

  return missing;
}

function toDerivedState(
  contract: ConversationalAnalysisContract,
  guidanceOnlyAcknowledged: boolean
): ConversationalDerivedState {
  const missingFields = toMissingLabels(contract);
  const hasLocation = Boolean(contract.il.trim() && contract.ilce.trim() && contract.mahalle.trim());
  const hasParcel = Boolean(contract.ada.trim() && contract.parsel.trim());
  const hasPriceContext = Boolean(contract.pricePerM2.trim() || contract.totalPrice.trim());
  const hasAnyInput = Object.values(contract).some((value) => {
    if (typeof value === 'boolean') return value;
    return Boolean(String(value).trim());
  });

  let readinessLevel: ConversationalReadinessLevel = 'STARTED';

  if (!hasAnyInput) {
    readinessLevel = 'STARTED';
  } else if (!hasLocation) {
    readinessLevel = 'NEEDS_LOCATION';
  } else if (!hasParcel) {
    readinessLevel = 'NEEDS_PARCEL';
  } else if (!hasPriceContext) {
    readinessLevel = 'NEEDS_PRICE_CONTEXT';
  } else if (contract.evidenceUploadIntent) {
    readinessLevel = 'READY_TO_VIEW_GUIDANCE_REPORT';
  } else {
    readinessLevel = 'READY_TO_CREATE_PROPERTY_DRAFT';
  }

  const canCreatePropertyDraft = hasLocation && hasParcel && Boolean(contract.areaM2.trim()) && guidanceOnlyAcknowledged;

  let nextSuggestedAction: ConversationalDerivedState['nextSuggestedAction'] = 'Yeni MÃ¼lk olarak kaydet';
  if (readinessLevel === 'READY_TO_VIEW_GUIDANCE_REPORT') {
    nextSuggestedAction = 'Guidance reportâ€™u gÃ¶rÃ¼ntÃ¼le';
  } else if (contract.evidenceUploadIntent) {
    nextSuggestedAction = 'KanÄ±t/screenshot yÃ¼kleme adÄ±mÄ±na geÃ§';
  }

  return {
    missingFields,
    readinessLevel,
    nextSuggestedAction,
    canCreatePropertyDraft,
    guidanceOnlyAcknowledged,
  };
}

export default function ConversationalAnalysisIntake({
  onCreatePropertyDraft,
}: ConversationalAnalysisIntakeProps) {
  const [contract, setContract] = useState<ConversationalAnalysisContract>(initialState);
  const [guidanceOnlyAcknowledged, setGuidanceOnlyAcknowledged] = useState(false);

  const derived = useMemo(
    () => toDerivedState(contract, guidanceOnlyAcknowledged),
    [contract, guidanceOnlyAcknowledged]
  );

  const setField = (field: keyof ConversationalAnalysisContract, value: string | boolean) => {
    setContract((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Guided Analysis Intake</h3>
      <p className="mt-1 text-sm text-slate-600">
        Start with one central question, then complete key parcel fields to create a property draft.
      </p>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-slate-700">Search/chat-like composer</label>
        <textarea
          className="min-h-24 w-full rounded border border-slate-300 p-3 text-sm"
          P2_1A_TRIAGED_BACKLOG="Kayseri Kocasinanâ€™da ada/parsel ve mÂ² bilgileriyle arsa analizi baÅŸlat..."
          value={contract.freeTextQuestion}
          onChange={(event) => setField('freeTextQuestion', event.target.value)}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className="rounded border border-slate-300 p-2 text-sm" P2_1A_TRIAGED_BACKLOG="Ä°l" value={contract.il} onChange={(event) => setField('il', event.target.value)} />
        <input className="rounded border border-slate-300 p-2 text-sm" P2_1A_TRIAGED_BACKLOG="Ä°lÃ§e" value={contract.ilce} onChange={(event) => setField('ilce', event.target.value)} />
        <input className="rounded border border-slate-300 p-2 text-sm" P2_1A_TRIAGED_BACKLOG="Belediye" value={contract.belediye} onChange={(event) => setField('belediye', event.target.value)} />
        <input className="rounded border border-slate-300 p-2 text-sm" P2_1A_TRIAGED_BACKLOG="Mahalle" value={contract.mahalle} onChange={(event) => setField('mahalle', event.target.value)} />
        <input className="rounded border border-slate-300 p-2 text-sm" P2_1A_TRIAGED_BACKLOG="Ada" value={contract.ada} onChange={(event) => setField('ada', event.target.value)} />
        <input className="rounded border border-slate-300 p-2 text-sm" P2_1A_TRIAGED_BACKLOG="Parsel" value={contract.parsel} onChange={(event) => setField('parsel', event.target.value)} />
        <input className="rounded border border-slate-300 p-2 text-sm" P2_1A_TRIAGED_BACKLOG="mÂ²" value={contract.areaM2} onChange={(event) => setField('areaM2', event.target.value)} />
        <input className="rounded border border-slate-300 p-2 text-sm" P2_1A_TRIAGED_BACKLOG="Fiyat/mÂ²" value={contract.pricePerM2} onChange={(event) => setField('pricePerM2', event.target.value)} />
        <input className="rounded border border-slate-300 p-2 text-sm" P2_1A_TRIAGED_BACKLOG="Toplam fiyat" value={contract.totalPrice} onChange={(event) => setField('totalPrice', event.target.value)} />
        <input className="rounded border border-slate-300 p-2 text-sm sm:col-span-2" P2_1A_TRIAGED_BACKLOG="Ä°lan URL" value={contract.listingUrl} onChange={(event) => setField('listingUrl', event.target.value)} />
      </div>

      <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <p>Ada/parsel olmadan rapor daha sÄ±nÄ±rlÄ± olur.</p>
        <p className="mt-1">Fiyat/mÂ² eklemek fÄ±rsat/risk yorumunu daha anlamlÄ± hale getirir.</p>
        {derived.missingFields.length > 0 ? (
          <p className="mt-2 text-amber-700">Eksik alanlar: {derived.missingFields.join(', ')}</p>
        ) : (
          <p className="mt-2 text-emerald-700">Temel alanlar tamamlandÄ±.</p>
        )}
      </div>

      <div className="mt-3">
        <textarea
          className="min-h-20 w-full rounded border border-slate-300 p-2 text-sm"
          P2_1A_TRIAGED_BACKLOG="Notlar"
          value={contract.notes}
          onChange={(event) => setField('notes', event.target.value)}
        />
      </div>

      <div className="mt-3 space-y-2 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={contract.evidenceUploadIntent}
            onChange={(event) => setField('evidenceUploadIntent', event.target.checked)}
            className="mt-1"
          />
          <span>KanÄ±t/screenshot yÃ¼kleme adÄ±mÄ±na geÃ§mek istiyorum.</span>
        </label>
        <p>Upload/OCR preview planned - not active yet.</p>
      </div>

      <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        Guidance only â€” resmi doÄŸrulama, deÄŸerleme veya al/sat tavsiyesi deÄŸildir.
      </div>

      <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={guidanceOnlyAcknowledged}
          onChange={(event) => setGuidanceOnlyAcknowledged(event.target.checked)}
          className="mt-1"
        />
        <span>Guidance-only sÄ±nÄ±rlarÄ±nÄ± anladÄ±m.</span>
      </label>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          className="rounded bg-blue-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-blue-300"
          disabled={!derived.canCreatePropertyDraft}
          onClick={() => onCreatePropertyDraft?.(contract)}
        >
          Yeni MÃ¼lk olarak kaydet
        </button>
        <div className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700">KanÄ±t/screenshot yÃ¼kleme adÄ±mÄ±na geÃ§</div>
        <div className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-700">Guidance reportâ€™u gÃ¶rÃ¼ntÃ¼le</div>
      </div>

      <div className="mt-3 rounded border border-slate-200 p-3 text-sm text-slate-700">
        <div>Readiness: <strong>{derived.readinessLevel}</strong></div>
        <div className="mt-1">Next suggested action: <strong>{derived.nextSuggestedAction}</strong></div>
      </div>
    </section>
  );
}


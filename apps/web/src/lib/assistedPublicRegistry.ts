export type AssistedRegistrySourceType = 'TKGM' | 'KAYSERI_EIMAR' | 'KOCASINAN_EIMAR' | 'MELIKGAZI_EIMAR';

export type AssistedExtractionMode = 'USER_UPLOAD_OCR' | 'MANUAL_ENTRY';

export type AssistedComparisonStatus =
  | 'MATCH'
  | 'MISMATCH'
  | 'MISSING_IN_LISTING'
  | 'MISSING_IN_EVIDENCE'
  | 'NEEDS_MANUAL_REVIEW';

export type AssistedRiskSignal =
  | 'ADA_PARSEL_MISSING'
  | 'AREA_MISMATCH'
  | 'LOCATION_MISMATCH'
  | 'IMAR_CLAIM_UNSUPPORTED'
  | 'PUBLIC_REGISTRY_EVIDENCE_MISSING'
  | 'OFFICIAL_CONFIRMATION_REQUIRED';

export type AssistedDataLabel =
  | 'SOURCE_GUIDANCE_ONLY'
  | 'PUBLIC_REGISTRY_INFORMATIONAL_REFERENCE'
  | 'USER_PROVIDED_PUBLIC_REGISTRY_EVIDENCE'
  | 'OCR_EXTRACTED_FROM_USER_UPLOAD'
  | 'FIELD_MATCH'
  | 'FIELD_MISMATCH'
  | 'MISSING_PUBLIC_REGISTRY_EVIDENCE'
  | 'NEEDS_OFFICIAL_CONFIRMATION'
  | 'NOT_OFFICIAL_FOR_LEGAL_ACTIONS';

export const REQUIRED_ASSISTED_DATA_LABELS: AssistedDataLabel[] = [
  'SOURCE_GUIDANCE_ONLY',
  'PUBLIC_REGISTRY_INFORMATIONAL_REFERENCE',
  'USER_PROVIDED_PUBLIC_REGISTRY_EVIDENCE',
  'OCR_EXTRACTED_FROM_USER_UPLOAD',
  'FIELD_MATCH',
  'FIELD_MISMATCH',
  'MISSING_PUBLIC_REGISTRY_EVIDENCE',
  'NEEDS_OFFICIAL_CONFIRMATION',
  'NOT_OFFICIAL_FOR_LEGAL_ACTIONS',
];

export interface AssistedExtractionFields {
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsel: string;
  yuzolcumu: string;
  nitelik: string;
  imarDurumu: string;
  taks: string;
  kaks: string;
  katAdedi: string;
}

export interface AssistedRegistryExtractionRecord {
  sourceType: AssistedRegistrySourceType;
  extractionMode: AssistedExtractionMode;
  fields: AssistedExtractionFields;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  officialVerification: false;
  checkedManually?: boolean;
  updatedAt: string;
}

export interface ListingComparisonInput {
  il?: string;
  ilce?: string;
  mahalle?: string;
  ada?: string;
  parsel?: string;
  areaM2?: number | string;
  zoningStatus?: string;
  nitelik?: string;
}

export interface AssistedFieldComparison {
  field: keyof AssistedExtractionFields;
  label: string;
  listingValue: string;
  evidenceValue: string;
  status: AssistedComparisonStatus;
}

export interface AssistedComparisonSummary {
  fieldComparisons: AssistedFieldComparison[];
  riskSignals: AssistedRiskSignal[];
  dataLabels: AssistedDataLabel[];
}

const FIELD_LABELS: Record<keyof AssistedExtractionFields, string> = {
  il: 'Il',
  ilce: 'Ilce',
  mahalle: 'Mahalle',
  ada: 'Ada',
  parsel: 'Parsel',
  yuzolcumu: 'Yuzolcumu',
  nitelik: 'Nitelik',
  imarDurumu: 'Imar durumu',
  taks: 'TAKS',
  kaks: 'KAKS',
  katAdedi: 'Kat adedi',
};

function normalizeText(value: unknown) {
  return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

function asText(value: unknown) {
  return String(value || '').trim();
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value || '').replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function compareText(listingValue: string, evidenceValue: string): AssistedComparisonStatus {
  if (!listingValue && !evidenceValue) return 'NEEDS_MANUAL_REVIEW';
  if (!listingValue) return 'MISSING_IN_LISTING';
  if (!evidenceValue) return 'MISSING_IN_EVIDENCE';
  return normalizeText(listingValue) === normalizeText(evidenceValue) ? 'MATCH' : 'MISMATCH';
}

function compareArea(listingValue: unknown, evidenceValue: unknown): AssistedComparisonStatus {
  const listing = toNumber(listingValue);
  const evidence = toNumber(evidenceValue);
  if (listing === null && evidence === null) return 'NEEDS_MANUAL_REVIEW';
  if (listing === null) return 'MISSING_IN_LISTING';
  if (evidence === null) return 'MISSING_IN_EVIDENCE';

  const tolerance = Math.max(1, listing * 0.05);
  return Math.abs(listing - evidence) <= tolerance ? 'MATCH' : 'MISMATCH';
}

export function buildAssistedComparisonSummary(
  listing: ListingComparisonInput,
  extraction: AssistedRegistryExtractionRecord | null
): AssistedComparisonSummary {
  if (!extraction) {
    return {
      fieldComparisons: [],
      riskSignals: ['PUBLIC_REGISTRY_EVIDENCE_MISSING', 'OFFICIAL_CONFIRMATION_REQUIRED'],
      dataLabels: [
        'SOURCE_GUIDANCE_ONLY',
        'PUBLIC_REGISTRY_INFORMATIONAL_REFERENCE',
        'MISSING_PUBLIC_REGISTRY_EVIDENCE',
        'NEEDS_OFFICIAL_CONFIRMATION',
        'NOT_OFFICIAL_FOR_LEGAL_ACTIONS',
      ],
    };
  }

  const comparisons: AssistedFieldComparison[] = [
    {
      field: 'ada',
      label: FIELD_LABELS.ada,
      listingValue: asText(listing.ada),
      evidenceValue: asText(extraction.fields.ada),
      status: compareText(asText(listing.ada), asText(extraction.fields.ada)),
    },
    {
      field: 'parsel',
      label: FIELD_LABELS.parsel,
      listingValue: asText(listing.parsel),
      evidenceValue: asText(extraction.fields.parsel),
      status: compareText(asText(listing.parsel), asText(extraction.fields.parsel)),
    },
    {
      field: 'yuzolcumu',
      label: FIELD_LABELS.yuzolcumu,
      listingValue: asText(listing.areaM2),
      evidenceValue: asText(extraction.fields.yuzolcumu),
      status: compareArea(listing.areaM2, extraction.fields.yuzolcumu),
    },
    {
      field: 'ilce',
      label: FIELD_LABELS.ilce,
      listingValue: asText(listing.ilce),
      evidenceValue: asText(extraction.fields.ilce),
      status: compareText(asText(listing.ilce), asText(extraction.fields.ilce)),
    },
    {
      field: 'mahalle',
      label: FIELD_LABELS.mahalle,
      listingValue: asText(listing.mahalle),
      evidenceValue: asText(extraction.fields.mahalle),
      status: compareText(asText(listing.mahalle), asText(extraction.fields.mahalle)),
    },
    {
      field: 'imarDurumu',
      label: FIELD_LABELS.imarDurumu,
      listingValue: asText(listing.zoningStatus || listing.nitelik),
      evidenceValue: asText(extraction.fields.imarDurumu),
      status: compareText(asText(listing.zoningStatus || listing.nitelik), asText(extraction.fields.imarDurumu)),
    },
  ];

  const riskSignals: AssistedRiskSignal[] = ['OFFICIAL_CONFIRMATION_REQUIRED'];

  const adaParselComparison = comparisons.filter((entry) => entry.field === 'ada' || entry.field === 'parsel');
  if (adaParselComparison.some((entry) => entry.status !== 'MATCH')) {
    riskSignals.push('ADA_PARSEL_MISSING');
  }

  const areaComparison = comparisons.find((entry) => entry.field === 'yuzolcumu');
  if (areaComparison && areaComparison.status === 'MISMATCH') {
    riskSignals.push('AREA_MISMATCH');
  }

  const locationComparisons = comparisons.filter((entry) => entry.field === 'ilce' || entry.field === 'mahalle');
  if (locationComparisons.some((entry) => entry.status === 'MISMATCH')) {
    riskSignals.push('LOCATION_MISMATCH');
  }

  const imarComparison = comparisons.find((entry) => entry.field === 'imarDurumu');
  if (imarComparison && (imarComparison.status === 'MISSING_IN_EVIDENCE' || imarComparison.status === 'MISMATCH')) {
    riskSignals.push('IMAR_CLAIM_UNSUPPORTED');
  }

  const hasMismatch = comparisons.some((entry) => entry.status === 'MISMATCH');
  const hasMatch = comparisons.some((entry) => entry.status === 'MATCH');

  const dataLabels: AssistedDataLabel[] = [
    'SOURCE_GUIDANCE_ONLY',
    'PUBLIC_REGISTRY_INFORMATIONAL_REFERENCE',
    'USER_PROVIDED_PUBLIC_REGISTRY_EVIDENCE',
    extraction.extractionMode === 'USER_UPLOAD_OCR' ? 'OCR_EXTRACTED_FROM_USER_UPLOAD' : 'USER_PROVIDED_PUBLIC_REGISTRY_EVIDENCE',
    hasMatch ? 'FIELD_MATCH' : 'MISSING_PUBLIC_REGISTRY_EVIDENCE',
    hasMismatch ? 'FIELD_MISMATCH' : 'FIELD_MATCH',
    'NEEDS_OFFICIAL_CONFIRMATION',
    'NOT_OFFICIAL_FOR_LEGAL_ACTIONS',
  ];

  return {
    fieldComparisons: comparisons,
    riskSignals: Array.from(new Set(riskSignals)),
    dataLabels: Array.from(new Set(dataLabels)),
  };
}

export function getAssistedExtractionStorageKey(propertyId: string) {
  return `parselradar:assisted-registry-extractions:${propertyId}`;
}

export function getAssistedManualCheckStorageKey(propertyId: string) {
  return `parselradar:assisted-registry-manual-check:${propertyId}`;
}

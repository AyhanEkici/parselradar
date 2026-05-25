export type ListingInputType = 'URL' | 'SCREENSHOT' | 'PASTED_TEXT';

export type ListingSourceLabel =
  | 'USER_PROVIDED_LISTING_DATA'
  | 'USER_PROVIDED_SCREENSHOT'
  | 'USER_PASTED_LISTING_TEXT'
  | 'OCR_EXTRACTED_FROM_USER_UPLOAD'
  | 'MANUALLY_CONFIRMED_BY_USER'
  | 'MISSING_REQUIRED_FIELD'
  | 'BASIC_RISK_SIGNAL'
  | 'NEEDS_OFFICIAL_CONFIRMATION'
  | 'NOT_OFFICIAL_FOR_LEGAL_ACTIONS';

export type ExtractionMode = 'MANUAL_ENTRY' | 'PASTED_TEXT_PARSE' | 'OCR_READY';

export type LocationConfidence = 'LOW' | 'MEDIUM' | 'HIGH' | '';

export type BasicRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export type RiskSignalKey =
  | 'ADA_PARSEL_MISSING'
  | 'IMAR_CLAIM_UNSUPPORTED'
  | 'LOCATION_CONFIDENCE_LOW'
  | 'ROAD_ACCESS_UNSUPPORTED'
  | 'HISSELI_OR_TAPU_UNCLEAR'
  | 'PUBLIC_REGISTRY_EVIDENCE_MISSING'
  | 'SELLER_QUESTIONS_REQUIRED';

export type GeodataContextStatus =
  | 'BLOCKED_LOW_LOCATION_CONFIDENCE'
  | 'SIGNALS_AVAILABLE'
  | 'GEODATA_NOT_CONFIGURED'
  | 'GEODATA_ERROR';

export type GeodataContextSignalType =
  | 'NEAREST_DISTRICT_CENTER'
  | 'NEAREST_MAIN_ROAD'
  | 'NEAREST_SETTLEMENT'
  | 'INDUSTRIAL_OSB_CONTEXT'
  | 'WATER_CONTEXT';

export interface GeodataContextSignal {
  type: GeodataContextSignalType;
  label: 'PUBLIC_SOURCE_SIGNAL';
  distanceKm: number;
  name: string;
  confidence: BasicRiskLevel;
  officialVerification: false;
  disclaimer: string;
}

export interface GeodataContextResult {
  status: GeodataContextStatus;
  signals: GeodataContextSignal[];
  message: string;
}

export interface ListingIntakeFields {
  listingUrl: string;
  sourceDomain: string;
  title: string;
  price: number | null;
  areaM2: number | null;
  il: string;
  ilce: string;
  mahalle: string;
  category: string;
  ada: string;
  parsel: string;
  claims: string[];
  pastedText: string;
  locationConfidence: LocationConfidence;
}

export interface ListingIntakeExtraction {
  inputType: ListingInputType;
  sourceLabel: 'USER_PROVIDED_LISTING_DATA';
  extractionMode: ExtractionMode;
  fields: ListingIntakeFields;
  missingRequiredFields: string[];
  readyForBasicRiskScan: boolean;
}

export interface RiskSignal {
  key: RiskSignalKey;
  level: BasicRiskLevel;
  triggered: boolean;
  reason: string;
  labels: ListingSourceLabel[];
  confidence: LocationConfidence;
}

export interface DecisionSnapshot {
  overallReadiness: 'LOW' | 'MEDIUM' | 'HIGH';
  mainOpportunity: string;
  mainRisk: string;
  missingCriticalEvidence: string[];
  nextBestAction: string;
  confidenceLevel: BasicRiskLevel;
  officialVerificationNeeded: 'yes' | 'no';
}

export interface BasicRiskScanResult {
  pricePerM2: number | null;
  missingRequiredFields: string[];
  missingEvidenceSignals: RiskSignal[];
  riskKeywordSignals: string[];
  locationConfidence: LocationConfidence;
  sellerQuestions: string[];
  nextBestAction: string;
  decisionSnapshot: DecisionSnapshot;
  geodataContext: GeodataContextResult;
  labels: ListingSourceLabel[];
  disclaimer: string;
}

export interface BasicRiskScanInput {
  fields: ListingIntakeFields;
  hasScreenshotOrDocument: boolean;
  hasImarEvidence: boolean;
  hasRoadEvidence: boolean;
  hasPublicRegistryEvidence: boolean;
  ownershipType: string;
}

const REQUIRED_FIELD_KEYS: Array<keyof ListingIntakeFields | 'sourceOrEvidence'> = [
  'sourceOrEvidence',
  'price',
  'areaM2',
  'il',
  'ilce',
  'category',
  'locationConfidence',
];

const DISCLAIMER =
  'ParselRadar uses user-provided listing data and evidence for preliminary risk signals. This is not official TKGM, tapu, imar, municipality, legal or investment verification.';

const GEODATA_CONTEXT_DISCLAIMER =
  'Public context signal only. Official verification required.';

const CLAIM_KEYWORDS = [
  'imar',
  'imarli',
  'imarlı',
  'imara yakın',
  'villa',
  'yola cephe',
  'kadastro yolu',
  'tapu',
  'hisseli',
  'müstakil',
  'yol',
];

const CITY_DISTRICT_HINTS: Array<{ il: string; ilce: string }> = [
  { il: 'Kayseri', ilce: 'Kocasinan' },
  { il: 'Kayseri', ilce: 'Melikgazi' },
  { il: 'Kayseri', ilce: 'Talas' },
  { il: 'Kayseri', ilce: 'Incesu' },
  { il: 'Kayseri', ilce: 'Hacilar' },
];

const KAYSERI_POC_CONTEXT_SIGNALS: Array<Omit<GeodataContextSignal, 'confidence'>> = [
  {
    type: 'NEAREST_DISTRICT_CENTER',
    label: 'PUBLIC_SOURCE_SIGNAL',
    distanceKm: 1.763,
    name: 'Kayseri Merkez (POC)',
    officialVerification: false,
    disclaimer: GEODATA_CONTEXT_DISCLAIMER,
  },
  {
    type: 'NEAREST_MAIN_ROAD',
    label: 'PUBLIC_SOURCE_SIGNAL',
    distanceKm: 0.285,
    name: 'D300 POC Segment (trunk)',
    officialVerification: false,
    disclaimer: GEODATA_CONTEXT_DISCLAIMER,
  },
  {
    type: 'NEAREST_SETTLEMENT',
    label: 'PUBLIC_SOURCE_SIGNAL',
    distanceKm: 1.879,
    name: 'Kayseri Merkez Yerlesim (POC)',
    officialVerification: false,
    disclaimer: GEODATA_CONTEXT_DISCLAIMER,
  },
  {
    type: 'INDUSTRIAL_OSB_CONTEXT',
    label: 'PUBLIC_SOURCE_SIGNAL',
    distanceKm: 14.091,
    name: 'Kayseri OSB Candidate Polygon (POC)',
    officialVerification: false,
    disclaimer: GEODATA_CONTEXT_DISCLAIMER,
  },
  {
    type: 'WATER_CONTEXT',
    label: 'PUBLIC_SOURCE_SIGNAL',
    distanceKm: 18.872,
    name: 'Yamula Baraji Candidate (POC)',
    officialVerification: false,
    disclaimer: GEODATA_CONTEXT_DISCLAIMER,
  },
];

export function emptyListingIntakeFields(): ListingIntakeFields {
  return {
    listingUrl: '',
    sourceDomain: '',
    title: '',
    price: null,
    areaM2: null,
    il: '',
    ilce: '',
    mahalle: '',
    category: '',
    ada: '',
    parsel: '',
    claims: [],
    pastedText: '',
    locationConfidence: '',
  };
}

function normalize(text: string) {
  return String(text || '').toLocaleLowerCase('tr-TR').trim();
}

function parseNumber(text: string): number | null {
  const cleaned = String(text || '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.]/g, '')
    .trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function parseListingUrl(url: string) {
  const trimmed = String(url || '').trim();
  if (!trimmed) {
    return { listingUrl: '', sourceDomain: '' };
  }

  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return {
      listingUrl: parsed.toString(),
      sourceDomain: parsed.hostname.replace(/^www\./, ''),
    };
  } catch {
    return {
      listingUrl: trimmed,
      sourceDomain: '',
    };
  }
}

export function parsePastedListingText(text: string): Partial<ListingIntakeFields> {
  const raw = String(text || '');
  const normalized = normalize(raw);
  if (!normalized) {
    return {
      pastedText: '',
      claims: [],
    };
  }

  const priceMatch = raw.match(/([\d\.\,\s]{3,})\s*(TL|TRY|₺)/i);
  const areaMatch = raw.match(/([\d\.\,\s]{2,})\s*(m2|m²|metrekare)/i);
  const adaParselMatch = normalized.match(/ada\s*[:\-]?\s*(\d+)\s*[\/\-\s]+\s*parsel\s*[:\-]?\s*(\d+)/i);
  const adaMatch = normalized.match(/ada\s*[:\-]?\s*(\d+)/i);
  const parselMatch = normalized.match(/parsel\s*[:\-]?\s*(\d+)/i);

  const category = normalized.includes('tarla')
    ? 'tarla'
    : normalized.includes('bahce') || normalized.includes('bahçe')
    ? 'bahçe'
    : normalized.includes('arsa')
    ? 'arsa'
    : normalized.includes('daire')
    ? 'daire'
    : '';

  let il = '';
  let ilce = '';
  for (const hint of CITY_DISTRICT_HINTS) {
    if (normalized.includes(normalize(hint.ilce))) {
      il = hint.il;
      ilce = hint.ilce;
      break;
    }
  }

  const claims = CLAIM_KEYWORDS.filter((keyword) => normalized.includes(normalize(keyword)));

  return {
    pastedText: raw,
    price: priceMatch ? parseNumber(priceMatch[1]) : null,
    areaM2: areaMatch ? parseNumber(areaMatch[1]) : null,
    ada: adaParselMatch ? adaParselMatch[1] : adaMatch ? adaMatch[1] : '',
    parsel: adaParselMatch ? adaParselMatch[2] : parselMatch ? parselMatch[1] : '',
    il,
    ilce,
    category,
    claims,
  };
}

export function getMissingRequiredFields(fields: ListingIntakeFields, hasScreenshotOrDocument: boolean): string[] {
  const missing: string[] = [];
  const hasSource = Boolean(fields.listingUrl || fields.pastedText || hasScreenshotOrDocument);

  for (const key of REQUIRED_FIELD_KEYS) {
    if (key === 'sourceOrEvidence') {
      if (!hasSource) {
        missing.push('listing source or screenshot/text');
      }
      continue;
    }

    const value = fields[key];
    if (key === 'price' || key === 'areaM2') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        missing.push(key);
      }
      continue;
    }

    if (!String(value || '').trim()) {
      missing.push(key);
    }
  }

  return missing;
}

export function buildListingIntakeExtraction(
  fields: ListingIntakeFields,
  inputType: ListingInputType,
  extractionMode: ExtractionMode,
  hasScreenshotOrDocument: boolean
): ListingIntakeExtraction {
  const missingRequiredFields = getMissingRequiredFields(fields, hasScreenshotOrDocument);

  return {
    inputType,
    sourceLabel: 'USER_PROVIDED_LISTING_DATA',
    extractionMode,
    fields,
    missingRequiredFields,
    readyForBasicRiskScan: missingRequiredFields.length === 0,
  };
}

function levelFromTriggered(triggered: boolean, high = false): BasicRiskLevel {
  if (!triggered) return 'LOW';
  return high ? 'HIGH' : 'MEDIUM';
}

function confidenceAsRiskLevel(locationConfidence: LocationConfidence): BasicRiskLevel {
  if (!locationConfidence) return 'UNKNOWN';
  if (locationConfidence === 'HIGH') return 'HIGH';
  if (locationConfidence === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}

function buildSellerQuestions(input: BasicRiskScanInput, missingRequiredFields: string[], missingSignals: RiskSignal[]) {
  const questions = new Set<string>();

  if (missingRequiredFields.some((entry) => entry.includes('listing source'))) {
    questions.add('İlan URL veya ilan metnini paylaşır mısınız?');
  }
  if (!input.fields.ada || !input.fields.parsel) {
    questions.add('Ada/parsel numarasını paylaşır mısınız?');
  }
  if (!input.ownershipType) {
    questions.add('Tapu hisseli mi, müstakil mi?');
  }
  if (!input.hasImarEvidence) {
    questions.add('Güncel imar durumu belgesi var mı?');
    questions.add('Belediyeden alınmış e-imar/imar durum ekran görüntüsü var mı?');
  }
  if (!input.hasRoadEvidence) {
    questions.add('Kadastro yolu veya resmi yol erişimi var mı?');
  }
  if (!input.fields.mahalle && !input.fields.ada && !input.fields.parsel) {
    questions.add('Konum pin’i tam parsel sınırını mı gösteriyor?');
  }
  if (missingSignals.some((signal) => signal.key === 'PUBLIC_REGISTRY_EVIDENCE_MISSING' && signal.triggered)) {
    questions.add('Yüzölçümü tapu/TKGM ile uyumlu mu?');
  }
  questions.add('Satışa engel şerh/ipotek/haciz var mı?');

  return Array.from(questions);
}

function firstTriggered(signals: RiskSignal[]) {
  return signals.find((signal) => signal.triggered);
}

function hasLocationAnchor(fields: ListingIntakeFields) {
  return Boolean(String(fields.mahalle || '').trim() || String(fields.ada || '').trim() || String(fields.parsel || '').trim());
}

function buildGeodataContextResult(fields: ListingIntakeFields): GeodataContextResult {
  const confidence = fields.locationConfidence;
  if (!confidence || confidence === 'LOW') {
    return {
      status: 'BLOCKED_LOW_LOCATION_CONFIDENCE',
      signals: [],
      message: 'Add pin/coordinates/ada-parsel to unlock location context signals.',
    };
  }

  if (!hasLocationAnchor(fields)) {
    return {
      status: 'GEODATA_ERROR',
      signals: [],
      message: 'Location context signals require mahalle/pin/ada-parsel anchor.',
    };
  }

  if (normalize(fields.il) !== normalize('Kayseri')) {
    return {
      status: 'GEODATA_NOT_CONFIGURED',
      signals: [],
      message: 'Geodata context POC is currently configured for Kayseri-only context signals.',
    };
  }

  const signalConfidence: BasicRiskLevel = confidence === 'HIGH' ? 'HIGH' : 'MEDIUM';
  return {
    status: 'SIGNALS_AVAILABLE',
    signals: KAYSERI_POC_CONTEXT_SIGNALS.map((signal) => ({
      ...signal,
      confidence: signalConfidence,
    })),
    message:
      'These are public geodata context signals, not official road, imar, tapu, zoning or investment verification.',
  };
}

export function runBasicRiskScan(input: BasicRiskScanInput): BasicRiskScanResult {
  const fields = input.fields;
  const missingRequiredFields = getMissingRequiredFields(fields, input.hasScreenshotOrDocument);
  const normalizedClaims = fields.claims.map((entry) => normalize(entry));
  const claimsText = normalize([fields.pastedText, ...fields.claims].join(' '));

  const pricePerM2 =
    typeof fields.price === 'number' && Number.isFinite(fields.price) &&
    typeof fields.areaM2 === 'number' && Number.isFinite(fields.areaM2) &&
    fields.areaM2 > 0
      ? Number((fields.price / fields.areaM2).toFixed(2))
      : null;

  const isLandCategory = ['arsa', 'tarla', 'bahçe', 'bahce'].includes(normalize(fields.category));
  const claimsImar = claimsText.includes('imar') || claimsText.includes('villa');
  const claimsRoad = claimsText.includes('yol') || claimsText.includes('cephe');
  const ownershipClear = Boolean(input.ownershipType || claimsText.includes('müstakil') || claimsText.includes('hisseli') || claimsText.includes('tapu'));

  const signals: RiskSignal[] = [
    {
      key: 'ADA_PARSEL_MISSING',
      triggered: isLandCategory && (!fields.ada || !fields.parsel),
      level: levelFromTriggered(isLandCategory && (!fields.ada || !fields.parsel), true),
      reason: isLandCategory && (!fields.ada || !fields.parsel)
        ? 'Land category listing without ada/parsel.'
        : 'Ada/parsel context available or not required by category.',
      labels: ['BASIC_RISK_SIGNAL', 'MISSING_REQUIRED_FIELD', 'NEEDS_OFFICIAL_CONFIRMATION'],
      confidence: fields.locationConfidence,
    },
    {
      key: 'IMAR_CLAIM_UNSUPPORTED',
      triggered: claimsImar && !input.hasImarEvidence,
      level: levelFromTriggered(claimsImar && !input.hasImarEvidence, true),
      reason: claimsImar && !input.hasImarEvidence
        ? 'Imar/buildability claim exists but no supporting evidence is uploaded.'
        : 'No imar claim or supporting evidence exists.',
      labels: ['BASIC_RISK_SIGNAL', 'NEEDS_OFFICIAL_CONFIRMATION'],
      confidence: fields.locationConfidence,
    },
    {
      key: 'LOCATION_CONFIDENCE_LOW',
      triggered:
        fields.locationConfidence === 'LOW' ||
        (!fields.mahalle && !fields.ada && !fields.parsel),
      level: levelFromTriggered(
        fields.locationConfidence === 'LOW' || (!fields.mahalle && !fields.ada && !fields.parsel)
      ),
      reason:
        fields.locationConfidence === 'LOW' || (!fields.mahalle && !fields.ada && !fields.parsel)
          ? 'Location confidence is low because mahalle/pin/ada-parsel context is limited.'
          : 'Location confidence has enough context.',
      labels: ['BASIC_RISK_SIGNAL', 'MISSING_REQUIRED_FIELD', 'NEEDS_OFFICIAL_CONFIRMATION'],
      confidence: fields.locationConfidence,
    },
    {
      key: 'ROAD_ACCESS_UNSUPPORTED',
      triggered: claimsRoad && !input.hasRoadEvidence,
      level: levelFromTriggered(claimsRoad && !input.hasRoadEvidence),
      reason: claimsRoad && !input.hasRoadEvidence
        ? 'Road access is claimed but no supporting evidence is uploaded.'
        : 'Road access claim is absent or supported by evidence.',
      labels: ['BASIC_RISK_SIGNAL', 'NEEDS_OFFICIAL_CONFIRMATION'],
      confidence: fields.locationConfidence,
    },
    {
      key: 'HISSELI_OR_TAPU_UNCLEAR',
      triggered: !ownershipClear,
      level: levelFromTriggered(!ownershipClear),
      reason: !ownershipClear
        ? 'Ownership/tapu type is missing or unclear.'
        : 'Ownership/tapu context exists in user-provided data.',
      labels: ['BASIC_RISK_SIGNAL', 'MISSING_REQUIRED_FIELD', 'NEEDS_OFFICIAL_CONFIRMATION'],
      confidence: fields.locationConfidence,
    },
    {
      key: 'PUBLIC_REGISTRY_EVIDENCE_MISSING',
      triggered: !input.hasPublicRegistryEvidence,
      level: levelFromTriggered(!input.hasPublicRegistryEvidence, true),
      reason: !input.hasPublicRegistryEvidence
        ? 'No TKGM/e-imar/public registry evidence uploaded yet.'
        : 'Public registry evidence exists as user-provided informational reference.',
      labels: ['BASIC_RISK_SIGNAL', 'MISSING_REQUIRED_FIELD', 'NEEDS_OFFICIAL_CONFIRMATION'],
      confidence: fields.locationConfidence,
    },
    {
      key: 'SELLER_QUESTIONS_REQUIRED',
      triggered: true,
      level: 'MEDIUM',
      reason: 'Seller clarification is required for missing/uncertain fields.',
      labels: ['BASIC_RISK_SIGNAL', 'NEEDS_OFFICIAL_CONFIRMATION'],
      confidence: fields.locationConfidence,
    },
  ];

  const riskKeywordSignals = normalizedClaims.length > 0
    ? Array.from(new Set(normalizedClaims))
    : CLAIM_KEYWORDS.filter((keyword) => claimsText.includes(normalize(keyword)));

  const sellerQuestions = buildSellerQuestions(input, missingRequiredFields, signals);
  const triggeredSignals = signals.filter((signal) => signal.triggered && signal.key !== 'SELLER_QUESTIONS_REQUIRED');

  const mainRiskSignal = firstTriggered(triggeredSignals);
  const nextBestAction = mainRiskSignal
    ? mainRiskSignal.key === 'ADA_PARSEL_MISSING'
      ? 'Ask seller for ada/parsel and upload current TKGM/e-imar screenshot.'
      : mainRiskSignal.key === 'IMAR_CLAIM_UNSUPPORTED'
      ? 'Request current municipality e-imar/imar durum evidence from seller.'
      : mainRiskSignal.key === 'PUBLIC_REGISTRY_EVIDENCE_MISSING'
      ? 'Upload user-provided TKGM/e-imar evidence and compare with listing claims.'
      : 'Fill missing evidence and continue manual verification workflow.'
    : 'Continue with manual evidence collection and compare listing with uploaded records.';

  const highCount = triggeredSignals.filter((signal) => signal.level === 'HIGH').length;
  const mediumCount = triggeredSignals.filter((signal) => signal.level === 'MEDIUM').length;

  const overallReadiness: 'LOW' | 'MEDIUM' | 'HIGH' =
    highCount > 0 || missingRequiredFields.length > 0
      ? 'LOW'
      : mediumCount > 2
      ? 'MEDIUM'
      : 'HIGH';

  const decisionSnapshot: DecisionSnapshot = {
    overallReadiness,
    mainOpportunity: pricePerM2
      ? `Listing has a computable price/m² (${pricePerM2.toLocaleString('tr-TR')}).`
      : 'Listing can be reviewed at preliminary level after core fields are completed.',
    mainRisk: mainRiskSignal ? mainRiskSignal.reason : 'No major high-risk trigger from user-provided data.',
    missingCriticalEvidence: triggeredSignals.map((signal) => signal.key),
    nextBestAction,
    confidenceLevel: confidenceAsRiskLevel(fields.locationConfidence),
    officialVerificationNeeded: 'yes',
  };

  const geodataContext = buildGeodataContextResult(fields);

  return {
    pricePerM2,
    missingRequiredFields,
    missingEvidenceSignals: signals,
    riskKeywordSignals,
    locationConfidence: fields.locationConfidence,
    sellerQuestions,
    nextBestAction,
    decisionSnapshot,
    geodataContext,
    labels: [
      'USER_PROVIDED_LISTING_DATA',
      input.hasScreenshotOrDocument ? 'USER_PROVIDED_SCREENSHOT' : 'MISSING_REQUIRED_FIELD',
      fields.pastedText ? 'USER_PASTED_LISTING_TEXT' : 'MISSING_REQUIRED_FIELD',
      'MANUALLY_CONFIRMED_BY_USER',
      'BASIC_RISK_SIGNAL',
      'NEEDS_OFFICIAL_CONFIRMATION',
      'NOT_OFFICIAL_FOR_LEGAL_ACTIONS',
    ],
    disclaimer: DISCLAIMER,
  };
}

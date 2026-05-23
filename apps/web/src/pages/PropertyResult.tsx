import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useToast } from '../components/ui';
import GovernanceBadge from '../components/governance/GovernanceBadge';
import ConfidenceMeter from '../components/confidence/ConfidenceMeter';
import EvidenceStrengthCard from '../components/confidence/EvidenceStrengthCard';
import DisclosurePanel from '../components/disclosure/DisclosurePanel';
import PlanningSignalCard from '../components/planning/PlanningSignalCard';
import ImarProbabilityCard from '../components/planning/ImarProbabilityCard';
import InfrastructurePressureCard from '../components/infrastructure/InfrastructurePressureCard';
import MacroGrowthCard from '../components/intelligence/MacroGrowthCard';
import LiquidityScoreCard from '../components/intelligence/LiquidityScoreCard';
import DevelopmentForecastCard from '../components/forecasting/DevelopmentForecastCard';
import ConnectorGovernanceCard from '../components/connectors/ConnectorGovernanceCard';
import ConnectorHealthCard from '../components/connectors/ConnectorHealthCard';
import ConnectorCapabilityCard from '../components/connectors/ConnectorCapabilityCard';
import RateLimitStatusCard from '../components/connectors/RateLimitStatusCard';
import IngestionFreshnessCard from '../components/ingestion/IngestionFreshnessCard';
import IngestionAuditCard from '../components/ingestion/IngestionAuditCard';
import SourceLineageCard from '../components/provenance/SourceLineageCard';
import SourceTrustCard from '../components/provenance/SourceTrustCard';
import LegalClassificationCard from '../components/legal/LegalClassificationCard';
import GovernanceRestrictionCard from '../components/legal/GovernanceRestrictionCard';
import TerritorialMonitoringCard from '../components/monitoring/TerritorialMonitoringCard';
import EvolutionTimelineCard from '../components/timeline/EvolutionTimelineCard';
import OpportunitySignalCard from '../components/opportunities/OpportunitySignalCard';
import AnomalyDetectionCard from '../components/monitoring/AnomalyDetectionCard';
import StrategicOpportunityCard from '../components/opportunities/StrategicOpportunityCard';
import RegionalTransformationCard from '../components/evolution/RegionalTransformationCard';
import InfrastructureExpansionCard from '../components/evolution/InfrastructureExpansionCard';
import InvestorAlertCard from '../components/alerts/InvestorAlertCard';
import ForecastDirectionCard from '../components/timeline/ForecastDirectionCard';
import HistoricalEvidenceCard from '../components/timeline/HistoricalEvidenceCard';
import ExecutionReadinessCard from '../components/execution/ExecutionReadinessCard';
import StrategicDirectionCard from '../components/strategy/StrategicDirectionCard';
import TerritorialRiskCard from '../components/execution/TerritorialRiskCard';
import SimulationOutcomeCard from '../components/simulation/SimulationOutcomeCard';
import OperationalStateCard from '../components/operatingSystem/OperationalStateCard';
import StrategicExposureCard from '../components/strategy/StrategicExposureCard';
import ExecutionConstraintCard from '../components/execution/ExecutionConstraintCard';
import DecisionConfidenceCard from '../components/decisioning/DecisionConfidenceCard';
import RegionalCoordinationCard from '../components/decisioning/RegionalCoordinationCard';
import TerritorialOperatingSystemCard from '../components/operatingSystem/TerritorialOperatingSystemCard';
import {
  getMunicipalityBlockedSource,
  getMunicipalityPublicSourceStatus,
  getMunicipalitySource,
  MunicipalityPublicSourceStatus,
} from '../lib/municipalitySourceRegistry';

type ReadinessStatus =
  | 'READY'
  | 'NEEDS_MORE_DATA'
  | 'NEEDS_PARCEL_IDENTITY'
  | 'NEEDS_TKGM_CHECK'
  | 'NEEDS_MUNICIPALITY_CHECK'
  | 'UNKNOWN';

type ReportReadinessStatus =
  | 'READY_FOR_QUICK_CHECK'
  | 'READY_FOR_PARCEL_INSIGHT'
  | 'READY_FOR_DEVELOPER_FIT'
  | 'READY_FOR_REPORT'
  | 'NEEDS_MORE_DATA'
  | 'NEEDS_PARCEL_IDENTITY'
  | 'NEEDS_TKGM_EVIDENCE'
  | 'NEEDS_MUNICIPALITY_IMAR_EVIDENCE'
  | 'NEEDS_REVIEWED_EVIDENCE'
  | 'SUPPORTING_EVIDENCE_ONLY'
  | 'MANUAL_REVIEW_REQUIRED';

type EvidenceIntent =
  | 'PARCEL_IDENTITY'
  | 'MUNICIPAL_ZONING'
  | 'TKGM_PARCEL'
  | 'TKGM_PRICE_HISTORY'
  | 'GENERAL_SUPPORTING_EVIDENCE';

type EvidenceActionItem = {
  key: string;
  message: string;
  intent: EvidenceIntent;
  actionLabel: string;
  note?: string;
};

type EvidenceMatrixStatus = 'PRESENT' | 'MISSING' | 'NEEDS_REVIEW';

type EvidenceMatrixRow = {
  key: string;
  label: string;
  status: EvidenceMatrixStatus;
  sourceTypeLabel: string;
  reviewStatusLabel: string;
  intentIfMissing?: EvidenceIntent;
};

type EvidenceGuidance = {
  sourceLabel: string;
  sourceActionLabel: string;
  sourceUrl?: string;
  guidanceSteps: string[];
  expectedEvidenceType: string;
  expectedSourceType: string;
  warning?: string;
  placeholder?: string;
  sourceUnavailableNote?: string;
  sourcePublicStatus?: MunicipalityPublicSourceStatus;
  blockedSourceStatus?: MunicipalityPublicSourceStatus;
  blockedSourceNote?: string;
};

function intentActionLabel(intent: EvidenceIntent) {
  if (intent === 'PARCEL_IDENTITY') return 'Upload parcel identity evidence';
  if (intent === 'MUNICIPAL_ZONING') return 'Upload municipal/e-plan evidence';
  if (intent === 'TKGM_PARCEL') return 'Upload TKGM parcel evidence';
  if (intent === 'TKGM_PRICE_HISTORY') return 'Upload TKGM price-history screenshot';
  return 'Upload supporting evidence';
}

function classifyMissingEvidenceIntent(message: string): EvidenceIntent {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('ada/parsel') || normalized.includes('parsel kimliği')) {
    return 'PARCEL_IDENTITY';
  }
  if (normalized.includes('koordinat') || normalized.includes('tkgm evidence')) {
    return 'TKGM_PARCEL';
  }
  if (normalized.includes('price-history') || normalized.includes('market signal')) {
    return 'TKGM_PRICE_HISTORY';
  }
  if (normalized.includes('belediye imar') || normalized.includes('e-plan')) {
    return 'MUNICIPAL_ZONING';
  }
  return 'GENERAL_SUPPORTING_EVIDENCE';
}

function classifyReviewWarningIntent(message: string): EvidenceIntent {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('preview_only') || normalized.includes('review') || normalized.includes('document readiness unavailable')) {
    return 'GENERAL_SUPPORTING_EVIDENCE';
  }
  if (normalized.includes('supporting evidence only')) {
    return 'GENERAL_SUPPORTING_EVIDENCE';
  }
  return 'GENERAL_SUPPORTING_EVIDENCE';
}

function buildEvidenceGuidance(intent: EvidenceIntent, property: PropertyReadinessData | null, docs: DocumentMetadata[]): EvidenceGuidance {
  const municipalityContext = [String(property?.ilce || '').trim(), String(property?.il || '').trim()]
    .filter(Boolean)
    .join(' / ');

  if (intent === 'PARCEL_IDENTITY') {
    return {
      sourceLabel: 'TKGM Parsel Sorgu',
      sourceActionLabel: 'Open TKGM Parsel Sorgu',
      sourceUrl: 'https://parselsorgu.tkgm.gov.tr/',
      guidanceSteps: [
        'Open TKGM Parsel Sorgu manually.',
        'Search by il/ilce/mahalle/ada/parsel if available.',
        'Capture screenshot/export PDF/KML/GeoJSON if available.',
        'Upload to ParselRadar as supporting evidence only.',
      ],
      expectedEvidenceType: 'TKGM_PARCEL_SCREENSHOT',
      expectedSourceType: 'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
    };
  }

  if (intent === 'TKGM_PARCEL') {
    return {
      sourceLabel: 'TKGM Parsel Sorgu',
      sourceActionLabel: 'Open TKGM Parsel Sorgu',
      sourceUrl: 'https://parselsorgu.tkgm.gov.tr/',
      guidanceSteps: [
        'Open TKGM Parsel Sorgu manually.',
        'Review parcel details using available inputs.',
        'Capture screenshot/export evidence if available.',
        'Upload to ParselRadar as supporting evidence only.',
      ],
      expectedEvidenceType: 'TKGM_PARCEL_SCREENSHOT',
      expectedSourceType: 'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE',
    };
  }

  if (intent === 'MUNICIPAL_ZONING') {
    const hasMunicipalEvidenceType = docs.some((doc) =>
      ['MUNICIPALITY_IMAR_DOCUMENT', 'E_PLAN_DOCUMENT'].includes(String(doc.evidenceType || '').trim())
    );
    const hasMunicipalSourceType = docs.some((doc) =>
      ['MUNICIPALITY_IMAR_EVIDENCE', 'E_PLAN_EVIDENCE'].includes(String(doc.sourceType || '').trim())
    );
    const sourceRegistry = getMunicipalitySource(property?.il, property?.ilce);
    const blockedSource = getMunicipalityBlockedSource(property?.il, property?.ilce);
    const publicStatus = getMunicipalityPublicSourceStatus(sourceRegistry.source);
    const hasVerifiedSource = sourceRegistry.status === 'VERIFIED_OFFICIAL_SOURCE' && Boolean(sourceRegistry.source?.url);
    return {
      sourceLabel: hasVerifiedSource
        ? `Official public source to check manually: ${sourceRegistry.source?.sourceLabel || 'Municipality e-Imar / e-Plan / Imar Durumu'}`
        : 'Official public source to check manually: Municipality e-Imar / e-Plan / Imar Durumu',
      sourceActionLabel: hasVerifiedSource ? 'Open official public source' : 'Open municipality guidance',
      sourceUrl: hasVerifiedSource ? sourceRegistry.source?.url : undefined,
      guidanceSteps: [
        municipalityContext
          ? `Relevant municipality/district: ${municipalityContext}`
          : 'Relevant municipality/district should be identified from property location.',
        'Official public source to check manually.',
        'Use the official website of the relevant municipality/district and search for e-Imar, e-Plan, or Imar Durumu.',
        'If online e-Imar is unavailable, request an imar durum document from municipality.',
        'This is guidance only, not automated zoning verification.',
        'Upload a screenshot/document as supporting evidence after checking the source.',
      ],
      expectedEvidenceType: hasMunicipalEvidenceType ? 'MUNICIPALITY_IMAR_DOCUMENT' : 'OTHER',
      expectedSourceType: hasMunicipalSourceType ? 'MUNICIPALITY_IMAR_EVIDENCE' : 'USER_SUBMITTED',
      warning: 'This is guidance only, not automated zoning verification.',
      placeholder: 'Future upgrade: municipality source registry can map il/ilce to official e-Imar/e-Plan URLs after manual verification.',
      sourceUnavailableNote: hasVerifiedSource
        ? `Public source status: ${publicStatus}`
        : 'Exact municipality source URL is not configured yet.',
      sourcePublicStatus: publicStatus,
      blockedSourceStatus: blockedSource?.status,
      blockedSourceNote: blockedSource
        ? `${blockedSource.sourceLabel}: ${blockedSource.reason}`
        : undefined,
    };
  }

  if (intent === 'TKGM_PRICE_HISTORY') {
    return {
      sourceLabel: 'TKGM Parsel Sorgu Analiz / Alim-Satim Istatistikleri',
      sourceActionLabel: 'Open TKGM Parsel Sorgu',
      sourceUrl: 'https://parselsorgu.tkgm.gov.tr/',
      guidanceSteps: [
        'Open TKGM Parsel Sorgu manually.',
        'Use analysis/price-history/statistics tab if available.',
        'Capture screenshot as market signal.',
        'Upload as supporting market evidence only.',
      ],
      expectedEvidenceType: 'TKGM_PRICE_HISTORY_SCREENSHOT',
      expectedSourceType: 'TKGM_ANALYSIS_MARKET_SIGNAL',
      warning: 'Market signal only, not official valuation proof.',
    };
  }

  return {
    sourceLabel: 'Manual supporting evidence',
    sourceActionLabel: 'Open guidance',
    guidanceSteps: [
      'Upload relevant screenshots, PDFs, official letters, listing screenshots, or supporting documents.',
      'Ensure the uploaded file clearly supports the missing evidence context.',
      'Upload as supporting evidence only.',
    ],
    expectedEvidenceType: 'OTHER',
    expectedSourceType: 'USER_SUBMITTED',
  };
}

type DocumentMetadata = {
  _id: string;
  originalName?: string;
  filename?: string;
  documentType?: string;
  evidenceType?: string;
  sourceType?: string;
  reviewStatus?: string;
  metadataStatus?: string;
  supportingEvidenceOnly?: boolean;
  parsedPreview?: Record<string, string>;
  csvDetectedFields?: string[];
  metadata?: {
    evidenceType?: string;
    sourceType?: string;
    reviewStatus?: string;
    metadataStatus?: string;
    supportingEvidenceOnly?: boolean;
  };
};

function normalizeDocumentRecord(raw: unknown): DocumentMetadata | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as Record<string, unknown>;
  const nestedMetadata = source.metadata && typeof source.metadata === 'object'
    ? (source.metadata as Record<string, unknown>)
    : undefined;

  const id = String(source._id || source.id || '').trim();
  if (!id) return null;

  const rootEvidenceType = String(source.evidenceType || '').trim();
  const rootSourceType = String(source.sourceType || '').trim();
  const rootReviewStatus = String(source.reviewStatus || '').trim();
  const rootMetadataStatus = String(source.metadataStatus || '').trim();

  const metadataEvidenceType = String(nestedMetadata?.evidenceType || '').trim();
  const metadataSourceType = String(nestedMetadata?.sourceType || '').trim();
  const metadataReviewStatus = String(nestedMetadata?.reviewStatus || '').trim();
  const metadataMetadataStatus = String(nestedMetadata?.metadataStatus || '').trim();

  const rootSupportingOnly = typeof source.supportingEvidenceOnly === 'boolean' ? source.supportingEvidenceOnly : undefined;
  const metadataSupportingOnly =
    typeof nestedMetadata?.supportingEvidenceOnly === 'boolean' ? nestedMetadata.supportingEvidenceOnly : undefined;

  return {
    _id: id,
    originalName: String(source.originalName || source.filename || source.name || '').trim() || undefined,
    filename: String(source.filename || source.originalName || source.name || '').trim() || undefined,
    documentType: String(source.documentType || source.type || '').trim() || undefined,
    evidenceType: rootEvidenceType || metadataEvidenceType || undefined,
    sourceType: rootSourceType || metadataSourceType || undefined,
    reviewStatus: rootReviewStatus || metadataReviewStatus || undefined,
    metadataStatus: rootMetadataStatus || metadataMetadataStatus || undefined,
    supportingEvidenceOnly:
      typeof rootSupportingOnly === 'boolean'
        ? rootSupportingOnly
        : typeof metadataSupportingOnly === 'boolean'
        ? metadataSupportingOnly
        : undefined,
    parsedPreview:
      source.parsedPreview && typeof source.parsedPreview === 'object' && !Array.isArray(source.parsedPreview)
        ? (source.parsedPreview as Record<string, string>)
        : undefined,
    csvDetectedFields: Array.isArray(source.csvDetectedFields)
      ? source.csvDetectedFields.map((entry) => String(entry || '').trim()).filter(Boolean)
      : undefined,
    metadata: nestedMetadata
      ? {
          evidenceType: metadataEvidenceType || undefined,
          sourceType: metadataSourceType || undefined,
          reviewStatus: metadataReviewStatus || undefined,
          metadataStatus: metadataMetadataStatus || undefined,
          supportingEvidenceOnly: metadataSupportingOnly,
        }
      : undefined,
  };
}

function normalizeDocumentsResponse(payload: unknown): DocumentMetadata[] {
  const normalizeArray = (input: unknown[]) =>
    input
      .map((entry) => normalizeDocumentRecord(entry))
      .filter((entry): entry is DocumentMetadata => Boolean(entry));

  if (Array.isArray(payload)) {
    return normalizeArray(payload);
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as {
      documents?: unknown;
      items?: unknown;
      data?: unknown;
    };

    if (Array.isArray(obj.documents)) {
      return normalizeArray(obj.documents);
    }

    if (Array.isArray(obj.items)) {
      return normalizeArray(obj.items);
    }

    if (Array.isArray(obj.data)) {
      return normalizeArray(obj.data);
    }

    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as { documents?: unknown };
      if (Array.isArray(nested.documents)) {
        return normalizeArray(nested.documents);
      }
    }
  }

  return [];
}

type PropertyReadinessData = {
  listingUrl?: string;
  askingPriceTRY?: number;
  pricePerM2?: number;
  areaM2?: number;
  nitelik?: string;
  zoningStatus?: string;
  updatedAt?: string;
  createdAt?: string;
  dealFlowConsentStatus?: 'NOT_ASKED' | 'DECLINED' | 'OPTED_IN';
  professionalContactAllowed?: boolean;
  il?: string;
  ilce?: string;
  mahalleOrKoy?: string;
  neighborhood?: string;
  ada?: string;
  parsel?: string;
  latitude?: number;
  longitude?: number;
  documents?: unknown[];
  docs?: unknown[];
  documentCount?: number;
  documentsCount?: number;
  docsCount?: number;
};

function getPropertyDocumentCount(property: PropertyReadinessData | null): number {
  if (!property) return 0;
  if (Array.isArray(property.documents)) return property.documents.length;
  if (Array.isArray(property.docs)) return property.docs.length;

  const directCounts = [property.documentCount, property.documentsCount, property.docsCount];
  for (const count of directCounts) {
    if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
      return count;
    }
  }

  return 0;
}

type ReadinessRow = {
  label: string;
  status: ReadinessStatus;
  message: string;
  sources: string[];
};

function statusClasses(status: ReadinessStatus) {
  if (status === 'READY') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'UNKNOWN') return 'bg-slate-50 text-slate-700 border-slate-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function readinessStatusLabel(status: ReadinessStatus) {
  if (status === 'READY') return 'Hazır';
  if (status === 'NEEDS_MORE_DATA') return 'Eksik veri';
  if (status === 'NEEDS_PARCEL_IDENTITY') return 'Parsel kimliği gerekli';
  if (status === 'NEEDS_TKGM_CHECK') return 'TKGM kontrolü gerekli';
  if (status === 'NEEDS_MUNICIPALITY_CHECK') return 'Belediye/imar kanıtı gerekli';
  return 'Bilinmiyor';
}

function isNotReadyStatus(status: ReadinessStatus) {
  return status !== 'READY' && status !== 'UNKNOWN';
}

function reportStatusClasses(status: ReportReadinessStatus) {
  if (
    status === 'READY_FOR_REPORT' ||
    status === 'READY_FOR_QUICK_CHECK' ||
    status === 'READY_FOR_PARCEL_INSIGHT' ||
    status === 'READY_FOR_DEVELOPER_FIT'
  ) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (status === 'MANUAL_REVIEW_REQUIRED' || status === 'NEEDS_REVIEWED_EVIDENCE') {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function reportStatusLabel(status: ReportReadinessStatus) {
  if (status === 'READY_FOR_QUICK_CHECK') return 'Ready for quick check';
  if (status === 'READY_FOR_PARCEL_INSIGHT') return 'Ready for parcel insight';
  if (status === 'READY_FOR_DEVELOPER_FIT') return 'Ready for developer fit';
  if (status === 'READY_FOR_REPORT') return 'Ready for report';
  if (status === 'NEEDS_MORE_DATA') return 'Needs more data';
  if (status === 'NEEDS_PARCEL_IDENTITY') return 'Needs parcel identity';
  if (status === 'NEEDS_TKGM_EVIDENCE') return 'Needs TKGM evidence';
  if (status === 'NEEDS_MUNICIPALITY_IMAR_EVIDENCE') return 'Needs municipality imar evidence';
  if (status === 'NEEDS_REVIEWED_EVIDENCE') return 'Needs reviewed evidence';
  if (status === 'SUPPORTING_EVIDENCE_ONLY') return 'Supporting evidence only';
  return 'Manual review required';
}

function evidenceMatrixStatusClasses(status: EvidenceMatrixStatus) {
  if (status === 'PRESENT') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'NEEDS_REVIEW') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-rose-50 text-rose-700 border-rose-200';
}

function evidenceMatrixStatusLabel(status: EvidenceMatrixStatus) {
  if (status === 'PRESENT') return 'Present';
  if (status === 'NEEDS_REVIEW') return 'Needs review';
  return 'Missing';
}

function toTitleCaseFromCode(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(' ');
}
const DISCLAIMER = `Bu rapor; kullanıcı beyanı, açık kaynak, ilan bilgileri ve yüklenen belgeler üzerinden oluşturulan bilgilendirme amaçlı bir ön analizdir. Hukuki görüş, lisanslı değerleme raporu, yatırım tavsiyesi, tapu inceleme raporu veya emlak aracılık hizmeti değildir. Nihai karar öncesinde tapu, belediye, imar, takyidat, hissedarlık, şufa/önalım, yol ve teknik kontroller yetkili kurumlar ve uzmanlar üzerinden ayrıca teyit edilmelidir.`;
const MAP_LAYER_DISCLAIMER =
  'Map, layer and parcel visuals are informational only. No official cadastral, tapu, zoning or municipal proof is confirmed unless explicitly reviewed from an official source.';

function toFiniteNumber(input: unknown): number | null {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input === 'string') {
    const parsed = Number(input.replace(',', '.').trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatCurrencyTry(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);
}

function formatArea(value?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  return `${value.toLocaleString('tr-TR')} m2`;
}

function formatGeneratedAt(value?: string) {
  if (!value) return 'Not available from current endpoint';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not available from current endpoint';
  return parsed.toLocaleString('tr-TR');
}

function isPlausibleLatitude(value: number) {
  return value >= -90 && value <= 90;
}

function isPlausibleLongitude(value: number) {
  return value >= -180 && value <= 180;
}

function normalizeStatusValue(status?: string) {
  const normalized = String(status || '').trim();
  return normalized || 'Not available from current endpoint';
}

function normalizeCoordinatePreview(docs: DocumentMetadata[]) {
  const acceptedPairs: Array<[string, string]> = [
    ['latitude', 'longitude'],
    ['lat', 'lng'],
    ['lat', 'lon'],
  ];

  let firstValid: {
    latitude: number;
    longitude: number;
    sourceDocumentName: string;
    metadataStatus: string;
    reviewStatus: string;
    supportingEvidenceOnly: boolean;
  } | null = null;
  let validCount = 0;
  let hasCoordinateMetadata = false;

  for (const doc of docs) {
    const parsed = (doc.parsedPreview || {}) as Record<string, unknown>;
    const fields = Array.isArray(doc.csvDetectedFields)
      ? doc.csvDetectedFields.map((field) => String(field).toLowerCase())
      : [];
    const fieldHintFound =
      (fields.includes('latitude') && fields.includes('longitude')) ||
      (fields.includes('lat') && fields.includes('lng')) ||
      (fields.includes('lat') && fields.includes('lon'));

    for (const [latKey, lngKey] of acceptedPairs) {
      const rawLat = parsed[latKey];
      const rawLng = parsed[lngKey];
      if (rawLat != null || rawLng != null || fieldHintFound) {
        hasCoordinateMetadata = true;
      }

      if (rawLat == null || rawLng == null) continue;
      const latitude = toFiniteNumber(rawLat);
      const longitude = toFiniteNumber(rawLng);
      if (latitude === null || longitude === null) continue;
      if (!isPlausibleLatitude(latitude) || !isPlausibleLongitude(longitude)) continue;

      validCount += 1;
      if (!firstValid) {
        firstValid = {
          latitude,
          longitude,
          sourceDocumentName: String(doc.originalName || doc.documentType || doc._id || 'Unknown document'),
          metadataStatus: normalizeStatusValue(doc.metadataStatus),
          reviewStatus: normalizeStatusValue(doc.reviewStatus),
          supportingEvidenceOnly: Boolean(doc.supportingEvidenceOnly),
        };
      }
      break;
    }
  }

  return {
    hasCoordinateMetadata,
    hasValidCoordinates: Boolean(firstValid),
    latitude: firstValid?.latitude ?? null,
    longitude: firstValid?.longitude ?? null,
    sourceDocumentName: firstValid?.sourceDocumentName ?? 'Not available from current endpoint',
    metadataStatus: firstValid?.metadataStatus ?? 'Not available from current endpoint',
    reviewStatus: firstValid?.reviewStatus ?? 'Not available from current endpoint',
    supportingEvidenceOnly: firstValid?.supportingEvidenceOnly ?? true,
    validCount,
  };
}

export default function PropertyResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  type AnalysisActionKey = 'quickScore' | 'parselInsight' | 'developerFit';
  type AnalysisActionStatus = 'idle' | 'loading' | 'success' | 'error' | 'rate_limited' | 'needs_more_data';
  interface AnalysisResult {
    signal: string;
    score: number;
    pricePerM2?: number;
    id?: string;
    topRisks?: string[];
    missingDocs?: string[];
    recommendedAction?: string;
    governanceClassification?: string;
    reportEvidenceSummary?: {
      evidenceStrength?: string;
      sourcesAvailable?: number;
      sourcesTotal?: number;
    };
    reportConfidenceSummary?: {
      score?: number;
      classification?: string;
    };
    reportDisclosureSummary?: {
      mode?: string;
      lines?: string[];
    };
    territorialIntelligence?: {
      macroDirection?: any;
      planningLayer?: any;
      planningProbability?: any;
      infrastructurePressure?: any;
      liquidityProfile?: any;
      developmentProbability?: any;
    };
    ingestionGovernance?: {
      connectorGovernance?: { statusCounts?: Record<string, number> };
      connectors?: Array<{
        connectorKey: string;
        status: string;
        freshnessState: string;
        legalClassification: string;
        governanceState: string;
      }>;
      provenance?: { lineage?: Array<any> };
      trust?: any;
      disclosures?: Array<{ source: string; mode: string; lines: string[] }>;
      compliance?: any;
      auditTrail?: any;
      quota?: Array<{ connectorKey: string; used: number; quota: number; nearLimit: boolean }>;
      cacheEnvelope?: { freshnessScore?: number; cacheState?: string; generatedAt?: string };
      noFakeActiveProof?: boolean;
    };
    operationalIntelligence?: {
      monitoring?: any;
      parcelTimeline?: any;
      opportunities?: { strategicOpportunity?: any; undervaluedCluster?: any };
      anomalies?: { speculativeAnomaly?: any };
      alerts?: { investorAlert?: any };
      regionalTransformation?: any;
      infrastructureHistory?: any;
      history?: { archive?: any; regionalForecast?: any };
    };
    executionOperatingSystem?: any;
  }
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisRunId, setAnalysisRunId] = useState<string | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [analysisActionStates, setAnalysisActionStates] = useState<Record<AnalysisActionKey, AnalysisActionStatus>>({
    quickScore: 'idle',
    parselInsight: 'idle',
    developerFit: 'idle',
  });
  const [propertyData, setPropertyData] = useState<PropertyReadinessData | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [documentMetadataAvailable, setDocumentMetadataAvailable] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsLoaded, setDocumentsLoaded] = useState(false);
  const [documentsFetchFailed, setDocumentsFetchFailed] = useState(false);
  const toast = useToast();

  const getDocumentsIntentUrl = (intent: EvidenceIntent) => {
    const encodedIntent = encodeURIComponent(intent);
    return `/properties/${id}/documents?intent=${encodedIntent}&returnTo=result`;
  };

  const openGuidanceSource = (intent: EvidenceIntent) => {
    const guidance = buildEvidenceGuidance(intent, propertyData, documents);
    if (guidance.sourceUrl) {
      window.open(guidance.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (!id) return;

    const loadReadinessData = async () => {
      let fallbackDocuments: DocumentMetadata[] = [];
      if (!cancelled) {
        setDocumentsLoading(true);
        setDocumentsLoaded(false);
        setDocumentsFetchFailed(false);
      }

      try {
        const propertyResponse = await apiFetch(`properties/${id}`);
        const propertyLevelDocuments = normalizeDocumentsResponse(propertyResponse);
        fallbackDocuments = propertyLevelDocuments;
        if (!cancelled) {
          setPropertyData((propertyResponse?.property || propertyResponse) as PropertyReadinessData);
          if (propertyLevelDocuments.length > 0) {
            setDocuments(propertyLevelDocuments);
            setDocumentMetadataAvailable(true);
          }
        }
      } catch {
        if (!cancelled) setPropertyData(null);
      }

      try {
        const docsResponse = await apiFetch(`properties/${id}/documents`);
        if (cancelled) return;
        const resolvedDocuments = normalizeDocumentsResponse(docsResponse);
        const finalDocuments = resolvedDocuments.length > 0 ? resolvedDocuments : fallbackDocuments;
        setDocuments(finalDocuments);
        setDocumentMetadataAvailable(finalDocuments.length > 0);
        setDocumentsLoading(false);
        setDocumentsLoaded(true);
        setDocumentsFetchFailed(false);
      } catch {
        if (!cancelled) {
          setDocuments(fallbackDocuments);
          setDocumentMetadataAvailable(fallbackDocuments.length > 0);
          setDocumentsLoading(false);
          setDocumentsLoaded(true);
          setDocumentsFetchFailed(fallbackDocuments.length === 0);
        }
      }
    };

    loadReadinessData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const readinessRows = useMemo<ReadinessRow[]>(() => {
    const rows: ReadinessRow[] = [];
    const docs = documents || [];
    const hasSupportingOnly = docs.some((doc) => doc.supportingEvidenceOnly);
    const hasCsvMetadata = docs.some((doc) => Array.isArray(doc.csvDetectedFields) && doc.csvDetectedFields.length > 0);
    const hasConfirmedByAdmin = docs.some(
      (doc) => doc.reviewStatus === 'CONFIRMED_BY_ADMIN' || doc.metadataStatus === 'CONFIRMED_BY_ADMIN'
    );
    const hasPreviewOnly = docs.some(
      (doc) => doc.reviewStatus === 'PREVIEW_ONLY' || doc.metadataStatus === 'PREVIEW_ONLY'
    );

    const getStatusEvidenceNote = () => {
      if (hasConfirmedByAdmin) {
        return 'Admin tarafından metadata onayı var; yine de resmi hukuki kanıt değildir.';
      }
      if (hasPreviewOnly) {
        return 'Metadata preview only seviyesinde, doğrulanmış analiz girdisi değildir.';
      }
      return 'Supporting evidence only, doğrulanmadan analiz girdisi olarak kabul edilmez.';
    };

    const hasListingUrl = Boolean(String(propertyData?.listingUrl || '').trim());
    const hasPriceContext =
      typeof propertyData?.askingPriceTRY === 'number' ||
      typeof propertyData?.pricePerM2 === 'number' ||
      typeof propertyData?.areaM2 === 'number';
    const hasLocationContext = Boolean(String(propertyData?.il || '').trim() && String(propertyData?.ilce || '').trim());
    const hasListingEvidence = docs.some(
      (doc) => doc.sourceType === 'LISTING_SOURCE' || doc.evidenceType === 'LISTING_SCREENSHOT'
    );
    const quickSources: string[] = [];
    if (hasListingUrl || (hasPriceContext && hasLocationContext)) quickSources.push('user-entered data');
    if (hasListingEvidence) quickSources.push('uploaded evidence metadata');
    if (hasCsvMetadata) quickSources.push('CSV preview metadata');
    if (hasSupportingOnly) quickSources.push('supporting evidence only');
    const quickReady = hasListingUrl || (hasPriceContext && hasLocationContext) || hasListingEvidence;
    rows.push({
      label: 'Hızlı İlan Kontrolü',
      status: quickReady ? 'READY' : 'NEEDS_MORE_DATA',
      message: quickReady
        ? `İlan bağlamı veya destekleyici ilan kaynağı mevcut. ${getStatusEvidenceNote()}`
        : `İlan URL, fiyat/m²/lokasyon veya listing source metadata eksik. ${getStatusEvidenceNote()}`,
      sources: quickSources.length > 0 ? quickSources : ['user-entered data'],
    });

    const hasParcelIdentity = Boolean(
      String(propertyData?.il || '').trim() &&
        String(propertyData?.ilce || '').trim() &&
        String(propertyData?.mahalleOrKoy || propertyData?.neighborhood || '').trim() &&
        (String(propertyData?.ada || '').trim() || String(propertyData?.parsel || '').trim())
    );
    const hasCoordinateContext =
      (typeof propertyData?.latitude === 'number' && typeof propertyData?.longitude === 'number') ||
      docs.some((doc) => {
        const fields = Array.isArray(doc.csvDetectedFields) ? doc.csvDetectedFields.map((f) => f.toLowerCase()) : [];
        if (fields.includes('latitude') && fields.includes('longitude')) return true;
        const parsed = doc.parsedPreview || {};
        return Boolean(parsed.latitude && parsed.longitude);
      });
    const hasTkgmManualEvidence = docs.some(
      (doc) =>
        doc.sourceType === 'TKGM_MANUAL_EVIDENCE' ||
        doc.evidenceType === 'TKGM_SCREENSHOT' ||
        doc.evidenceType === 'TKGM_EXPORT'
    );
    const parcelSources: string[] = [];
    if (hasParcelIdentity || (typeof propertyData?.latitude === 'number' && typeof propertyData?.longitude === 'number')) {
      parcelSources.push('user-entered data');
    }
    if (hasTkgmManualEvidence) parcelSources.push('uploaded evidence metadata');
    if (hasCoordinateContext && hasCsvMetadata) parcelSources.push('CSV preview metadata');
    if (hasSupportingOnly) parcelSources.push('supporting evidence only');

    let parcelStatus: ReadinessStatus = 'READY';
    let parcelMessage = 'Parsel kimliği, koordinat bağlamı veya TKGM manual evidence mevcut.';
    if (!(hasParcelIdentity || hasCoordinateContext || hasTkgmManualEvidence)) {
      if (String(propertyData?.il || '').trim() && String(propertyData?.ilce || '').trim()) {
        parcelStatus = 'NEEDS_PARCEL_IDENTITY';
        parcelMessage = 'İl/ilçe mevcut ama mahalle ve ada/parsel kimliği eksik.';
      } else {
        parcelStatus = 'NEEDS_TKGM_CHECK';
        parcelMessage = 'Parsel kimliği veya TKGM manual evidence metadata gerekli.';
      }
    }
    rows.push({
      label: 'Parsel Insight',
      status: parcelStatus,
      message: `${parcelMessage} ${getStatusEvidenceNote()}`,
      sources: parcelSources.length > 0 ? parcelSources : ['user-entered data'],
    });

    const hasMunicipalityEvidence = docs.some(
      (doc) =>
        doc.evidenceType === 'MUNICIPALITY_IMAR_DOCUMENT' ||
        doc.sourceType === 'MUNICIPALITY_IMAR_EVIDENCE'
    );
    const hasEPlanEvidence = docs.some(
      (doc) => doc.evidenceType === 'E_PLAN_DOCUMENT' || doc.sourceType === 'E_PLAN_EVIDENCE'
    );
    const hasZoningDocMetadata = docs.some((doc) => {
      const type = String(doc.documentType || '').toUpperCase();
      return type.includes('IMAR') || type.includes('PLAN');
    });
    const developerSources: string[] = [];
    if (hasMunicipalityEvidence || hasEPlanEvidence || hasZoningDocMetadata) {
      developerSources.push('uploaded evidence metadata');
    }
    if (hasCsvMetadata) developerSources.push('CSV preview metadata');
    if (hasSupportingOnly) developerSources.push('supporting evidence only');
    const developerReady = hasMunicipalityEvidence || hasEPlanEvidence || hasZoningDocMetadata;
    rows.push({
      label: 'Developer Fit',
      status: developerReady ? 'READY' : 'NEEDS_MUNICIPALITY_CHECK',
      message: developerReady
        ? `İmar/e-plan veya plan ilişkili belge metadata mevcut. ${getStatusEvidenceNote()}`
        : `Belediye imar veya e-plan metadata gerekli. ${getStatusEvidenceNote()}`,
      sources: developerSources.length > 0 ? developerSources : ['uploaded evidence metadata'],
    });

    if (!documentMetadataAvailable) {
      return rows.map((row) => ({
        ...row,
        status: row.status === 'READY' ? 'UNKNOWN' : row.status,
        message:
          row.status === 'READY'
            ? `${row.message} (uploaded evidence metadata not available in this phase)`
            : row.message,
      }));
    }

    return rows;
  }, [documents, documentMetadataAvailable, propertyData]);

  const setActionState = (action: AnalysisActionKey, status: AnalysisActionStatus) => {
    setAnalysisActionStates((prev) => ({ ...prev, [action]: status }));
  };

  const runAnalysisAction = async (action: AnalysisActionKey, endpoint: string) => {
    if (analysisActionStates[action] === 'loading') return;

    setResult(null);
    setPdfId(null);
    setActionState(action, 'loading');
    const loadingToastId = toast.loading('Analiz çalıştırılıyor...');
    try {
      const res = await apiFetch(endpoint, { method: 'POST' });
      setResult(res);
      setAnalysisRunId(res.id);
      setActionState(action, 'success');
      toast.dismiss(loadingToastId);
      toast.success('Analiz tamamlandı');
    } catch (err) {
      const apiError = err as { status?: number; error?: string; message?: string };
      const errorText = String(apiError.error || apiError.message || '').toLowerCase();
      toast.dismiss(loadingToastId);
      if (apiError.status === 429) {
        setActionState(action, 'rate_limited');
        toast.error('Çok fazla deneme yapıldı. Lütfen biraz bekleyip tekrar deneyin.');
        return;
      }
      if (
        apiError.status === 400 ||
        errorText.includes('validation') ||
        errorText.includes('missing') ||
        errorText.includes('invalid') ||
        errorText.includes('eksik') ||
        errorText.includes('geçersiz') ||
        errorText.includes('gecersiz')
      ) {
        setActionState(action, 'needs_more_data');
        toast.error('Eksik veya geçersiz veri nedeniyle analiz tamamlanamadı.');
        return;
      }
      setActionState(action, 'error');
      toast.error(apiError.error || 'Analiz başarısız');
    }
  };

  const getActionCaption = (action: AnalysisActionKey) => {
    const status = analysisActionStates[action];
    if (status === 'loading') return 'Çalışıyor...';
    if (status === 'success') return 'Tamamlandı';
    if (status === 'rate_limited') return 'Bekleme gerekli';
    if (status === 'needs_more_data') return 'Eksik veri';
    if (status === 'error') return 'Hata';
    return null;
  };

  const readinessByAction = useMemo(() => {
    const byLabel = new Map(readinessRows.map((row) => [row.label, row]));
    return {
      quickScore: byLabel.get('Hızlı İlan Kontrolü') || null,
      parselInsight: byLabel.get('Parsel Insight') || null,
      developerFit: byLabel.get('Developer Fit') || null,
    } as Record<AnalysisActionKey, ReadinessRow | null>;
  }, [readinessRows]);

  const reportReadiness = useMemo(() => {
    const quickRow = readinessByAction.quickScore;
    const parcelRow = readinessByAction.parselInsight;
    const developerRow = readinessByAction.developerFit;
    const docs = documents || [];
    const fallbackDocumentCount = getPropertyDocumentCount(propertyData);
    const isEvidenceCheckPending = documentsLoading || !documentsLoaded;

    const hasUploadedEvidence = docs.length > 0 || fallbackDocumentCount > 0;
    const hasSupportingOnly = docs.some((doc) => doc.supportingEvidenceOnly);
    const hasManualReviewRequired = docs.some(
      (doc) => doc.reviewStatus === 'MANUAL_REVIEW_REQUIRED' || doc.metadataStatus === 'MANUAL_REVIEW_REQUIRED'
    );
    const hasRejected = docs.some((doc) => doc.reviewStatus === 'REJECTED' || doc.metadataStatus === 'REJECTED');
    const allPreviewOnlyEvidence =
      hasUploadedEvidence &&
      docs.every((doc) => {
        const review = String(doc.reviewStatus || '').toUpperCase();
        const metadata = String(doc.metadataStatus || '').toUpperCase();
        return review === 'PREVIEW_ONLY' || metadata === 'PREVIEW_ONLY';
      });
    const hasTkgmPriceHistoryEvidence = docs.some(
      (doc) =>
        String(doc.evidenceType || '').trim() === 'TKGM_PRICE_HISTORY_SCREENSHOT' ||
        String(doc.sourceType || '').trim() === 'TKGM_ANALYSIS_MARKET_SIGNAL'
    );

    const quickStatus: ReportReadinessStatus =
      quickRow?.status === 'READY' ? 'READY_FOR_QUICK_CHECK' : 'NEEDS_MORE_DATA';
    const parcelStatus: ReportReadinessStatus =
      parcelRow?.status === 'READY'
        ? 'READY_FOR_PARCEL_INSIGHT'
        : parcelRow?.status === 'NEEDS_PARCEL_IDENTITY'
        ? 'NEEDS_PARCEL_IDENTITY'
        : 'NEEDS_TKGM_EVIDENCE';
    const developerStatus: ReportReadinessStatus =
      developerRow?.status === 'READY' ? 'READY_FOR_DEVELOPER_FIT' : 'NEEDS_MUNICIPALITY_IMAR_EVIDENCE';

    const hasAnyAnalysisReady =
      quickStatus === 'READY_FOR_QUICK_CHECK' ||
      parcelStatus === 'READY_FOR_PARCEL_INSIGHT' ||
      developerStatus === 'READY_FOR_DEVELOPER_FIT';

    const allAnalysesBlocked =
      quickStatus !== 'READY_FOR_QUICK_CHECK' &&
      parcelStatus !== 'READY_FOR_PARCEL_INSIGHT' &&
      developerStatus !== 'READY_FOR_DEVELOPER_FIT';

    const missingEvidence: string[] = [];
    if (isEvidenceCheckPending) {
      missingEvidence.push('Kanıt belgeleri kontrol ediliyor...');
    } else if (documentsFetchFailed) {
      missingEvidence.push('Belge durumu doğrulanamadı. Lütfen belgeler sayfasını kontrol edin.');
    } else if (!hasUploadedEvidence) {
      missingEvidence.push('En az bir belge/evidence yüklenmeli.');
    }
    if (quickStatus !== 'READY_FOR_QUICK_CHECK') {
      missingEvidence.push('Quick check için ilan URL veya temel listing/property bağlamı gerekli.');
    }
    if (parcelStatus === 'NEEDS_PARCEL_IDENTITY') {
      missingEvidence.push('Parsel insight için ada/parsel kimliği eksik.');
    }
    if (parcelStatus === 'NEEDS_TKGM_EVIDENCE') {
      missingEvidence.push('Parsel insight için koordinat veya TKGM evidence gerekli.');
    }
    if (developerStatus !== 'READY_FOR_DEVELOPER_FIT') {
      missingEvidence.push('Developer fit için belediye imar/e-plan evidence gerekli.');
    }
    if (!hasTkgmPriceHistoryEvidence) {
      missingEvidence.push('TKGM market signal için price-history screenshot önerilir.');
    }

    const missingEvidenceActions: EvidenceActionItem[] = missingEvidence.map((message, index) => {
      const intent = classifyMissingEvidenceIntent(message);
      return {
        key: `missing-${index}-${intent}`,
        message,
        intent,
        actionLabel: intentActionLabel(intent),
        note: intent === 'MUNICIPAL_ZONING' ? 'Manual supporting evidence only.' : undefined,
      };
    });

    const reviewWarnings: string[] = [];
    if (!documentMetadataAvailable) {
      reviewWarnings.push('Document readiness unavailable. Upload/review evidence recommended.');
    }
    if (hasUploadedEvidence && (allPreviewOnlyEvidence || hasManualReviewRequired || hasSupportingOnly)) {
      reviewWarnings.push('Belge yüklendi, ancak analizde doğrulanmış kanıt olarak kullanılmadan önce inceleme gerekebilir.');
    }
    if (allPreviewOnlyEvidence) {
      reviewWarnings.push('Evidence metadata PREVIEW_ONLY seviyesinde. Rapor öncesi review gerekli.');
    }
    if (hasSupportingOnly) {
      reviewWarnings.push('Supporting evidence only işaretli belgeler tek başına resmi doğrulama değildir.');
    }
    if (hasManualReviewRequired) {
      reviewWarnings.push('Manual review required statüsünde belge var.');
    }
    if (hasRejected) {
      reviewWarnings.push('Rejected statüsünde belge var, rapor kapsamı etkilenebilir.');
    }

    const reviewWarningActions: EvidenceActionItem[] = reviewWarnings.map((message, index) => {
      const intent = classifyReviewWarningIntent(message);
      return {
        key: `warning-${index}-${intent}`,
        message,
        intent,
        actionLabel: intentActionLabel(intent),
      };
    });

    let overallStatus: ReportReadinessStatus = 'NEEDS_MORE_DATA';
    if (!documentMetadataAvailable || hasManualReviewRequired) {
      overallStatus = 'MANUAL_REVIEW_REQUIRED';
    } else if (hasSupportingOnly && !hasAnyAnalysisReady) {
      overallStatus = 'SUPPORTING_EVIDENCE_ONLY';
    } else if (hasUploadedEvidence && allPreviewOnlyEvidence) {
      overallStatus = 'NEEDS_REVIEWED_EVIDENCE';
    } else if (hasAnyAnalysisReady && !allAnalysesBlocked && hasUploadedEvidence && !allPreviewOnlyEvidence) {
      overallStatus = 'READY_FOR_REPORT';
    } else if (parcelStatus === 'NEEDS_PARCEL_IDENTITY') {
      overallStatus = 'NEEDS_PARCEL_IDENTITY';
    } else if (parcelStatus === 'NEEDS_TKGM_EVIDENCE') {
      overallStatus = 'NEEDS_TKGM_EVIDENCE';
    } else if (developerStatus === 'NEEDS_MUNICIPALITY_IMAR_EVIDENCE') {
      overallStatus = 'NEEDS_MUNICIPALITY_IMAR_EVIDENCE';
    }

    const showIncompleteReportWarning = overallStatus !== 'READY_FOR_REPORT';

    return {
      overallStatus,
      quickStatus,
      parcelStatus,
      developerStatus,
      missingEvidence,
      missingEvidenceActions,
      reviewWarnings,
      reviewWarningActions,
      hasSupportingOnly,
      showIncompleteReportWarning,
    };
  }, [
    documents,
    documentMetadataAvailable,
    documentsFetchFailed,
    documentsLoaded,
    documentsLoading,
    propertyData,
    readinessByAction,
  ]);

  const csvCoordinatePreview = useMemo(() => normalizeCoordinatePreview(documents || []), [documents]);

  const mapLayerReadiness = useMemo(() => {
    const docs = documents || [];
    const fallbackDocumentCount = getPropertyDocumentCount(propertyData);
    const evidenceCount = docs.length > 0 ? docs.length : fallbackDocumentCount;
    const locationIdentity = {
      province: String(propertyData?.il || '').trim(),
      district: String(propertyData?.ilce || '').trim(),
      neighborhood: String(propertyData?.mahalleOrKoy || propertyData?.neighborhood || '').trim(),
    };
    const parcelIdentity = {
      ada: String(propertyData?.ada || '').trim(),
      parsel: String(propertyData?.parsel || '').trim(),
    };

    const userLat = toFiniteNumber(propertyData?.latitude);
    const userLng = toFiniteNumber(propertyData?.longitude);
    const hasUserCoordinates = userLat !== null && userLng !== null;

    const csvLat = csvCoordinatePreview.latitude;
    const csvLng = csvCoordinatePreview.longitude;
    const csvCoordinateDetected = csvCoordinatePreview.hasCoordinateMetadata;

    const effectiveLat = hasUserCoordinates ? userLat : csvLat;
    const effectiveLng = hasUserCoordinates ? userLng : csvLng;
    const hasCoordinates = effectiveLat !== null && effectiveLng !== null;

    const coordinateStatus = hasUserCoordinates
      ? 'Available from user input'
      : hasCoordinates
      ? 'Available from uploaded CSV preview'
      : 'Missing';

    const evidenceStatus = documentsLoading
      ? 'Checking uploaded evidence...'
      : evidenceCount > 0
      ? 'Available from uploaded evidence metadata'
      : documentsFetchFailed
      ? 'Not available from current endpoint'
      : 'Missing';

    const distinctEvidenceTypes = Array.from(
      new Set(docs.map((doc) => String(doc.evidenceType || doc.documentType || '').trim()).filter(Boolean))
    ).slice(0, 4);
    const distinctSourceTypes = Array.from(
      new Set(docs.map((doc) => String(doc.sourceType || '').trim()).filter(Boolean))
    ).slice(0, 4);

    const hasTkgmEvidence = docs.some((doc) => {
      const evidence = String(doc.evidenceType || '').trim();
      const source = String(doc.sourceType || '').trim();
      return evidence.startsWith('TKGM_') || source.startsWith('TKGM_');
    });
    const hasTkgmPriceHistoryEvidence = docs.some(
      (doc) =>
        String(doc.evidenceType || '').trim() === 'TKGM_PRICE_HISTORY_SCREENSHOT' ||
        String(doc.sourceType || '').trim() === 'TKGM_ANALYSIS_MARKET_SIGNAL'
    );

    return {
      locationIdentity,
      parcelIdentity,
      hasCoordinates,
      effectiveLat,
      effectiveLng,
      csvCoordinateDetected,
      coordinateStatus,
      evidenceCount,
      evidenceStatus,
      distinctEvidenceTypes,
      distinctSourceTypes,
      hasTkgmEvidence,
      hasTkgmPriceHistoryEvidence,
    };
  }, [csvCoordinatePreview, documents, documentsFetchFailed, documentsLoading, propertyData]);

  const evidenceMatrixRows = useMemo<EvidenceMatrixRow[]>(() => {
    const docs = documents || [];
    const hasAnyReviewWarning = (groupDocs: DocumentMetadata[]) =>
      groupDocs.some((doc) => {
        const review = String(doc.reviewStatus || '').toUpperCase();
        const metadata = String(doc.metadataStatus || '').toUpperCase();
        return review === 'NEEDS_REVIEW' || review === 'PREVIEW_ONLY' || metadata === 'NEEDS_REVIEW' || metadata === 'PREVIEW_ONLY';
      });

    const summarizeSources = (groupDocs: DocumentMetadata[]) => {
      const values = Array.from(
        new Set(
          groupDocs
            .map((doc) => String(doc.sourceType || '').trim())
            .filter(Boolean)
        )
      );
      return values.length > 0 ? values.join(', ') : 'Not available from current endpoint';
    };

    const summarizeReview = (groupDocs: DocumentMetadata[]) => {
      const values = Array.from(
        new Set(
          groupDocs
            .map((doc) => String(doc.reviewStatus || doc.metadataStatus || '').trim().toUpperCase())
            .filter(Boolean)
        )
      );
      return values.length > 0 ? values.map((value) => toTitleCaseFromCode(value)).join(', ') : 'Not available from current endpoint';
    };

    const resolveStatus = (groupDocs: DocumentMetadata[], fallbackPresent = false): EvidenceMatrixStatus => {
      if (groupDocs.length === 0 && !fallbackPresent) return 'MISSING';
      if (hasAnyReviewWarning(groupDocs)) return 'NEEDS_REVIEW';
      return 'PRESENT';
    };

    const parcelIdentityDocs = docs.filter((doc) => {
      const evidenceType = String(doc.evidenceType || '').trim();
      const sourceType = String(doc.sourceType || '').trim();
      return evidenceType === 'TKGM_PARCEL_SCREENSHOT' || sourceType === 'TKGM_PUBLIC_PARCEL_SORGU_EVIDENCE';
    });

    const tkgmParcelDocs = docs.filter((doc) => {
      const evidenceType = String(doc.evidenceType || '').trim();
      return evidenceType === 'TKGM_PARCEL_SCREENSHOT' || evidenceType === 'TKGM_EXPORT_PDF' || evidenceType === 'TKGM_EXPORT_KML' || evidenceType === 'TKGM_EXPORT_GEOJSON';
    });

    const tkgmPriceDocs = docs.filter((doc) => {
      const evidenceType = String(doc.evidenceType || '').trim();
      const sourceType = String(doc.sourceType || '').trim();
      return evidenceType === 'TKGM_PRICE_HISTORY_SCREENSHOT' || sourceType === 'TKGM_ANALYSIS_MARKET_SIGNAL';
    });

    const municipalityDocs = docs.filter((doc) => {
      const evidenceType = String(doc.evidenceType || '').trim();
      const sourceType = String(doc.sourceType || '').trim();
      return (
        evidenceType === 'MUNICIPALITY_IMAR_DOCUMENT' ||
        evidenceType === 'E_PLAN_DOCUMENT' ||
        sourceType === 'MUNICIPALITY_IMAR_EVIDENCE' ||
        sourceType === 'E_PLAN_EVIDENCE'
      );
    });

    const generalSupportingDocs = docs.filter((doc) => {
      const sourceType = String(doc.sourceType || '').trim();
      const evidenceType = String(doc.evidenceType || '').trim();
      return sourceType === 'USER_SUBMITTED' || evidenceType === 'OTHER' || evidenceType === 'PHOTO' || evidenceType === 'LISTING_SCREENSHOT';
    });

    const fallbackDocumentCount = getPropertyDocumentCount(propertyData);
    const uploadCount = docs.length > 0 ? docs.length : fallbackDocumentCount;

    return [
      {
        key: 'parcel-identity',
        label: 'Parcel identity evidence',
        status: resolveStatus(parcelIdentityDocs, Boolean(propertyData?.ada || propertyData?.parsel)),
        sourceTypeLabel: summarizeSources(parcelIdentityDocs),
        reviewStatusLabel: summarizeReview(parcelIdentityDocs),
        intentIfMissing: 'PARCEL_IDENTITY',
      },
      {
        key: 'tkgm-parcel',
        label: 'TKGM parcel evidence',
        status: resolveStatus(tkgmParcelDocs),
        sourceTypeLabel: summarizeSources(tkgmParcelDocs),
        reviewStatusLabel: summarizeReview(tkgmParcelDocs),
        intentIfMissing: 'TKGM_PARCEL',
      },
      {
        key: 'tkgm-price',
        label: 'TKGM price-history / market signal evidence',
        status: resolveStatus(tkgmPriceDocs),
        sourceTypeLabel: summarizeSources(tkgmPriceDocs),
        reviewStatusLabel: summarizeReview(tkgmPriceDocs),
        intentIfMissing: 'TKGM_PRICE_HISTORY',
      },
      {
        key: 'municipality',
        label: 'Municipality/e-Imar/e-Plan evidence',
        status: resolveStatus(municipalityDocs),
        sourceTypeLabel: summarizeSources(municipalityDocs),
        reviewStatusLabel: summarizeReview(municipalityDocs),
        intentIfMissing: 'MUNICIPAL_ZONING',
      },
      {
        key: 'general-supporting',
        label: 'General supporting evidence',
        status: resolveStatus(generalSupportingDocs),
        sourceTypeLabel: summarizeSources(generalSupportingDocs),
        reviewStatusLabel: summarizeReview(generalSupportingDocs),
        intentIfMissing: 'GENERAL_SUPPORTING_EVIDENCE',
      },
      {
        key: 'csv-coordinate',
        label: 'CSV coordinate preview evidence',
        status: csvCoordinatePreview.hasCoordinateMetadata
          ? csvCoordinatePreview.hasValidCoordinates
            ? 'PRESENT'
            : 'NEEDS_REVIEW'
          : 'MISSING',
        sourceTypeLabel: csvCoordinatePreview.hasCoordinateMetadata ? 'CSV preview metadata' : 'Not available from current endpoint',
        reviewStatusLabel: csvCoordinatePreview.hasCoordinateMetadata
          ? `${csvCoordinatePreview.metadataStatus} / ${csvCoordinatePreview.reviewStatus}`
          : 'Not available from current endpoint',
        intentIfMissing: 'GENERAL_SUPPORTING_EVIDENCE',
      },
      {
        key: 'upload-count',
        label: 'Uploaded documents count',
        status: uploadCount > 0 ? 'PRESENT' : 'MISSING',
        sourceTypeLabel: uploadCount > 0 ? `${uploadCount} document(s)` : '0 document(s)',
        reviewStatusLabel: uploadCount > 0 ? 'Review status varies by document' : 'No uploaded documents',
        intentIfMissing: 'GENERAL_SUPPORTING_EVIDENCE',
      },
    ];
  }, [csvCoordinatePreview, documents, propertyData]);

  const readinessSummary = useMemo(() => {
    const needsOfficialReview =
      reportReadiness.overallStatus === 'MANUAL_REVIEW_REQUIRED' ||
      reportReadiness.overallStatus === 'NEEDS_REVIEWED_EVIDENCE' ||
      reportReadiness.overallStatus === 'SUPPORTING_EVIDENCE_ONLY';

    const summaryLabel =
      reportReadiness.overallStatus === 'READY_FOR_REPORT'
        ? 'Ready'
        : needsOfficialReview
        ? 'Needs official review'
        : 'Needs evidence';

    return {
      summaryLabel,
      missingCriticalEvidence: reportReadiness.missingEvidence.slice(0, 4),
      supportingEvidenceAvailable: (documents || []).length > 0 || getPropertyDocumentCount(propertyData) > 0,
      manualReviewRequired: needsOfficialReview || reportReadiness.reviewWarnings.length > 0,
    };
  }, [documents, propertyData, reportReadiness]);

  const marketSignalSummary = useMemo(() => {
    const docs = documents || [];
    const tkgmPriceHistoryDocs = docs.filter(
      (doc) =>
        String(doc.evidenceType || '').trim() === 'TKGM_PRICE_HISTORY_SCREENSHOT' ||
        String(doc.sourceType || '').trim() === 'TKGM_ANALYSIS_MARKET_SIGNAL'
    );

    return {
      hasTkgmPriceHistory: tkgmPriceHistoryDocs.length > 0,
      tkgmPriceHistoryNames: tkgmPriceHistoryDocs.map((doc) => doc.originalName || doc.filename || doc._id),
      hasCsvSignal: csvCoordinatePreview.hasCoordinateMetadata,
      hasPriceContext:
        typeof propertyData?.askingPriceTRY === 'number' ||
        typeof propertyData?.pricePerM2 === 'number' ||
        typeof propertyData?.areaM2 === 'number',
    };
  }, [csvCoordinatePreview.hasCoordinateMetadata, documents, propertyData]);

  const reportHeaderSummary = useMemo(() => {
    const location = [propertyData?.il, propertyData?.ilce, propertyData?.mahalleOrKoy || propertyData?.neighborhood]
      .filter(Boolean)
      .join(' / ');
    const assetType = String(propertyData?.nitelik || propertyData?.zoningStatus || 'Not available from current endpoint');
    return {
      location: location || 'Not available from current endpoint',
      assetType,
      askingPrice: formatCurrencyTry(propertyData?.askingPriceTRY),
      area: formatArea(propertyData?.areaM2),
      generatedAt: formatGeneratedAt(propertyData?.updatedAt || propertyData?.createdAt),
      informationalStatus: 'Informational pre-check only',
    };
  }, [propertyData]);

  const criticalMissingEvidenceCount = useMemo(() => {
    return reportReadiness.missingEvidenceActions.filter((item) => item.intent !== 'GENERAL_SUPPORTING_EVIDENCE').length;
  }, [reportReadiness.missingEvidenceActions]);

  const sourceGuidanceSummaryRows = useMemo(() => {
    return reportReadiness.missingEvidenceActions.slice(0, 6).map((item) => {
      const guidance = buildEvidenceGuidance(item.intent, propertyData, documents);
      const sourceStatus = guidance.sourcePublicStatus || 'NOT_CONFIGURED';
      return { item, guidance, sourceStatus };
    });
  }, [documents, propertyData, reportReadiness.missingEvidenceActions]);

  const copyReportSummary = async () => {
    const lines = [
      `Property/location: ${reportHeaderSummary.location}`,
      `Asset type: ${reportHeaderSummary.assetType}`,
      `Asking price: ${reportHeaderSummary.askingPrice}`,
      `Area: ${reportHeaderSummary.area}`,
      `Overall readiness: ${reportStatusLabel(reportReadiness.overallStatus)}`,
      `Critical missing evidence count: ${criticalMissingEvidenceCount}`,
      `Supporting evidence present: ${readinessSummary.supportingEvidenceAvailable ? 'Yes' : 'No'}`,
      `Manual/professional review required: ${readinessSummary.manualReviewRequired ? 'Yes' : 'No'}`,
      'Boundary: Informational pre-check only; official verification remains external.',
    ];
    const summaryText = lines.join('\n');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
        toast.success('Report summary copied');
        return;
      }
      toast.error('Clipboard not available');
    } catch {
      toast.error('Report summary could not be copied');
    }
  };

  const getActionButtonText = (action: AnalysisActionKey) => {
    if (analysisActionStates[action] === 'loading') return 'Çalışıyor...';
    const row = readinessByAction[action];
    if (row && isNotReadyStatus(row.status)) return 'Yine de çalıştır';
    if (action === 'quickScore') return 'Hızlı İlan Kontrolü';
    if (action === 'parselInsight') return 'Parsel Insight';
    return 'Developer Fit';
  };

  const purchasePDF = async () => {
    if (!analysisRunId) return;
    const loadingToastId = toast.loading('PDF satın alma işlemi başlatılıyor...');
    try {
      const res = await apiFetch(`reports/${analysisRunId}/purchase-pdf`, { method: 'POST' });
      setPdfId(res.id);
      toast.dismiss(loadingToastId);
      toast.success('PDF satın alma başarılı');
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string }).error || 'PDF alınamadı');
    }
  };

  return (
    <div className="premium-report premium-surface max-w-5xl mx-auto mt-10 p-6 rounded shadow print:shadow-none print:mt-0 print:p-4">
      <h2 className="text-xl font-bold mb-4">Analiz Sonucu</h2>
      <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-3 print:border-slate-300">
        <h3 className="text-sm font-semibold text-slate-900">Report Header</h3>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="rounded border border-slate-200 bg-white p-2 text-xs text-slate-700">
            <div><span className="font-medium">Property/location:</span> {reportHeaderSummary.location}</div>
            <div><span className="font-medium">Asset type:</span> {reportHeaderSummary.assetType}</div>
            <div><span className="font-medium">Asking price:</span> {reportHeaderSummary.askingPrice}</div>
            <div><span className="font-medium">Area:</span> {reportHeaderSummary.area}</div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2 text-xs text-slate-700">
            <div><span className="font-medium">Generated/updated:</span> {reportHeaderSummary.generatedAt}</div>
            <div><span className="font-medium">Status:</span> {reportHeaderSummary.informationalStatus}</div>
            <div><span className="font-medium">Boundary:</span> Not official verification</div>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded border border-slate-200 bg-white p-3">
        <h3 className="text-sm font-semibold text-slate-900">Executive Readiness Summary</h3>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
            <div><span className="font-medium">Overall readiness:</span> {reportStatusLabel(reportReadiness.overallStatus)}</div>
            <div><span className="font-medium">Critical missing evidence count:</span> {criticalMissingEvidenceCount}</div>
            <div><span className="font-medium">Supporting evidence present:</span> {readinessSummary.supportingEvidenceAvailable ? 'Yes' : 'No'}</div>
            <div><span className="font-medium">Manual/professional review required:</span> {readinessSummary.manualReviewRequired ? 'Yes' : 'No'}</div>
          </div>
          <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
            Not official verification. ParselRadar is an informational pre-check and evidence organization workspace only.
          </div>
        </div>
      </div>

      <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-900">Analysis readiness</h3>
        <div className="mt-2 space-y-2">
          {readinessRows.map((row) => (
            <div key={row.label} className="rounded border border-slate-200 bg-white p-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{row.label}</span>
                <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${statusClasses(row.status)}`}>
                  {readinessStatusLabel(row.status)}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-600">{row.message}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {row.sources.map((source) => (
                  <span key={`${row.label}-${source}`} className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded border border-slate-200 bg-white p-3">
        <h3 className="text-sm font-semibold text-slate-900">Evidence Matrix</h3>
        <div className="mt-2 space-y-2">
          {evidenceMatrixRows.map((row) => (
            <div key={row.key} className="rounded border border-slate-200 bg-slate-50 p-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{row.label}</span>
                <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${evidenceMatrixStatusClasses(row.status)}`}>
                  {evidenceMatrixStatusLabel(row.status)}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-600">Source type: {row.sourceTypeLabel}</div>
              <div className="text-xs text-slate-600">Review status: {row.reviewStatusLabel}</div>
              {row.status === 'MISSING' && row.intentIfMissing ? (
                <button
                  className="mt-2 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                  type="button"
                  onClick={() => navigate(getDocumentsIntentUrl(row.intentIfMissing!))}
                >
                  {intentActionLabel(row.intentIfMissing)}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded border border-slate-200 bg-white p-3">
        <h3 className="text-sm font-semibold text-slate-900">Readiness summary</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${reportStatusClasses(reportReadiness.overallStatus)}`}>
            {readinessSummary.summaryLabel}
          </span>
          <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
            Supporting evidence available: {readinessSummary.supportingEvidenceAvailable ? 'Yes' : 'No'}
          </span>
          <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
            Manual review required: {readinessSummary.manualReviewRequired ? 'Yes' : 'No'}
          </span>
        </div>
        {readinessSummary.missingCriticalEvidence.length > 0 ? (
          <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2">
            <div className="text-xs font-medium text-amber-800">Missing critical evidence</div>
            <ul className="mt-1 list-disc pl-4 text-xs text-amber-800">
              {readinessSummary.missingCriticalEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mb-4 rounded border border-slate-200 bg-white p-3">
        <h3 className="text-sm font-semibold text-slate-900">Market signals</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-700">
          <li>TKGM price-history screenshot: {marketSignalSummary.hasTkgmPriceHistory ? 'Present' : 'Missing'}</li>
          <li>CSV signal preview metadata: {marketSignalSummary.hasCsvSignal ? 'Present' : 'Missing'}</li>
          <li>Price/comparable context: {marketSignalSummary.hasPriceContext ? 'Present' : 'Missing'}</li>
        </ul>
        {marketSignalSummary.tkgmPriceHistoryNames.length > 0 ? (
          <div className="mt-2 text-xs text-slate-600">
            TKGM price-history evidence files: {marketSignalSummary.tkgmPriceHistoryNames.join(', ')}
          </div>
        ) : null}
        <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
          Market signals are supporting evidence only and do not represent official valuation proof.
        </div>
      </div>

      {reportReadiness.missingEvidenceActions.length > 0 ? (
        <div className="mb-4 rounded border border-slate-200 bg-white p-3">
          <h3 className="text-sm font-semibold text-slate-900">Source Guidance Summary</h3>
          <div className="mt-2 space-y-2">
            {sourceGuidanceSummaryRows.map(({ item, guidance, sourceStatus }) => {
              return (
                <div key={`recap-${item.key}`} className="rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
                  <div className="font-medium text-slate-900">{item.message}</div>
                  <div className="mt-1">Where to get it: {guidance.sourceLabel}</div>
                  <div className="mt-1">Public source status: {sourceStatus}</div>
                  {guidance.blockedSourceStatus ? <div className="mt-1">Blocked source status: {guidance.blockedSourceStatus}</div> : null}
                  <div className="mt-1">What to upload: evidenceType={guidance.expectedEvidenceType}, sourceType={guidance.expectedSourceType}</div>
                  {guidance.sourceUnavailableNote ? <div className="mt-1">{guidance.sourceUnavailableNote}</div> : null}
                  {guidance.blockedSourceNote ? <div className="mt-1">{guidance.blockedSourceNote}</div> : null}
                  {!guidance.sourceUrl ? (
                    <div className="mt-1">Use the official website of the relevant municipality/district and search for e-Imar, e-Plan or Imar Durumu.</div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      className="rounded border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                      type="button"
                      onClick={() => openGuidanceSource(item.intent)}
                      disabled={!guidance.sourceUrl}
                    >
                      {guidance.sourceActionLabel}
                    </button>
                    <button
                      className="rounded border border-slate-300 bg-white px-2 py-1 font-medium text-slate-700 hover:bg-slate-100"
                      type="button"
                      onClick={() => navigate(getDocumentsIntentUrl(item.intent))}
                    >
                      Upload this evidence
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mb-4 rounded border border-slate-200 bg-white p-3">
        <h3 className="text-sm font-semibold text-slate-900">Report readiness</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${reportStatusClasses(reportReadiness.overallStatus)}`}>
            {reportStatusLabel(reportReadiness.overallStatus)}
          </span>
          <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${reportStatusClasses(reportReadiness.quickStatus)}`}>
            Quick: {reportStatusLabel(reportReadiness.quickStatus)}
          </span>
          <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${reportStatusClasses(reportReadiness.parcelStatus)}`}>
            Parcel: {reportStatusLabel(reportReadiness.parcelStatus)}
          </span>
          <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${reportStatusClasses(reportReadiness.developerStatus)}`}>
            Developer: {reportStatusLabel(reportReadiness.developerStatus)}
          </span>
        </div>
        {reportReadiness.missingEvidence.length > 0 ? (
          <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2">
            <div className="text-xs font-medium text-amber-800">Missing evidence</div>
            <ul className="mt-1 list-disc pl-4 text-xs text-amber-800">
              {reportReadiness.missingEvidenceActions.map((item) => (
                <li key={item.key}>
                  <div>{item.message}</div>
                  <div className="mt-1 rounded border border-amber-200 bg-white p-2 text-[11px] text-amber-900">
                    {(() => {
                      const guidance = buildEvidenceGuidance(item.intent, propertyData, documents);
                      return (
                        <>
                          <div className="font-semibold">Where to get this</div>
                          <div className="mt-1">Source: {guidance.sourceLabel}</div>
                          <ul className="mt-1 list-disc pl-4">
                            {guidance.guidanceSteps.map((step) => (
                              <li key={`${item.key}-${step}`}>{step}</li>
                            ))}
                          </ul>
                          <div className="mt-1">Upload back to ParselRadar as supporting evidence only.</div>
                          <div className="mt-1">Expected upload mapping: evidenceType={guidance.expectedEvidenceType}, sourceType={guidance.expectedSourceType}</div>
                          {guidance.warning ? <div className="mt-1">{guidance.warning}</div> : null}
                          {guidance.sourceUnavailableNote ? <div className="mt-1">{guidance.sourceUnavailableNote}</div> : null}
                          {guidance.placeholder ? <div className="mt-1">{guidance.placeholder}</div> : null}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              className="rounded border border-amber-300 bg-white px-2 py-1 font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                              type="button"
                              onClick={() => openGuidanceSource(item.intent)}
                              disabled={!guidance.sourceUrl}
                            >
                              {guidance.sourceActionLabel}
                            </button>
                            <button
                              className="rounded border border-amber-300 bg-white px-2 py-1 font-medium text-amber-800 hover:bg-amber-100"
                              type="button"
                              onClick={() => navigate(getDocumentsIntentUrl(item.intent))}
                            >
                              Upload this evidence
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {item.note ? <div className="mt-1 text-[11px] text-amber-700">{item.note}</div> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {reportReadiness.reviewWarnings.length > 0 ? (
          <div className="mt-2 rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
            <div className="font-medium">Review warnings</div>
            <ul className="mt-1 list-disc pl-4">
              {reportReadiness.reviewWarningActions.map((warning) => (
                <li key={warning.key}>
                  <div>{warning.message}</div>
                  <button
                    className="mt-1 rounded border border-rose-300 bg-white px-2 py-1 text-[11px] font-medium text-rose-800 hover:bg-rose-100"
                    type="button"
                    onClick={() => navigate(getDocumentsIntentUrl(warning.intent))}
                  >
                    {warning.actionLabel}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {reportReadiness.hasSupportingOnly ? (
          <div className="mt-2 text-xs text-amber-700">
            Supporting evidence warning: Supporting-only belgeler tek başına nihai rapor doğrulaması için yeterli değildir.
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            href="https://parselsorgu.tkgm.gov.tr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open TKGM Parsel Sorgu
          </a>
          <button
            className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => navigate(getDocumentsIntentUrl('GENERAL_SUPPORTING_EVIDENCE'))}
          >
            Upload evidence
          </button>
          <button
            className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => navigate(getDocumentsIntentUrl('GENERAL_SUPPORTING_EVIDENCE'))}
          >
            Review documents
          </button>
          <button
            className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => navigate(`/properties/${id}`)}
          >
            Back to property
          </button>
        </div>
      </div>
      <div className="mb-4 rounded border border-slate-200 bg-slate-50 p-3">
        <h3 className="text-sm font-semibold text-slate-900">Map &amp; Layer Readiness</h3>
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="text-xs font-medium text-slate-700">Location identity</div>
            <div className="mt-1 text-xs text-slate-600">Province: {mapLayerReadiness.locationIdentity.province || 'Missing'}</div>
            <div className="text-xs text-slate-600">District: {mapLayerReadiness.locationIdentity.district || 'Missing'}</div>
            <div className="text-xs text-slate-600">Neighborhood: {mapLayerReadiness.locationIdentity.neighborhood || 'Missing'}</div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="text-xs font-medium text-slate-700">Ada/parsel identity</div>
            <div className="mt-1 text-xs text-slate-600">Ada: {mapLayerReadiness.parcelIdentity.ada || 'Missing'}</div>
            <div className="text-xs text-slate-600">Parsel: {mapLayerReadiness.parcelIdentity.parsel || 'Missing'}</div>
            <div className="mt-1 text-xs text-amber-700">Needs official/manual confirmation</div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="text-xs font-medium text-slate-700">Coordinate availability</div>
            <div className="mt-1 text-xs text-slate-600">Status: {mapLayerReadiness.coordinateStatus}</div>
            {mapLayerReadiness.hasCoordinates ? (
              <>
                <div className="text-xs text-slate-600">Latitude: {mapLayerReadiness.effectiveLat}</div>
                <div className="text-xs text-slate-600">Longitude: {mapLayerReadiness.effectiveLng}</div>
              </>
            ) : (
              <div className="text-xs text-amber-700">Coordinates missing</div>
            )}
            {mapLayerReadiness.csvCoordinateDetected ? (
              <div className="mt-1 text-xs text-slate-600">CSV coordinate preview detected</div>
            ) : null}
          </div>
          <div className="rounded border border-slate-200 bg-white p-2">
            <div className="text-xs font-medium text-slate-700">Uploaded evidence availability</div>
            <div className="mt-1 text-xs text-slate-600">Count: {mapLayerReadiness.evidenceCount}</div>
            <div className="text-xs text-slate-600">Status: {mapLayerReadiness.evidenceStatus}</div>
            <div className="mt-1 text-xs text-slate-600">
              Evidence types: {mapLayerReadiness.distinctEvidenceTypes.length > 0 ? mapLayerReadiness.distinctEvidenceTypes.join(', ') : 'Not available from current endpoint'}
            </div>
            <div className="text-xs text-slate-600">
              Source types: {mapLayerReadiness.distinctSourceTypes.length > 0 ? mapLayerReadiness.distinctSourceTypes.join(', ') : 'Not available from current endpoint'}
            </div>
          </div>
        </div>

        <div className="mt-2 rounded border border-slate-200 bg-white p-2">
          <div className="text-xs font-medium text-slate-700">Map placeholder</div>
          {mapLayerReadiness.hasCoordinates ? (
            <div className="mt-1 rounded border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
              Coordinate point available ({mapLayerReadiness.effectiveLat}, {mapLayerReadiness.effectiveLng}). No official cadastral boundary or parcel polygon is connected.
            </div>
          ) : (
            <div className="mt-1 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">Coordinates missing</div>
          )}
        </div>

        <div className="mt-2 rounded border border-slate-200 bg-white p-2">
          <div className="text-xs font-medium text-slate-700">Layer connection status</div>
          <ul className="mt-1 space-y-1 text-xs text-slate-600">
            <li>TKGM layer: Not connected yet</li>
            <li>TUCBS layer: Not connected yet</li>
            <li>CSB/imar layer: Not connected yet</li>
            <li>Municipality/e-plan layer: Manual evidence only</li>
            <li>Uploaded evidence: Supporting information only</li>
            <li>TKGM evidence: {mapLayerReadiness.hasTkgmEvidence ? 'Available (TKGM market signal / supporting evidence)' : 'Missing'}</li>
            <li>TKGM price history screenshot: {mapLayerReadiness.hasTkgmPriceHistoryEvidence ? 'Available (TKGM market signal / supporting evidence)' : 'Missing'}</li>
          </ul>
        </div>

        <div className="mt-2 rounded border border-slate-200 bg-white p-2 text-xs text-slate-700">
          TKGM evidence is uploaded manually by the user/admin and is supporting informational evidence only. ParselRadar does not automate TKGM access, does not bypass restrictions, and does not confirm official legal/tapu/cadastral/zoning proof.
        </div>

        <div className="mt-2 rounded border border-slate-200 bg-white p-2">
          <div className="text-xs font-medium text-slate-700">CSV Coordinate Preview</div>
          {documentsFetchFailed ? (
            <div className="mt-1 text-xs text-slate-600">No CSV coordinate metadata available.</div>
          ) : csvCoordinatePreview.hasValidCoordinates ? (
            <div className="mt-1 space-y-1 text-xs text-slate-700">
              <div>Latitude: {csvCoordinatePreview.latitude}</div>
              <div>Longitude: {csvCoordinatePreview.longitude}</div>
              <div>Source: uploaded CSV preview</div>
              <div>Source document: {csvCoordinatePreview.sourceDocumentName}</div>
              <div>Metadata status: {csvCoordinatePreview.metadataStatus}</div>
              <div>Review status: {csvCoordinatePreview.reviewStatus}</div>
              <div>Preview only / needs confirmation</div>
              {csvCoordinatePreview.supportingEvidenceOnly ? (
                <div>Upload remains supporting evidence only</div>
              ) : null}
              {csvCoordinatePreview.validCount > 1 ? (
                <div>{csvCoordinatePreview.validCount} CSV coordinate preview(s) detected. Showing first valid preview.</div>
              ) : null}
              <div className="mt-2 rounded border border-slate-200 bg-slate-50 p-3">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded border border-dashed border-slate-300 bg-white">
                  <div className="relative h-10 w-10">
                    <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-300" />
                    <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-slate-300" />
                    <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-500 bg-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-1 space-y-1 text-xs text-slate-700">
              <div>Coordinates missing</div>
              <div>Upload a CSV with latitude/longitude fields for preview.</div>
              {!csvCoordinatePreview.hasCoordinateMetadata ? (
                <div>No CSV coordinate metadata available.</div>
              ) : null}
            </div>
          )}
          <div className="mt-2 text-xs text-slate-600">
            CSV coordinate preview is informational only. It is not official cadastral, tapu, zoning, municipal or legal proof.
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-600">{MAP_LAYER_DISCLAIMER}</div>
      </div>
      <div className="mb-4 space-y-2">
        {([
          { key: 'quickScore', label: 'Hızlı İlan Kontrolü', endpoint: `analysis/${id}/quick-score` },
          { key: 'parselInsight', label: 'Parsel Insight', endpoint: `analysis/${id}/parsel-insight` },
          { key: 'developerFit', label: 'Developer Fit', endpoint: `analysis/${id}/developer-fit` },
        ] as Array<{ key: AnalysisActionKey; label: string; endpoint: string }>).map((action) => {
          const row = readinessByAction[action.key];
          const showHelper =
            row?.status === 'NEEDS_MORE_DATA' ||
            row?.status === 'NEEDS_PARCEL_IDENTITY' ||
            row?.status === 'NEEDS_TKGM_CHECK' ||
            row?.status === 'NEEDS_MUNICIPALITY_CHECK';

          return (
            <div key={action.key} className="rounded border border-slate-200 bg-white p-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">{action.label}</span>
                  {row ? (
                    <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${statusClasses(row.status)}`}>
                      {readinessStatusLabel(row.status)}
                    </span>
                  ) : null}
                </div>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60"
                  disabled={analysisActionStates[action.key] === 'loading'}
                  onClick={() => runAnalysisAction(action.key, action.endpoint)}
                >
                  {getActionButtonText(action.key)}
                </button>
              </div>
              {showHelper ? (
                <div className="mt-1 text-xs text-amber-700">
                  <div>{row?.message}</div>
                  <button
                    className="mt-1 rounded border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100"
                    type="button"
                    onClick={() => {
                      const rowStatus = row?.status;
                      const intent: EvidenceIntent =
                        rowStatus === 'NEEDS_PARCEL_IDENTITY'
                          ? 'PARCEL_IDENTITY'
                          : rowStatus === 'NEEDS_TKGM_CHECK'
                          ? 'TKGM_PARCEL'
                          : rowStatus === 'NEEDS_MUNICIPALITY_CHECK'
                          ? 'MUNICIPAL_ZONING'
                          : 'GENERAL_SUPPORTING_EVIDENCE';
                      navigate(getDocumentsIntentUrl(intent));
                    }}
                  >
                    {row?.status === 'NEEDS_PARCEL_IDENTITY'
                      ? 'Upload parcel identity evidence'
                      : row?.status === 'NEEDS_TKGM_CHECK'
                      ? 'Upload TKGM parcel evidence'
                      : row?.status === 'NEEDS_MUNICIPALITY_CHECK'
                      ? 'Upload municipal/e-plan evidence'
                      : 'Upload supporting evidence'}
                  </button>
                  {row?.status === 'NEEDS_MUNICIPALITY_CHECK' ? (
                    <div className="mt-1 text-[11px] text-amber-700">Manual supporting evidence only.</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mb-4 rounded border border-slate-200 bg-white p-3">
        <h3 className="text-sm font-semibold text-slate-900">Export Readiness</h3>
        <div className="mt-2 text-xs text-slate-700">
          {pdfId
            ? 'Export/download PDF is available for the current report.'
            : analysisRunId
            ? 'PDF export exists behind current report purchase/download flow.'
            : 'Export/download PDF: not active yet.'}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            className="rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={copyReportSummary}
          >
            Copy/share report summary
          </button>
        </div>
      </div>

      <div className="mb-4 text-xs text-slate-600 flex flex-wrap gap-3">
        <span>Hızlı İlan Kontrolü: {getActionCaption('quickScore') || 'Hazır'}</span>
        <span>Parsel Insight: {getActionCaption('parselInsight') || 'Hazır'}</span>
        <span>Developer Fit: {getActionCaption('developerFit') || 'Hazır'}</span>
      </div>
      {result && (
        <div className="border p-4 rounded mb-4">
          <div className="mb-3">
            <GovernanceBadge classification={result.governanceClassification} />
          </div>
          <div><b>Signal:</b> {result.signal}</div>
          <div><b>Skor:</b> {typeof result?.score === 'number' ? result.score : 'Skor mevcut değil'}</div>
          <div><b>TL/m²:</b> {result.pricePerM2 || '-'}</div>
          <div><b>En büyük 3 risk:</b> {(result.topRisks || []).join(', ')}</div>
          <div><b>Eksik belgeler:</b> {(result.missingDocs || []).join(', ')}</div>
          <div><b>Önerilen sonraki adım:</b> {result.recommendedAction || '-'}</div>
          <div className="mt-2 text-yellow-700">PDF raporun tamamı için satın alma gereklidir.</div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <ConfidenceMeter
              score={result.reportConfidenceSummary?.score}
              classification={result.reportConfidenceSummary?.classification}
            />
            <EvidenceStrengthCard
              evidenceStrength={result.reportEvidenceSummary?.evidenceStrength}
              sourcesAvailable={result.reportEvidenceSummary?.sourcesAvailable}
              sourcesTotal={result.reportEvidenceSummary?.sourcesTotal}
            />
          </div>
          <div className="mt-3">
            <DisclosurePanel
              mode={result.reportDisclosureSummary?.mode}
              lines={result.reportDisclosureSummary?.lines}
            />
          </div>
          {result.territorialIntelligence && (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <MacroGrowthCard macroDirection={result.territorialIntelligence.macroDirection} />
              <PlanningSignalCard planningLayer={result.territorialIntelligence.planningLayer} />
              <ImarProbabilityCard probability={result.territorialIntelligence.planningProbability} />
              <InfrastructurePressureCard pressure={result.territorialIntelligence.infrastructurePressure} />
              <LiquidityScoreCard liquidity={result.territorialIntelligence.liquidityProfile} />
              <DevelopmentForecastCard forecast={result.territorialIntelligence.developmentProbability} />
            </div>
          )}
          {result.ingestionGovernance && (
            <div className="mt-3 space-y-3">
              <div className="rounded border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-900">
                No fake ACTIVE proof: {result.ingestionGovernance.noFakeActiveProof ? 'PASS' : 'FAIL'}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ConnectorGovernanceCard governance={result.ingestionGovernance.connectorGovernance} />
                <ConnectorHealthCard connectors={result.ingestionGovernance.connectors} />
                <ConnectorCapabilityCard connectors={result.ingestionGovernance.connectors} />
                <RateLimitStatusCard quota={result.ingestionGovernance.quota} />
                <IngestionFreshnessCard cacheEnvelope={result.ingestionGovernance.cacheEnvelope} />
                <IngestionAuditCard auditTrail={result.ingestionGovernance.auditTrail} />
                <SourceLineageCard lineage={result.ingestionGovernance.provenance?.lineage} />
                <SourceTrustCard trust={result.ingestionGovernance.trust} />
                <LegalClassificationCard disclosures={result.ingestionGovernance.disclosures} />
                <GovernanceRestrictionCard compliance={result.ingestionGovernance.compliance} />
              </div>
            </div>
          )}
          {result.operationalIntelligence && (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <TerritorialMonitoringCard monitoring={result.operationalIntelligence.monitoring} />
              <EvolutionTimelineCard timeline={result.operationalIntelligence.parcelTimeline} />
              <OpportunitySignalCard opportunity={result.operationalIntelligence.opportunities?.undervaluedCluster} />
              <StrategicOpportunityCard strategic={result.operationalIntelligence.opportunities?.strategicOpportunity} />
              <AnomalyDetectionCard anomaly={result.operationalIntelligence.anomalies?.speculativeAnomaly} />
              <RegionalTransformationCard transformation={result.operationalIntelligence.regionalTransformation} />
              <InfrastructureExpansionCard expansion={result.operationalIntelligence.infrastructureHistory} />
              <InvestorAlertCard alert={result.operationalIntelligence.alerts?.investorAlert} />
              <ForecastDirectionCard forecast={result.operationalIntelligence.history?.regionalForecast} />
              <HistoricalEvidenceCard archive={result.operationalIntelligence.history?.archive} />
            </div>
          )}
          {result.executionOperatingSystem && (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <ExecutionReadinessCard readiness={result.executionOperatingSystem.readiness?.readinessEnvelope} />
              <StrategicDirectionCard direction={result.executionOperatingSystem.strategy?.direction} />
              <TerritorialRiskCard risk={result.executionOperatingSystem.readiness?.riskMatrix} />
              <SimulationOutcomeCard outcome={result.executionOperatingSystem.simulation} />
              <OperationalStateCard state={result.executionOperatingSystem.operatingSystem?.state} />
              <StrategicExposureCard exposure={result.executionOperatingSystem.readiness?.exposure} />
              <ExecutionConstraintCard constraint={result.executionOperatingSystem.execution?.constraints} />
              <DecisionConfidenceCard decision={result.executionOperatingSystem.decisioning?.confidence} />
              <RegionalCoordinationCard coordination={result.executionOperatingSystem.coordination?.regionalCoordination} />
              <TerritorialOperatingSystemCard tos={result.executionOperatingSystem} />
            </div>
          )}
        </div>
      )}
      {analysisRunId && !pdfId && (
        <div className="mb-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={purchasePDF}>PDF Rapor Satın Al</button>
          {reportReadiness.showIncompleteReportWarning ? (
            <div className="mt-2 text-xs text-amber-700">
              This report may be incomplete because required evidence is missing or not reviewed.
            </div>
          ) : null}
        </div>
      )}
      {pdfId && (
        <a className="bg-blue-600 text-white px-4 py-2 rounded" href={`/reports/${pdfId}/download`}>PDF Raporu İndir</a>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="bg-gray-200 px-4 py-2 rounded" type="button" onClick={() => navigate(`/properties/${id}`)}>Mülk Detayına Dön</button>
        <button className="bg-gray-200 px-4 py-2 rounded" type="button" onClick={() => navigate('/dashboard')}>Dashboard'a Dön</button>
      </div>
      <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
        ParselRadar provides informational evidence organization and pre-check readiness. It does not replace official TKGM, municipality, tapu, zoning, legal, valuation or professional verification.
      </div>
      <div className="mt-6 text-xs text-gray-600 border-t pt-4">{DISCLAIMER}</div>
    </div>
  );
}

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

type DocumentMetadata = {
  _id: string;
  documentType?: string;
  evidenceType?: string;
  sourceType?: string;
  reviewStatus?: string;
  metadataStatus?: string;
  supportingEvidenceOnly?: boolean;
  parsedPreview?: Record<string, string>;
  csvDetectedFields?: string[];
};

function normalizeDocumentsResponse(payload: unknown): DocumentMetadata[] {
  if (Array.isArray(payload)) {
    return payload as DocumentMetadata[];
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as {
      documents?: unknown;
      items?: unknown;
      data?: unknown;
    };

    if (Array.isArray(obj.documents)) {
      return obj.documents as DocumentMetadata[];
    }

    if (Array.isArray(obj.items)) {
      return obj.items as DocumentMetadata[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data as DocumentMetadata[];
    }

    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as { documents?: unknown };
      if (Array.isArray(nested.documents)) {
        return nested.documents as DocumentMetadata[];
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

  useEffect(() => {
    let cancelled = false;
    if (!id) return;

    const loadReadinessData = async () => {
      if (!cancelled) {
        setDocumentsLoading(true);
        setDocumentsLoaded(false);
        setDocumentsFetchFailed(false);
      }

      try {
        const propertyResponse = await apiFetch(`properties/${id}`);
        if (!cancelled) {
          setPropertyData((propertyResponse?.property || propertyResponse) as PropertyReadinessData);
        }
      } catch {
        if (!cancelled) setPropertyData(null);
      }

      try {
        const docsResponse = await apiFetch(`properties/${id}/documents`);
        if (cancelled) return;
        const resolvedDocuments = normalizeDocumentsResponse(docsResponse);
        setDocuments(resolvedDocuments);
        setDocumentMetadataAvailable(true);
        setDocumentsLoading(false);
        setDocumentsLoaded(true);
        setDocumentsFetchFailed(false);
      } catch {
        if (!cancelled) {
          setDocuments([]);
          setDocumentMetadataAvailable(false);
          setDocumentsLoading(false);
          setDocumentsLoaded(true);
          setDocumentsFetchFailed(true);
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
      reviewWarnings,
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

    let csvLat: number | null = null;
    let csvLng: number | null = null;
    let csvCoordinateDetected = false;

    for (const doc of docs) {
      const parsed = doc.parsedPreview || {};
      const parsedLat = toFiniteNumber(parsed.latitude || parsed.lat);
      const parsedLng = toFiniteNumber(parsed.longitude || parsed.lng || parsed.lon);
      const fields = Array.isArray(doc.csvDetectedFields)
        ? doc.csvDetectedFields.map((field) => String(field).toLowerCase())
        : [];
      if (parsedLat !== null && parsedLng !== null) {
        csvCoordinateDetected = true;
        csvLat = parsedLat;
        csvLng = parsedLng;
        break;
      }
      if (fields.includes('latitude') && fields.includes('longitude')) {
        csvCoordinateDetected = true;
      }
    }

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
    };
  }, [documents, documentsFetchFailed, documentsLoading, propertyData]);

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
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Analiz Sonucu</h2>
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
              {reportReadiness.missingEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {reportReadiness.reviewWarnings.length > 0 ? (
          <div className="mt-2 rounded border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
            <div className="font-medium">Review warnings</div>
            <ul className="mt-1 list-disc pl-4">
              {reportReadiness.reviewWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
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
          <button
            className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => navigate(`/properties/${id}/documents`)}
          >
            Upload evidence
          </button>
          <button
            className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => navigate(`/properties/${id}/documents`)}
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
          </ul>
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
              {showHelper ? <div className="mt-1 text-xs text-amber-700">{row?.message}</div> : null}
            </div>
          );
        })}
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
      <div className="mt-6 text-xs text-gray-600 border-t pt-4">{DISCLAIMER}</div>
    </div>
  );
}

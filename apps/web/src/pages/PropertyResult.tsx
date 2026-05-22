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

type DocumentMetadata = {
  _id: string;
  documentType?: string;
  evidenceType?: string;
  sourceType?: string;
  metadataStatus?: string;
  supportingEvidenceOnly?: boolean;
  parsedPreview?: Record<string, string>;
  csvDetectedFields?: string[];
};

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
};

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
const DISCLAIMER = `Bu rapor; kullanıcı beyanı, açık kaynak, ilan bilgileri ve yüklenen belgeler üzerinden oluşturulan bilgilendirme amaçlı bir ön analizdir. Hukuki görüş, lisanslı değerleme raporu, yatırım tavsiyesi, tapu inceleme raporu veya emlak aracılık hizmeti değildir. Nihai karar öncesinde tapu, belediye, imar, takyidat, hissedarlık, şufa/önalım, yol ve teknik kontroller yetkili kurumlar ve uzmanlar üzerinden ayrıca teyit edilmelidir.`;

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
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    if (!id) return;

    const loadReadinessData = async () => {
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
        if (Array.isArray(docsResponse)) {
          setDocuments(docsResponse as DocumentMetadata[]);
          setDocumentMetadataAvailable(true);
        } else {
          setDocuments([]);
          setDocumentMetadataAvailable(false);
        }
      } catch {
        if (!cancelled) {
          setDocuments([]);
          setDocumentMetadataAvailable(false);
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
        ? 'İlan bağlamı veya destekleyici ilan kaynağı mevcut.'
        : 'İlan URL, fiyat/m²/lokasyon veya listing source metadata eksik.',
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
      message: parcelMessage,
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
        ? 'İmar/e-plan veya plan ilişkili belge metadata mevcut.'
        : 'Belediye imar veya e-plan metadata gerekli.',
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
                  {row.status}
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
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60"
          disabled={analysisActionStates.quickScore === 'loading'}
          onClick={() => runAnalysisAction('quickScore', `analysis/${id}/quick-score`)}
        >
          Hızlı İlan Kontrolü
        </button>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60"
          disabled={analysisActionStates.parselInsight === 'loading'}
          onClick={() => runAnalysisAction('parselInsight', `analysis/${id}/parsel-insight`)}
        >
          Parsel Insight
        </button>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-60"
          disabled={analysisActionStates.developerFit === 'loading'}
          onClick={() => runAnalysisAction('developerFit', `analysis/${id}/developer-fit`)}
        >
          Developer Fit
        </button>
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
        <button className="bg-green-600 text-white px-4 py-2 rounded mb-2" onClick={purchasePDF}>PDF Rapor Satın Al</button>
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

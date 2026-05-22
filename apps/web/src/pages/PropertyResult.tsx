import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
const DISCLAIMER = `Bu rapor; kullanıcı beyanı, açık kaynak, ilan bilgileri ve yüklenen belgeler üzerinden oluşturulan bilgilendirme amaçlı bir ön analizdir. Hukuki görüş, lisanslı değerleme raporu, yatırım tavsiyesi, tapu inceleme raporu veya emlak aracılık hizmeti değildir. Nihai karar öncesinde tapu, belediye, imar, takyidat, hissedarlık, şufa/önalım, yol ve teknik kontroller yetkili kurumlar ve uzmanlar üzerinden ayrıca teyit edilmelidir.`;

export default function PropertyResult() {
  const { id } = useParams();
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
  const toast = useToast();

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
      <div className="mt-6 text-xs text-gray-600 border-t pt-4">{DISCLAIMER}</div>
    </div>
  );
}

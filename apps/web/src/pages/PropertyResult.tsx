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
  const toast = useToast();

  const runAnalysisEndpoint = async (endpoint: string) => {
    setResult(null);
    setPdfId(null);
    const loadingToastId = toast.loading('Analiz çalıştırılıyor...');
    try {
      const res = await apiFetch(endpoint, { method: 'POST' });
      setResult(res);
      setAnalysisRunId(res.id);
      toast.dismiss(loadingToastId);
      toast.success('Analiz tamamlandı');
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string }).error || 'Analiz başarısız');
    }
  };

  const runAnalysis = async (type: string) => {
    await runAnalysisEndpoint(`analysis/${id}/${type}`);
  };

  const runParselInsight = async () => {
    setResult(null);
    setPdfId(null);
    const loadingToastId = toast.loading('Analiz çalıştırılıyor...');
    try {
      const res = await apiFetch(`analysis/${id}/parsel-insight`, { method: 'POST' });
      setResult(res);
      setAnalysisRunId(res.id);
      toast.dismiss(loadingToastId);
      toast.success('Analiz tamamlandı');
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string }).error || 'Analiz başarısız');
    }
  };

  const runDeveloperFit = async () => {
    setResult(null);
    setPdfId(null);
    const loadingToastId = toast.loading('Analiz çalıştırılıyor...');
    try {
      const res = await apiFetch(`analysis/${id}/developer-fit`, { method: 'POST' });
      setResult(res);
      setAnalysisRunId(res.id);
      toast.dismiss(loadingToastId);
      toast.success('Analiz tamamlandı');
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error((err as { error?: string }).error || 'Analiz başarısız');
    }
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
      <div className="space-x-2 mb-4">
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => runAnalysis('quick-score')}>Hızlı İlan Kontrolü</button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={runParselInsight}>Parsel Insight</button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={runDeveloperFit}>Developer Fit</button>
      </div>
      {result && (
        <div className="border p-4 rounded mb-4">
          <div className="mb-3">
            <GovernanceBadge classification={result.governanceClassification} />
          </div>
          <div><b>Signal:</b> {result.signal}</div>
          <div><b>Skor:</b> {result.score}</div>
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

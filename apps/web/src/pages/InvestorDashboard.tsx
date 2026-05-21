import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import InvestorSummaryCard from '../components/investor/InvestorSummaryCard';
import GovernanceBadge from '../components/governance/GovernanceBadge';
import TrustClassificationCard from '../components/governance/TrustClassificationCard';
import ConfidenceMeter from '../components/confidence/ConfidenceMeter';
import DisclosurePanel from '../components/disclosure/DisclosurePanel';
import MacroGrowthCard from '../components/intelligence/MacroGrowthCard';
import PlanningSignalCard from '../components/planning/PlanningSignalCard';
import LiquidityScoreCard from '../components/intelligence/LiquidityScoreCard';
import DevelopmentForecastCard from '../components/forecasting/DevelopmentForecastCard';
import ConnectorGovernanceCard from '../components/connectors/ConnectorGovernanceCard';
import ConnectorHealthCard from '../components/connectors/ConnectorHealthCard';
import RateLimitStatusCard from '../components/connectors/RateLimitStatusCard';
import IngestionFreshnessCard from '../components/ingestion/IngestionFreshnessCard';
import IngestionAuditCard from '../components/ingestion/IngestionAuditCard';
import SourceTrustCard from '../components/provenance/SourceTrustCard';
import GovernanceRestrictionCard from '../components/legal/GovernanceRestrictionCard';
import TerritorialMonitoringCard from '../components/monitoring/TerritorialMonitoringCard';
import AnomalyDetectionCard from '../components/monitoring/AnomalyDetectionCard';
import EvolutionTimelineCard from '../components/timeline/EvolutionTimelineCard';
import ForecastDirectionCard from '../components/timeline/ForecastDirectionCard';
import HistoricalEvidenceCard from '../components/timeline/HistoricalEvidenceCard';
import RegionalTransformationCard from '../components/evolution/RegionalTransformationCard';
import InfrastructureExpansionCard from '../components/evolution/InfrastructureExpansionCard';
import InvestorAlertCard from '../components/alerts/InvestorAlertCard';
import OpportunitySignalCard from '../components/opportunities/OpportunitySignalCard';
import StrategicOpportunityCard from '../components/opportunities/StrategicOpportunityCard';
import AutonomousIntelligenceCard from '../components/autonomy/AutonomousIntelligenceCard';
import GovernedEscalationCard from '../components/autonomy/GovernedEscalationCard';
import ReviewQueueCard from '../components/autonomy/ReviewQueueCard';
import SuppressionGovernanceCard from '../components/autonomy/SuppressionGovernanceCard';
import CadenceAndDegradationCard from '../components/autonomy/CadenceAndDegradationCard';
import ParcelWatchlistCard from '../components/watchlists/ParcelWatchlistCard';
import RegionWatchCard from '../components/watchlists/RegionWatchCard';
import IntelligenceFeedCard from '../components/feeds/IntelligenceFeedCard';
import PortfolioIntelligenceCard from '../components/portfolioOps/PortfolioIntelligenceCard';
import StrategicMonitoringCard from '../components/strategic/StrategicMonitoringCard';
import AutonomousMonitoringCard from '../components/autonomy/AutonomousMonitoringCard';
import InvestorPriorityCard from '../components/autonomy/InvestorPriorityCard';
import WatchlistActivityCard from '../components/watchlists/WatchlistActivityCard';
import StrategicRegionCard from '../components/strategic/StrategicRegionCard';
import PortfolioExposureCard from '../components/portfolioOps/PortfolioExposureCard';
import RegionalSurveillanceCard from '../components/strategic/RegionalSurveillanceCard';
import OpportunityPriorityCard from '../components/autonomy/OpportunityPriorityCard';
import EscalationTimelineCard from '../components/autonomy/EscalationTimelineCard';
import AutonomousReviewQueueCard from '../components/autonomy/AutonomousReviewQueueCard';
import UserScopedNotice from '../components/UserScopedNotice';
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

export default function InvestorDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('investor/dashboard')
      .then(setData)
      .catch((err) => setError(err?.error || 'Dashboard yüklenemedi'));
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Yükleniyor...</div>;

  const summary = data.summary || {};
  const governanceSnapshot = data.governanceSnapshot || {};
  const territorialSnapshot = data.territorialSnapshot || {};
  const ingestionSnapshot = data.ingestionSnapshot || {};
  const operationalSnapshot = data.operationalSnapshot || {};
  const autonomySnapshot = data.autonomySnapshot || {};
  const executionSnapshot = data.executionSnapshot || {};

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">Investor Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/investor/saved-analyses" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-white">Saved Analyses</Link>
            <Link to="/investor/watchlist" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-white">Watchlist</Link>
            <Link to="/investor/portfolio" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-white">Portfolio</Link>
          </div>
        </div>

        <UserScopedNotice />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <InvestorSummaryCard label="Saved" value={summary.savedAnalysesCount || 0} />
          <InvestorSummaryCard label="Watchlist" value={summary.watchlistCount || 0} />
          <InvestorSummaryCard label="Portfolios" value={summary.portfolioCount || 0} />
          <InvestorSummaryCard label="Avg Opportunity" value={summary.averageOpportunityScore || 0} />
          <InvestorSummaryCard label="Stale Intelligence" value={summary.staleIntelligenceCount || 0} />
          <InvestorSummaryCard label="High Potential" value={summary.highPotentialProperties || 0} />
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Investor metrics inherit analysis confidence/freshness/version fields from the latest intelligence records.
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <GovernanceBadge classification={governanceSnapshot.governanceClassification} />
          </div>
          <TrustClassificationCard
            trustScore={governanceSnapshot.trustScore}
            compliance={governanceSnapshot.disclosureSummary?.compliance}
          />
          <ConfidenceMeter
            score={governanceSnapshot.confidenceSummary?.score}
            classification={governanceSnapshot.confidenceSummary?.classification}
          />
          <DisclosurePanel
            mode={governanceSnapshot.disclosureSummary?.mode}
            lines={governanceSnapshot.disclosureSummary?.lines}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <MacroGrowthCard macroDirection={territorialSnapshot.macroDirection} />
          <PlanningSignalCard planningLayer={territorialSnapshot.planningLayer} />
          <LiquidityScoreCard liquidity={territorialSnapshot.liquidityProfile} />
          <DevelopmentForecastCard forecast={territorialSnapshot.developmentProbability} />
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-xs text-violet-900">
          ACTIVE proof: {ingestionSnapshot.noFakeActiveProof ? 'PASS' : 'FAIL'}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <ConnectorGovernanceCard governance={ingestionSnapshot.connectorGovernance} />
          <ConnectorHealthCard connectors={ingestionSnapshot.connectors} />
          <RateLimitStatusCard quota={ingestionSnapshot.quota} />
          <IngestionFreshnessCard cacheEnvelope={ingestionSnapshot.cacheEnvelope} />
          <IngestionAuditCard auditTrail={ingestionSnapshot.auditTrail} />
          <SourceTrustCard trust={ingestionSnapshot.trust} />
          <GovernanceRestrictionCard compliance={ingestionSnapshot.compliance} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <TerritorialMonitoringCard monitoring={operationalSnapshot.monitoring} />
          <EvolutionTimelineCard timeline={operationalSnapshot.parcelTimeline} />
          <OpportunitySignalCard opportunity={operationalSnapshot.opportunities?.undervaluedCluster} />
          <StrategicOpportunityCard strategic={operationalSnapshot.opportunities?.strategicOpportunity} />
          <AnomalyDetectionCard anomaly={operationalSnapshot.anomalies?.speculativeAnomaly} />
          <RegionalTransformationCard transformation={operationalSnapshot.regionalTransformation} />
          <InfrastructureExpansionCard expansion={operationalSnapshot.infrastructureHistory} />
          <InvestorAlertCard alert={operationalSnapshot.alerts?.investorAlert} />
          <ForecastDirectionCard forecast={operationalSnapshot.history?.regionalForecast} />
          <HistoricalEvidenceCard archive={operationalSnapshot.history?.archive} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <AutonomousMonitoringCard monitor={autonomySnapshot.autonomy?.autonomy} />
          <AutonomousIntelligenceCard insight={autonomySnapshot.autonomy?.autonomy} />
          <InvestorPriorityCard priority={autonomySnapshot.watchlist?.investor} />
          <WatchlistActivityCard watchlist={autonomySnapshot.watchlist?.aggregate} />
          <ParcelWatchlistCard watch={autonomySnapshot.watchlist?.parcel} />
          <RegionWatchCard watch={autonomySnapshot.watchlist?.region} />
          <IntelligenceFeedCard feed={autonomySnapshot.feeds?.unified} />
          <PortfolioIntelligenceCard portfolio={autonomySnapshot.portfolio?.intelligence} />
          <PortfolioExposureCard exposure={autonomySnapshot.portfolio?.exposure} />
          <StrategicMonitoringCard strategic={autonomySnapshot.strategic?.radar} />
          <StrategicRegionCard region={autonomySnapshot.strategic?.regionMonitor} />
          <RegionalSurveillanceCard surveillance={autonomySnapshot.strategic?.surveillance} />
          <OpportunityPriorityCard opportunity={autonomySnapshot.prioritization?.opportunityMatrix} />
          <GovernedEscalationCard escalation={autonomySnapshot.prioritization?.governedEscalationQueue} />
          <EscalationTimelineCard escalation={autonomySnapshot.prioritization?.governedEscalationQueue} />
          <ReviewQueueCard queue={autonomySnapshot.operations?.reviewQueue} />
          <AutonomousReviewQueueCard queue={autonomySnapshot.operations?.reviewQueue} />
          <SuppressionGovernanceCard suppression={autonomySnapshot.operations?.suppression} />
          <CadenceAndDegradationCard cadence={autonomySnapshot.autonomy?.cadence} degradation={autonomySnapshot.operations?.degradation} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <ExecutionReadinessCard readiness={executionSnapshot.readiness?.readinessEnvelope} />
          <StrategicDirectionCard direction={executionSnapshot.strategy?.direction} />
          <TerritorialRiskCard risk={executionSnapshot.readiness?.riskMatrix} />
          <SimulationOutcomeCard outcome={executionSnapshot.simulation} />
          <OperationalStateCard state={executionSnapshot.operatingSystem?.state} />
          <StrategicExposureCard exposure={executionSnapshot.readiness?.exposure} />
          <ExecutionConstraintCard constraint={executionSnapshot.execution?.constraints} />
          <DecisionConfidenceCard decision={executionSnapshot.decisioning?.confidence} />
          <RegionalCoordinationCard coordination={executionSnapshot.coordination?.regionalCoordination} />
          <TerritorialOperatingSystemCard tos={executionSnapshot} />
        </div>
      </div>
    </div>
  );
}

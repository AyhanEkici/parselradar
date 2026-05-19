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
          No fake ACTIVE proof: {ingestionSnapshot.noFakeActiveProof ? 'PASS' : 'FAIL'}
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
      </div>
    </div>
  );
}

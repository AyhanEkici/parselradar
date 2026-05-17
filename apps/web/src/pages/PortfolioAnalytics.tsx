import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import PortfolioHealthCard from '../components/portfolioAnalytics/PortfolioHealthCard';
import PortfolioDiversificationCard from '../components/portfolioAnalytics/PortfolioDiversificationCard';
import PortfolioBenchmarkCard from '../components/portfolioAnalytics/PortfolioBenchmarkCard';
import PortfolioExposureMapCard from '../components/portfolioAnalytics/PortfolioExposureMapCard';
import PortfolioConcentrationRiskCard from '../components/portfolioAnalytics/PortfolioConcentrationRiskCard';
import PortfolioOpportunityDistributionCard from '../components/portfolioAnalytics/PortfolioOpportunityDistributionCard';
import PortfolioScenarioCard from '../components/portfolioAnalytics/PortfolioScenarioCard';
import PortfolioPerformanceCard from '../components/portfolioAnalytics/PortfolioPerformanceCard';

export default function PortfolioAnalytics() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState<any>(null);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [scenarios, setScenarios] = useState<any>(null);
  const [exposure, setExposure] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const [analyticsData, benchmarkData, scenariosData, exposureData, performanceData] = await Promise.all([
          apiFetch(`investor/portfolio/${id}/analytics`),
          apiFetch(`investor/portfolio/${id}/benchmark`),
          apiFetch(`investor/portfolio/${id}/scenarios`),
          apiFetch(`investor/portfolio/${id}/exposure`),
          apiFetch(`investor/portfolio/${id}/performance`),
        ]);

        setAnalytics(analyticsData);
        setBenchmark(benchmarkData);
        setScenarios(scenariosData);
        setExposure(exposureData);
        setPerformance(performanceData);
      } catch (err: any) {
        setError(err?.error || 'Portfolio analytics yüklenemedi');
      }
    };

    load();
  }, [id]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!analytics || !benchmark || !scenarios || !exposure || !performance) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Portfolio Intelligence</h1>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Truth-state: confidence/freshness/connector/source availability signals inherited from existing analyses and connector state. No fabricated ROI or external market performance.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <PortfolioHealthCard health={analytics.analytics?.health} />
          <PortfolioDiversificationCard diversification={analytics.analytics?.diversification} />
          <PortfolioConcentrationRiskCard concentrationRisk={analytics.analytics?.concentrationRisk} />
          <PortfolioPerformanceCard performance={performance.performance} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <PortfolioBenchmarkCard benchmark={benchmark.benchmark} />
          <PortfolioExposureMapCard exposure={exposure.exposure} />
          <PortfolioOpportunityDistributionCard distribution={analytics.analytics?.opportunityDistribution} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <PortfolioScenarioCard title="Growth Scenario" scenario={scenarios.scenarios?.growthScenario} />
          <PortfolioScenarioCard title="Risk Scenario" scenario={scenarios.scenarios?.riskScenario} />
          <PortfolioScenarioCard title="Liquidity Scenario" scenario={scenarios.scenarios?.liquidityScenario} />
          <PortfolioScenarioCard title="Infrastructure Impact" scenario={scenarios.scenarios?.infrastructureImpactScenario} />
          <PortfolioScenarioCard title="Macro Stress" scenario={scenarios.scenarios?.macroStressScenario} />
          <PortfolioScenarioCard title="Truth State" scenario={analytics.truthState} />
        </div>
      </div>
    </div>
  );
}

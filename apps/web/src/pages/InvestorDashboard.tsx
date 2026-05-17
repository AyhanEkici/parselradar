import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import InvestorSummaryCard from '../components/investor/InvestorSummaryCard';

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
      </div>
    </div>
  );
}

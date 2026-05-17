import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import WorkspaceSummaryCard from '../components/workspace/WorkspaceSummaryCard';
import WorkspaceSignalsCard from '../components/workspace/WorkspaceSignalsCard';
import WorkspaceActivityFeed from '../components/workspace/WorkspaceActivityFeed';

export default function WorkspaceDashboard() {
  const { organizationId } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!organizationId) return;
    apiFetch(`workspace/${organizationId}/dashboard`)
      .then(setData)
      .catch((err) => setError(err?.error || 'Workspace dashboard yüklenemedi'));
  }, [organizationId]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Workspace Dashboard</h1>
          <div className="flex gap-2">
            <Link to={`/workspace/${organizationId}/portfolio`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-white">Portfolio</Link>
            <Link to={`/workspace/${organizationId}/watchlist`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-white">Watchlist</Link>
            <Link to={`/workspace/${organizationId}/activity`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-white">Activity</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <WorkspaceSummaryCard title="Shared Portfolio" value={data.metrics?.portfolioCount || 0} />
          <WorkspaceSummaryCard title="Shared Watchlist" value={data.metrics?.watchlistCount || 0} />
          <WorkspaceSummaryCard title="Shared Analyses" value={data.metrics?.sharedAnalysisCount || 0} />
        </div>

        <WorkspaceSignalsCard signals={data.signals || {}} />
        <WorkspaceActivityFeed items={data.activity?.items || []} />
      </div>
    </div>
  );
}

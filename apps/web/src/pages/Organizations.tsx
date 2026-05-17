import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import OrganizationCard from '../components/organization/OrganizationCard';

export default function Organizations() {
  const [payload, setPayload] = useState<any>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await apiFetch('organizations');
      setPayload(data);
    } catch (err: any) {
      setError(err?.error || 'Organizations yüklenemedi');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createOrganization = async () => {
    if (!name.trim()) return;
    await apiFetch('organizations', { method: 'POST', body: JSON.stringify({ name }) });
    setName('');
    await load();
  };

  const organizations = payload?.organizations || [];
  const summary = payload?.summary || {};

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <h1 className="text-3xl font-bold text-slate-900">Organizations</h1>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-slate-800">Create Organization</div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization name"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button onClick={createOrganization} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Create
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-lg bg-white p-3 text-xs shadow-sm border border-slate-200">Organizations: {summary.organizationCount || 0}</div>
          <div className="rounded-lg bg-white p-3 text-xs shadow-sm border border-slate-200">Members: {summary.totalMembers || 0}</div>
          <div className="rounded-lg bg-white p-3 text-xs shadow-sm border border-slate-200">Shared Analyses: {summary.totalSharedAnalyses || 0}</div>
          <div className="rounded-lg bg-white p-3 text-xs shadow-sm border border-slate-200">Shared Portfolio: {summary.totalWorkspacePortfolios || 0}</div>
          <div className="rounded-lg bg-white p-3 text-xs shadow-sm border border-slate-200">Shared Watchlist: {summary.totalWorkspaceWatchlist || 0}</div>
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {organizations.length === 0 ? (
            <div className="text-sm text-slate-600">No organizations yet.</div>
          ) : (
            organizations.map((organization: any) => (
              <OrganizationCard key={organization._id} organization={organization} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

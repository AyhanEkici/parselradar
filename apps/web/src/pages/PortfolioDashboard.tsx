import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function PortfolioDashboard() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [name, setName] = useState('Main Portfolio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [summary, setSummary] = useState<{ totalValue: number; averageOpportunity: number; staleCount: number }>({
    totalValue: 0,
    averageOpportunity: 0,
    staleCount: 0,
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await apiFetch('investor/portfolio');
      const list = Array.isArray(rows) ? rows : [];
      setPortfolios(list);

      const details = await Promise.all(
        list.map((portfolio: any) => apiFetch(`investor/portfolio/${portfolio._id}`).catch(() => null))
      );

      const validDetails = details.filter(Boolean) as any[];
      const totalValue = validDetails.reduce((sum, detail) => sum + Number(detail?.exposure?.totalValueTRY || 0), 0);
      const averageOpportunity = validDetails.length
        ? Math.round(
            validDetails.reduce((sum, detail) => sum + Number(detail?.opportunity?.averageOpportunity || 0), 0) /
              validDetails.length
          )
        : 0;
      const staleCount = validDetails.reduce((sum, detail) => sum + Number(detail?.opportunity?.staleIntelligenceCount || 0), 0);
      setSummary({ totalValue, averageOpportunity, staleCount });
    } catch (err: any) {
      setError(err?.error || err?.message || 'Portfolio verileri yÃ¼klenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createPortfolio = async () => {
    setCreating(true);
    setError('');
    try {
      await apiFetch('investor/portfolio', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      await load();
    } catch (err: any) {
      setError(err?.error || err?.message || 'Portfolio oluÅŸturulamadÄ±');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Portfolio Dashboard</h1>
        <Link to="/map/portfolio" className="inline-flex rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Open Portfolio Map</Link>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">Toplam DeÄŸer: {new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(summary.totalValue)}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">Ortalama FÄ±rsat Skoru: {summary.averageOpportunity}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">Stale Intelligence: {summary.staleCount}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-slate-800">Create Portfolio</div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              P2_1C_TRIAGED_BACKLOG="Portfolio name"
            />
            <button
              onClick={createPortfolio}
              disabled={creating}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        {loading ? <div className="text-sm text-slate-600">Portfolio verileri yÃ¼kleniyor...</div> : null}

        <div className="grid gap-3">
          {!loading && portfolios.length === 0 ? (
            <div className="text-sm text-slate-600">No portfolio yet.</div>
          ) : (
            portfolios.map((portfolio) => (
              <Link
                key={portfolio._id}
                to={`/investor/portfolio/${portfolio._id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300"
              >
                <div className="text-sm font-semibold text-slate-900">{portfolio.name}</div>
                <div className="mt-1 text-xs text-slate-600">Items: {portfolio.itemCount || 0}</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

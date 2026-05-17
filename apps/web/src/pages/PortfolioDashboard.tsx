import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function PortfolioDashboard() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [name, setName] = useState('Main Portfolio');

  const load = async () => {
    const rows = await apiFetch('investor/portfolio');
    setPortfolios(Array.isArray(rows) ? rows : []);
  };

  useEffect(() => {
    load();
  }, []);

  const createPortfolio = async () => {
    await apiFetch('investor/portfolio', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    await load();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Portfolio Dashboard</h1>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-slate-800">Create Portfolio</div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Portfolio name"
            />
            <button
              onClick={createPortfolio}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Create
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {portfolios.length === 0 ? (
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

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import WatchlistItemCard from '../components/investor/WatchlistItemCard';
import OpportunityBadge from '../components/investor/OpportunityBadge';
import UserScopedNotice from '../components/UserScopedNotice';

export default function Watchlist() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const rows = await apiFetch('investor/watchlist');
      setItems(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      setError(err?.error || 'Watchlist yüklenemedi');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    await apiFetch(`investor/watchlist/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Watchlist</h1>
        <UserScopedNotice />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        {items.length === 0 ? <div className="text-sm text-slate-600">No watchlist items yet.</div> : null}
        {items.map((item) => (
          <div key={item._id} className="space-y-2">
            <WatchlistItemCard item={item} onRemove={remove} />
            <OpportunityBadge score={item.latestAnalysis?.opportunityScore || 0} />
          </div>
        ))}
      </div>
    </div>
  );
}

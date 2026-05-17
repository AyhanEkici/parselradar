import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import SharedWatchlistCard from '../components/workspace/SharedWatchlistCard';

export default function WorkspaceWatchlist() {
  const { organizationId } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!organizationId) return;
    apiFetch(`workspace/${organizationId}/watchlist`)
      .then(setData)
      .catch((err) => setError(err?.error || 'Workspace watchlist yüklenemedi'));
  }, [organizationId]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Workspace Shared Watchlist</h1>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(data.rows || []).length === 0 ? (
            <div className="text-sm text-slate-600">No shared watchlist entries.</div>
          ) : (
            (data.rows || []).map((row: any) => <SharedWatchlistCard key={row._id} row={row} />)
          )}
        </div>
      </div>
    </div>
  );
}

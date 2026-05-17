import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import SavedAnalysisCard from '../components/investor/SavedAnalysisCard';
import ConfidenceFreshnessTag from '../components/investor/ConfidenceFreshnessTag';

export default function SavedAnalyses() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const rows = await apiFetch('investor/saved-analyses');
      setItems(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      setError(err?.error || 'Saved analyses yüklenemedi');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    await apiFetch(`investor/saved-analyses/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Saved Analyses</h1>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        {items.length === 0 ? <div className="text-sm text-slate-600">No saved analyses yet.</div> : null}
        {items.map((item) => (
          <div key={item._id} className="space-y-2">
            <SavedAnalysisCard item={item} onRemove={remove} />
            <ConfidenceFreshnessTag
              sourceConfidence={item.sourceConfidence}
              freshnessScore={item.freshnessScore}
              analysisVersion={item.analysisVersion}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

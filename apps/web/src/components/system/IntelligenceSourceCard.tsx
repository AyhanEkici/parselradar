import React from 'react';

type Props = {
  ingestionSignals?: string[];
  refreshReason?: string;
};

export const IntelligenceSourceCard: React.FC<Props> = ({ ingestionSignals = [], refreshReason }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Intelligence Sources</h3>
      <p className="mt-1 text-xs text-slate-600">Current refresh lineage and ingestion channels</p>
      <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-sm text-slate-800">
        Refresh reason: {refreshReason || 'manual_analysis'}
      </div>
      <div className="mt-3 space-y-2">
        {ingestionSignals.map((signal) => (
          <div key={signal} className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-700">
            {signal.replace(/_/g, ' ')}
          </div>
        ))}
      </div>
    </div>
  );
};

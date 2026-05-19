import React from 'react';

export default function OpportunitySignalCard({ opportunity }: { opportunity?: { level?: string; strategicScore?: number; score?: number } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Opportunity Signal</h3>
      <p className="mt-1 text-xs text-slate-700">Level: {opportunity?.level || '-'}</p>
      <p className="text-xs text-slate-700">Score: {opportunity?.strategicScore ?? opportunity?.score ?? '-'}</p>
    </div>
  );
}

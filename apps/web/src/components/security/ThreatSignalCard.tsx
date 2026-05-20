import React from 'react';

export default function ThreatSignalCard({ threat }: { threat?: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Threat Signal</h3>
      <p className="mt-2 text-xs text-slate-700">Level: {threat?.threatLevel || '-'}</p>
      <p className="text-xs text-slate-700">Score: {threat?.score ?? threat?.compositeScore ?? '-'}</p>
    </div>
  );
}

import React from 'react';

export default function StrategicOpportunityCard({ strategic }: { strategic?: { level?: string; strategicScore?: number; noGuaranteeImplied?: boolean } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Strategic Opportunity</h3>
      <p className="mt-1 text-xs text-slate-700">Level: {strategic?.level || '-'}</p>
      <p className="text-xs text-slate-700">Score: {strategic?.strategicScore ?? '-'}</p>
      <p className="text-xs text-slate-600">No guarantee: {strategic?.noGuaranteeImplied ? 'Yes' : 'No'}</p>
    </div>
  );
}

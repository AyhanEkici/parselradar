import React from 'react';

export default function MissingDataImpactCard({
  missingDataImpact,
  penaltyReasons,
}: {
  missingDataImpact?: number;
  penaltyReasons?: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Missing Data Impact</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{Math.max(0, Math.min(100, Number(missingDataImpact || 0)))}</div>
      <ul className="mt-2 space-y-1 text-sm text-slate-600">
        {(penaltyReasons || []).length === 0 ? <li>• No penalties recorded.</li> : (penaltyReasons || []).map((reason, idx) => <li key={`${idx}-${reason.slice(0, 10)}`}>• {reason}</li>)}
      </ul>
    </div>
  );
}

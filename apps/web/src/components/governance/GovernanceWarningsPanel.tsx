import React from 'react';

export default function GovernanceWarningsPanel({
  unsupportedAssumptions,
  speculativeIndicators,
}: {
  unsupportedAssumptions?: string[];
  speculativeIndicators?: string[];
}) {
  const unsupported = unsupportedAssumptions || [];
  const speculative = speculativeIndicators || [];
  if (unsupported.length === 0 && speculative.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        No prohibited-claim wording or speculative warning detected.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">Governance Warnings</div>
      <ul className="mt-2 space-y-1 text-sm text-rose-900">
        {unsupported.map((item, idx) => (
          <li key={`u-${idx}`}>• {item}</li>
        ))}
        {speculative.map((item, idx) => (
          <li key={`s-${idx}`}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

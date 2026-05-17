import React from 'react';

type Props = {
  runtimeWarnings?: string[];
};

export function RuntimeWarningsCard({ runtimeWarnings = [] }: Props) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Runtime Warnings</div>
      <div className="mt-3 space-y-2 text-xs text-amber-900">
        {runtimeWarnings.length > 0 ? runtimeWarnings.map((warning, idx) => (
          <div key={`${warning}-${idx}`} className="rounded border border-amber-200 bg-white p-2">{warning}</div>
        )) : <div className="text-amber-700">No runtime warnings.</div>}
      </div>
    </div>
  );
}

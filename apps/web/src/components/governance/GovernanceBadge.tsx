import React from 'react';

type Governance = 'SAFE' | 'CAUTION' | 'SPECULATIVE' | 'INSUFFICIENT_DATA' | string;

const toneMap: Record<string, string> = {
  SAFE: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  CAUTION: 'border-amber-300 bg-amber-50 text-amber-900',
  SPECULATIVE: 'border-rose-300 bg-rose-50 text-rose-900',
  INSUFFICIENT_DATA: 'border-slate-300 bg-slate-100 text-slate-800',
};

export default function GovernanceBadge({ classification }: { classification?: Governance }) {
  const value = classification || 'INSUFFICIENT_DATA';
  const tone = toneMap[value] || toneMap.INSUFFICIENT_DATA;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      Governance: {value}
    </span>
  );
}

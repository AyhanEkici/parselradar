import React from 'react';

type Props = { score?: number };

export default function OpportunityBadge({ score = 0 }: Props) {
  const tone = score >= 70 ? 'bg-emerald-100 text-emerald-800' : score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>Opportunity {score}</span>;
}

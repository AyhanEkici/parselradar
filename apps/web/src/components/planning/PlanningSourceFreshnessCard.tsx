import React from 'react';

type Props = {
  freshness?: {
    sourceFreshness?: string;
    freshnessScore?: number;
    staleFlags?: string[];
    lastSuccessfulCheck?: string | null;
    nextRecommendedCheck?: string | null;
  } | null;
};

export default function PlanningSourceFreshnessCard({ freshness }: Props) {
  const score = freshness?.freshnessScore ?? 0;
  const state = freshness?.sourceFreshness || 'UNKNOWN';
  const flags = freshness?.staleFlags || [];

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Planning Source Freshness</div>
      <div className="mt-2 text-2xl font-bold text-emerald-900">{state}</div>
      <div className="mt-1 text-sm text-emerald-900">Freshness score: {score}</div>
      <div className="mt-2 text-xs text-emerald-800">
        Last successful check: {freshness?.lastSuccessfulCheck || 'none'}
      </div>
      <div className="mt-1 text-xs text-emerald-800">
        Next recommended check: {freshness?.nextRecommendedCheck || 'n/a'}
      </div>
      {flags.length > 0 && (
        <div className="mt-3 rounded-md bg-emerald-100 px-3 py-2 text-xs text-emerald-900">
          Flags: {flags.join(', ')}
        </div>
      )}
    </div>
  );
}


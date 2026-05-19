import React from 'react';

type EvidenceStrength = 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERIFIED' | string;

export default function EvidenceStrengthCard({
  evidenceStrength,
  sourcesAvailable,
  sourcesTotal,
}: {
  evidenceStrength?: EvidenceStrength;
  sourcesAvailable?: number;
  sourcesTotal?: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Evidence Strength</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{evidenceStrength || 'VERY_WEAK'}</div>
      <div className="mt-2 text-sm text-slate-600">
        Sources: {sourcesAvailable || 0} / {sourcesTotal || 0}
      </div>
    </div>
  );
}

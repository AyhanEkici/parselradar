import React from 'react';

export default function TrustClassificationCard({
  trustScore,
  compliance,
}: {
  trustScore?: number;
  compliance?: string;
}) {
  const score = Math.max(0, Math.min(100, Number(trustScore || 0)));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">Client Trust</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{score}</div>
      <div className="mt-2 text-sm text-slate-600">Compliance: {compliance || 'REVIEW_REQUIRED'}</div>
    </div>
  );
}

import React from 'react';

export default function RegionalTransformationCard({ transformation }: { transformation?: { direction?: string; transformationScore?: number } }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Regional Transformation</h3>
      <p className="mt-1 text-xs text-slate-700">Direction: {transformation?.direction || '-'}</p>
      <p className="text-xs text-slate-700">Score: {transformation?.transformationScore ?? '-'}</p>
    </div>
  );
}

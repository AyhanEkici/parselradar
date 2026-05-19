import React from 'react';

type EvidenceTraceItem = {
  sourceLabel?: string;
  verificationState?: string;
  reliability?: string;
  freshnessDays?: number;
};

export default function SourceProvenanceCard({ trace }: { trace?: EvidenceTraceItem[] }) {
  const rows = trace || [];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Source Provenance</div>
      <div className="space-y-2 text-sm">
        {rows.length === 0 ? (
          <div className="text-slate-500">No provenance trace available.</div>
        ) : (
          rows.slice(0, 6).map((item, idx) => (
            <div key={`${item.sourceLabel || 'source'}-${idx}`} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="font-medium text-slate-800">{item.sourceLabel}</div>
              <div className="text-xs text-slate-600">
                {item.verificationState} | {item.reliability} | freshness {item.freshnessDays ?? '-'} days
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import React from 'react';

export default function HistoricalEvidenceCard({ archive }: { archive?: { retainedCount?: number; noFabricatedHistory?: boolean; records?: Array<{ at?: string; label?: string; source?: string }> } }) {
  const records = archive?.records || [];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Historical Evidence</h3>
      <p className="mt-1 text-xs text-slate-700">Retained: {archive?.retainedCount ?? '-'}</p>
      <p className="text-xs text-slate-700">No fabricated history: {archive?.noFabricatedHistory ? 'Yes' : 'No'}</p>
      <div className="mt-2 space-y-1 text-xs text-slate-600">
        {records.slice(0, 5).map((record, idx) => (
          <div key={`${record.at}-${idx}`}>{record.at} | {record.label} | {record.source}</div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

export default function LegalClassificationCard({
  disclosures,
}: {
  disclosures?: Array<{ source: string; mode: string; lines: string[] }>;
}) {
  const rows = disclosures || [];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Legal Classification</h3>
      <div className="mt-2 space-y-2">
        {rows.slice(0, 6).map((row) => (
          <div key={row.source} className="rounded bg-gray-50 px-2 py-2 text-xs text-gray-700">
            <div className="font-medium">{row.source}</div>
            <div>{row.mode}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

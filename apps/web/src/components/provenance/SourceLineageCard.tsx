import React from 'react';

type LineageItem = {
  step: number;
  source: string;
  status: string;
  freshnessState: string;
  governanceState: string;
  legalClassification: string;
};

export default function SourceLineageCard({ lineage }: { lineage?: LineageItem[] }) {
  const items = lineage || [];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800">Source Lineage</h3>
      <div className="mt-2 space-y-2">
        {items.slice(0, 6).map((item) => (
          <div key={`${item.step}-${item.source}`} className="rounded bg-gray-50 px-2 py-2 text-xs text-gray-700">
            <span className="font-medium">#{item.step}</span> {item.source} | {item.status} | {item.freshnessState} | {item.governanceState} | {item.legalClassification}
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-gray-500">No lineage attached.</p>}
      </div>
    </div>
  );
}

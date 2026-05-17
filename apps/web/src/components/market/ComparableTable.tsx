import React from 'react';

type ComparableRow = {
  _id: string;
  il?: string;
  ilce?: string;
  zoningStatus?: string;
  areaM2?: number;
  normalizedPricePerM2: number;
  similarityScore: number;
  priceDeltaRatio: number;
  daysSinceCreated: number;
};

type ComparableTableProps = {
  rows?: ComparableRow[];
};

function fmtPpm2(value: number) {
  return `${value.toLocaleString('tr-TR')} TL/m²`;
}

export function ComparableTable({ rows = [] }: ComparableTableProps) {
  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Top Comparables</h3>
        <p className="mt-2 text-sm text-slate-500">No comparable parcels found for this property yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Top Comparables</h3>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Location</th>
              <th className="px-3 py-2 text-left font-semibold">Zoning</th>
              <th className="px-3 py-2 text-right font-semibold">Area</th>
              <th className="px-3 py-2 text-right font-semibold">Price/m²</th>
              <th className="px-3 py-2 text-right font-semibold">Similarity</th>
              <th className="px-3 py-2 text-right font-semibold">Delta</th>
              <th className="px-3 py-2 text-right font-semibold">Recency</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="border-t border-slate-100 text-slate-700">
                <td className="px-3 py-2">{row.ilce || '-'}, {row.il || '-'}</td>
                <td className="px-3 py-2">{row.zoningStatus || '-'}</td>
                <td className="px-3 py-2 text-right">{typeof row.areaM2 === 'number' ? `${row.areaM2.toLocaleString('tr-TR')} m²` : '-'}</td>
                <td className="px-3 py-2 text-right">{fmtPpm2(row.normalizedPricePerM2)}</td>
                <td className="px-3 py-2 text-right">{row.similarityScore}%</td>
                <td className="px-3 py-2 text-right">{(row.priceDeltaRatio * 100).toFixed(1)}%</td>
                <td className="px-3 py-2 text-right">{row.daysSinceCreated}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

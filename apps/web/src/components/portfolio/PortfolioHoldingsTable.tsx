import React from 'react';

type Props = {
  items: any[];
  onRemove: (itemId: string) => void;
};

export default function PortfolioHoldingsTable({ items, onRemove }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left">Property</th>
            <th className="px-3 py-2 text-left">Signal</th>
            <th className="px-3 py-2 text-left">Score</th>
            <th className="px-3 py-2 text-left">Opportunity</th>
            <th className="px-3 py-2 text-left">Confidence/Freshness</th>
            <th className="px-3 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-4 text-slate-500">No holdings yet</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="px-3 py-2">{item.property?.addressText || `${item.property?.il || '-'} / ${item.property?.ilce || '-'}`}</td>
                <td className="px-3 py-2">{item.latestAnalysis?.signal || '-'}</td>
                <td className="px-3 py-2">{item.latestAnalysis?.score ?? '-'}</td>
                <td className="px-3 py-2">{item.latestAnalysis?.opportunityScore ?? '-'}</td>
                <td className="px-3 py-2">{item.latestAnalysis?.sourceConfidence || '-'} / {item.latestAnalysis?.freshnessScore ?? '-'}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => onRemove(String(item._id))}
                    className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

import React from 'react';

type Props = {
  item: any;
  onRemove: (id: string) => void;
};

export default function WatchlistItemCard({ item, onRemove }: Props) {
  const property = item.propertySubmissionId || {};
  const latest = item.latestAnalysis || {};

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{property.addressText || `${property.il || '-'} / ${property.ilce || '-'}`}</div>
          <div className="text-xs text-slate-600 mt-1">Signal: {latest.signal || '-'} | Score: {latest.score ?? '-'}</div>
          <div className="text-xs text-slate-600 mt-1">
            Source: {latest.sourceConfidence || '-'} | Freshness: {latest.freshnessScore ?? '-'} | Version: {latest.analysisVersion || '-'}
          </div>
        </div>
        <button
          onClick={() => onRemove(String(item._id))}
          className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

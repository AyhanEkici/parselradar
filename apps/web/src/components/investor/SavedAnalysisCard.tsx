import React from 'react';

type Props = {
  item: any;
  onRemove: (id: string) => void;
};

export default function SavedAnalysisCard({ item, onRemove }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{item.title || 'Saved Analysis'}</div>
          <div className="text-xs text-slate-600 mt-1">Signal: {item.signal || '-'} | Score: {item.score ?? '-'}</div>
          <div className="text-xs text-slate-600 mt-1">
            Confidence: {item.sourceConfidence || '-'} | Freshness: {item.freshnessScore ?? '-'}
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

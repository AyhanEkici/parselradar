import React from 'react';

export default function ActiveLayerToolbar({
  search,
  onSearch,
  selectedOverlayLabel,
  onResetViewport,
  compareMode,
  onCompareMode,
}: {
  search: string;
  onSearch: (value: string) => void;
  selectedOverlayLabel?: string;
  onResetViewport: () => void;
  compareMode: boolean;
  onCompareMode: (value: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          P2_1C_TRIAGED_BACKLOG="Search layers..."
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Active analysis: <span className="font-semibold text-slate-900">{selectedOverlayLabel || 'none'}</span>
        </div>
        <label className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          <input type="checkbox" checked={compareMode} onChange={(event) => onCompareMode(event.target.checked)} />
          multi-layer compare
        </label>
        <button
          type="button"
          onClick={onResetViewport}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          reset viewport
        </button>
      </div>
    </div>
  );
}

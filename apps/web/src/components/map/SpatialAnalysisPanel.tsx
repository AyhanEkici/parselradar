import React from 'react';
import { GeoOverlayItem } from './types';

export default function SpatialAnalysisPanel({
  overlays,
  selectedOverlayId,
  onSelectOverlay,
}: {
  overlays: GeoOverlayItem[];
  selectedOverlayId?: string;
  onSelectOverlay: (overlayId: string) => void;
}) {
  const grouped = overlays.reduce<Record<string, GeoOverlayItem[]>>((acc, overlay) => {
    if (!acc[overlay.overlayType]) acc[overlay.overlayType] = [];
    acc[overlay.overlayType].push(overlay);
    return acc;
  }, {});

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-semibold text-slate-900">Spatial Analysis Linkage</h3>
      <p className="mt-1 text-xs text-slate-600">Reports, analyses, portfolio and organization overlays linked to map objects.</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700">
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">total overlays: {overlays.length}</div>
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">analysis overlays: {grouped.parcel_analysis?.length || 0}</div>
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">investment overlays: {grouped.investment?.length || 0}</div>
        <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">organization overlays: {grouped.organization?.length || 0}</div>
      </div>
      <ul className="mt-3 max-h-64 space-y-2 overflow-auto">
        {overlays.map((overlay) => (
          <li key={overlay.id}>
            <button
              type="button"
              onClick={() => onSelectOverlay(overlay.id)}
              className={`w-full rounded border px-2 py-2 text-left text-xs ${selectedOverlayId === overlay.id ? 'border-blue-300 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              <div className="font-semibold">{overlay.label}</div>
              <div className="mt-1 text-[11px]">{overlay.overlayType.replace(/_/g, ' ')}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

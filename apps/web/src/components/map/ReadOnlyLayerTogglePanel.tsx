import React from 'react';

type LayerItem = {
  id: string;
  title: string;
  service: string;
  projection: string[];
  visibility: boolean;
  opacity: number;
};

export default function ReadOnlyLayerTogglePanel({
  layers,
  onToggle,
  onOpacity,
}: {
  layers: LayerItem[];
  onToggle: (layerId: string, visibility: boolean) => void;
  onOpacity: (layerId: string, opacity: number) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Read-Only Layer Toggles</h3>
      <p className="mt-1 text-xs text-slate-600">Visibility and opacity controls only. No write, edit, or parcel ownership operations.</p>
      <ul className="mt-3 space-y-3">
        {layers.length === 0 ? <li className="text-xs text-slate-500">No layers available.</li> : null}
        {layers.map((layer) => (
          <li key={layer.id} className="rounded border border-slate-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-slate-900">{layer.title}</div>
                <div className="text-xs text-slate-600">{layer.service} | {(layer.projection || []).join(', ') || 'projection unknown'}</div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={layer.visibility}
                  onChange={(e) => onToggle(layer.id, e.target.checked)}
                />
                visible
              </label>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-600">opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={layer.opacity}
                onChange={(e) => onOpacity(layer.id, Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-slate-700">{Math.round(layer.opacity * 100)}%</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
